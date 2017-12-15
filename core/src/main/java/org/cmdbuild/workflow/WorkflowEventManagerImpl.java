package org.cmdbuild.workflow;

import static com.google.common.base.Objects.equal;
import static com.google.common.base.Preconditions.checkArgument;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.ImmutableMap;
import static com.google.common.collect.Iterables.getOnlyElement;
import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;
import static org.apache.commons.lang3.ObjectUtils.defaultIfNull;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.apache.commons.lang3.tuple.Pair;
import org.cmdbuild.common.cache.ClusterEvent;
import org.cmdbuild.common.cache.ClusterMessage;
import org.cmdbuild.common.cache.ClusterMessageConsumer;
import org.cmdbuild.common.cache.ClusterMessageReceiver;
import org.cmdbuild.common.cache.ClusterMessageSender;
import org.cmdbuild.common.cache.ClusterTarget;
import org.cmdbuild.logger.Log;
import org.cmdbuild.workflow.WorkflowPersistence.ForwardingProcessData;
import org.cmdbuild.workflow.WorkflowPersistence.NoProcessData;
import org.cmdbuild.workflow.WorkflowPersistence.ProcessData;
import org.cmdbuild.workflow.event.WorkflowEvent;
import org.cmdbuild.workflow.event.WorkflowEventManager;
import org.cmdbuild.workflow.service.CMWorkflowService;
import org.cmdbuild.workflow.service.WSProcessInstInfo;
import org.cmdbuild.workflow.service.WSProcessInstanceState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

/**
 * Workflow event manager that uses the legacy persistence layer.
 *
 *
 * FIXME: this event manager will store events received, and hold them to be
 * processed later.<br>
 * The call sequence is defined inside {@link AbstractSharkService}, for
 * example in the {@link AbstractSharkService.advanceActivityInstance} method:
 *
 * <pre>
 * {@code
 * 	public void advanceActivityInstance(final String procInstId, final String actInstId) throws CMWorkflowException {
 *		final WMSessionHandle handle = handle();
 *		try {
 *			wapi().changeActivityInstanceState(handle, procInstId, actInstId, WMActivityInstanceState.OPEN_RUNNING);
 *		} catch (final Exception e) {
 *			// Ignore: it might be open-running already...
 *		}
 *		try {
 *			wapi().changeActivityInstanceState(handle, procInstId, actInstId, WMActivityInstanceState.CLOSED_COMPLETED);
 *			updateOperationListener.activityInstanceAdvanced(handle.getId());
 *		} catch (final Exception e) {
 *			updateOperationListener.abortedOperation(handle.getId());
 *			throw new CMWorkflowException(e);
 *		}
 *	}
 * }
 * </pre>
 * 
 * <ol>
 * <li>wapi().changeActivityInstanceState(): this will generate a call towards shark service, which in turn will send back workflow events that will be received by this {@link WorkflowEventManagerImpl};</li>
 * <li>updateOperationListener.activityInstanceAdvanced(handle.getId()): this will process the events received, and synchronize data between shark and cmdbuild</li>
 * </ol>
 * 
 * Proposed refactoring: the {@link AbstractSharkService.advanceActivityInstance} and other similar methods should be modified to work as like this:
 * 
 * <ol>
 * <li>register a listener for the process events, in {@link WorkflowEventManagerImpl}</li>
 * <li>call wpapi, do work; meanwhile the listener will collect events for the workflow</li>
 * <li>un-register the listener; process events collected by the listener (already filtered for the session</li>
 * </ol>
 * 
 * {@link WorkflowEventManagerImpl} will have to be modified to handle registering/unregistering of session-scoped event listeners/collectors at runtime; all events not collected will be discarded and will not clutter the memory.<br>
 * With this change it will be absolutely safe to forward events to all cluster nodes, since all unexpected events will be discarded, unless the application has explicitely registered a listener for them.
 *
 */
public class WorkflowEventManagerImpl implements WorkflowEventManager, ClusterMessageConsumer {

	private final Marker marker = MarkerFactory.getMarker(WorkflowEventManagerImpl.class.getName());
	private final Logger legacyLogger = Log.WORKFLOW;
	private final Logger logger = LoggerFactory.getLogger(getClass());

	private final EventMap emptyEventMap = new EventMap();

	private class EventMap implements Iterable<WorkflowEvent> {
		private final Map<String, WorkflowEvent> events = new HashMap<>();

		public void push(final WorkflowEvent event) {
			final String processInstanceId = event.getProcessInstanceId();
			if (!events.containsKey(processInstanceId)) {
				/*
				 * start events must not be overridden by updates, and they
				 * always come first!
				 */
				events.put(processInstanceId, event);
			} else {
				logger.info("discarding event = {}, we already have a 'start event' for this processInstanceId = {}", event, processInstanceId);
			}
		}

		@Override
		public Iterator<WorkflowEvent> iterator() {
			return events.values().iterator();
		}

	}

	/**
	 * implements a map that stores async events received from shark, so that they may be processed later
	 */
	private class SessionEventMap {
		
		// test with short evict time; in production this might be increased up to, like, 10minutes (just to be on the safe side);
		private final LoadingCache<Integer, EventMap> sessionEvents = CacheBuilder.newBuilder().expireAfterAccess(1, TimeUnit.MINUTES).build(new CacheLoader<Integer, EventMap>() {
			@Override
			public EventMap load(Integer key) throws Exception {
				return new EventMap();
			}
		});

		public void pushEvent(final int sessionId, final WorkflowEvent event) {
			EventMap eventMap = sessionEvents.getUnchecked(sessionId);
			eventMap.push(event);
		}

		public Iterable<WorkflowEvent> pullEvents(final int sessionId) {
			return defaultIfNull(sessionEvents.getIfPresent(sessionId), emptyEventMap);
		}

		private void purgeEvents(int sessionId) {
			sessionEvents.invalidate(sessionId);
		}
	}

	private final WorkflowPersistence persistence;
	private final CMWorkflowService service;
	private final WorkflowTypesConverter typesConverter;
	private final ClusterMessageSender clusterMessageSender;

	private final SessionEventMap sessionEventMap = new SessionEventMap();

	public WorkflowEventManagerImpl(WorkflowPersistence persistence, CMWorkflowService service, WorkflowTypesConverter typesConverter, ClusterMessageSender clusterMessageSender) {
		this.persistence = persistence;
		this.service = service;
		this.typesConverter = typesConverter;
		this.clusterMessageSender = clusterMessageSender;
	}
		
	/**
	 * this method receive messages from other cluster nodes (for event propagation)
	 * @param clusterMessage 
	 */
	@Override
	public void update(ClusterMessage clusterMessage) {
		logger.info("received cluster message = {}", clusterMessage);
		checkArgument(equal(clusterMessage.getEvent(), ClusterEvent.OTHER), "received unsupported cluster message event = %s", clusterMessage.getEvent());
		Pair<Integer, WorkflowEvent> pair = deserializeWorkflowEvent(getOnlyElement(clusterMessage.getParams()));
		logger.info("received event from cluster, sessionId = {} event = {}", pair.getLeft(), pair.getRight());
		pushEvent(pair.getLeft(), pair.getRight(), false);
	}

	/**
	 * this method register the WorkflowEventManager on the ClusterMessageReceiver, so that
	 * it will receive messages from other cluster nodes
	 * @param clusterMessageReceiver 
	 */
	@Override
	public void register(ClusterMessageReceiver clusterMessageReceiver) {
		clusterMessageReceiver.register(this, ClusterTarget.WorkflowEventManager.getTargetId());
	}

	private void pushEventOnCluster(int sessionId, WorkflowEvent event){
		logger.info("pushEventOnCluster sessionId = {} event = {}", sessionId, event);
		clusterMessageSender.safeSend(new ClusterMessage(ClusterTarget.WorkflowEventManager.getTargetId(), ClusterEvent.OTHER, serializeWorkflowEvent(sessionId, event)).withRequireRsvp(true));
	}
	
	//TODO move this somewere else (serialization/deserialization)
	private String serializeWorkflowEvent(int sessionId, WorkflowEvent event){
		return new Gson().toJson(ImmutableMap.of(
				"sessionId", String.valueOf(sessionId),
				"type", event.getType().name(),
				"processDefinitionId", event.getProcessDefinitionId(),
				"processInstanceId", event.getProcessInstanceId()
		));
	}
	
	//TODO move this somewere else (serialization/deserialization)
	private Pair<Integer, WorkflowEvent> deserializeWorkflowEvent(String text) {
		Map<String, String> map = new Gson().fromJson(text, new TypeToken<Map<String, String>>() {
		}.getType());
		return Pair.of(Integer.valueOf(map.get("sessionId")), new WorkflowEvent(WorkflowEvent.Type.valueOf(map.get("type")), map.get("processDefinitionId"), map.get("processInstanceId")));
	}

	@Override
	public synchronized void pushEvent(final int sessionId, final WorkflowEvent event) {
		pushEvent(sessionId, event, true);
	}
	
	private void pushEvent(final int sessionId, final WorkflowEvent event, boolean propagateOnCluster) {
		legacyLogger.info("pushing event '{}' for session '{}'", ToStringBuilder.reflectionToString(event, ToStringStyle.SHORT_PREFIX_STYLE), sessionId);
		logger.info("pushing event = {} sessionId = {}", event, sessionId);
		sessionEventMap.pushEvent(sessionId, event);
		if (propagateOnCluster) {
			pushEventOnCluster(sessionId, event);
		}
	}

	@Override
	public synchronized void processEvents(final int sessionId) throws CMWorkflowException {
		legacyLogger.info(marker, "processing events for session '{}'", sessionId);
		logger.info("processing events for sessionId = {}", sessionId);
		for (final WorkflowEvent event : sessionEventMap.pullEvents(sessionId)) {
			logger.debug("processing event = {}", event);
			final WSProcessInstInfo procInstInfo = service.getProcessInstance(event.getProcessInstanceId());
			final CMProcessInstance processInstance = findOrCreateProcessInstance(event, procInstInfo);
			if (processInstance != null) {
				ProcessSynchronizer.of(service, persistence, typesConverter).syncProcessStateActivitiesAndVariables(processInstance, procInstInfo);
			}
		}
		purgeEvents(sessionId);
	}

	private WSProcessInstInfo fakeClosedProcessInstanceInfo(final WorkflowEvent event) {
		return new WSProcessInstInfo() {

			@Override
			public String getProcessDefinitionId() {
				return event.getProcessDefinitionId();
			}

			@Override
			public String getPackageId() {
				throw new UnsupportedOperationException("No information");
			}

			@Override
			public String getPackageVersion() {
				throw new UnsupportedOperationException("No information");
			}

			@Override
			public String getProcessInstanceId() {
				return event.getProcessInstanceId();
			}

			@Override
			public WSProcessInstanceState getStatus() {
				return WSProcessInstanceState.COMPLETED;
			}
		};
	}

	private CMProcessInstance findOrCreateProcessInstance(final WorkflowEvent event,
			final WSProcessInstInfo procInstInfo) throws CMWorkflowException {
		switch (event.getType()) {
		case START:
			return persistence.createProcessInstance(procInstInfo, new ForwardingProcessData() {

				private final ProcessData delegate = NoProcessData.getInstance();

				@Override
				protected ProcessData delegate() {
					return delegate;
				}

				@Override
				public WSProcessInstanceState state() {
					return WSProcessInstanceState.OPEN;
				}

				@Override
				public WSProcessInstInfo processInstanceInfo() {
					return procInstInfo;
				}

			});
		case UPDATE:
			final WSProcessInstInfo info = (procInstInfo == null) ? fakeClosedProcessInstanceInfo(event) : procInstInfo;
			return persistence.findProcessInstance(info);
		default:
			throw new IllegalArgumentException("Invalid event type");
		}
	}

	
	@Override
	public synchronized void purgeEvents(final int sessionId) {
		sessionEventMap.purgeEvents(sessionId);
	}
}

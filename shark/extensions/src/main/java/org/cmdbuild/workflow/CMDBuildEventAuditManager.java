package org.cmdbuild.workflow;

import static com.google.common.reflect.Reflection.newProxy;
import static java.lang.String.format;
import static org.cmdbuild.workflow.Constants.PROCESS_CARD_ID_VARIABLE;
import static org.cmdbuild.workflow.Constants.PROCESS_CLASSNAME_VARIABLE;
import static org.enhydra.shark.api.client.wfmc.wapi.WMProcessInstanceState.OPEN_NOTRUNNING_SUSPENDED;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import org.cmdbuild.services.soap.AbstractWorkflowEvent;
import org.cmdbuild.services.soap.Private;
import org.cmdbuild.services.soap.ProcessStartEvent;
import org.cmdbuild.services.soap.ProcessUpdateEvent;
import org.cmdbuild.workflow.CusSoapProxyBuilder.Configuration;
import org.cmdbuild.workflow.api.MonostateSelfSuspensionRequestHolder;
import org.cmdbuild.workflow.api.SoapSharkWorkflowApiFactory.CusProperties;
import org.enhydra.shark.Shark;
import org.enhydra.shark.api.client.wfmc.wapi.WMAttribute;
import org.enhydra.shark.api.internal.working.CallbackUtilities;

import com.google.common.base.Optional;
import com.google.common.reflect.AbstractInvocationHandler;

/**
 * EventAuditManager that notifies CMDBuild through web services.
 */
public class CMDBuildEventAuditManager extends DelegatingEventAuditManager {

	static class WSEventNotifier implements SimpleEventManager {

		private final Private proxy;
		private final CallbackUtilities cus;

		protected WSEventNotifier(final Private proxy, final CallbackUtilities cus) {
			this.proxy = proxy;
			this.cus = cus;
		}

		@Override
		public void processStarted(final ProcessInstance processInstance) {
			cus.info(null, format("process '%s' started", //
					processInstance.getProcessDefinitionId()));
			sendProcessStartEvent(processInstance);
		}

		@Override
		public void processClosed(final ProcessInstance processInstance) {
			cus.info(null, format("process '%s' closed", //
					processInstance.getProcessDefinitionId()));
			sendProcessUpdateEvent(processInstance);
		}

		@Override
		public void processSuspended(final ProcessInstance processInstance) {
			cus.info(null, format("process '%s' suspended", //
					processInstance.getProcessDefinitionId()));
			sendProcessUpdateEvent(processInstance);
		}

		@Override
		public void processResumed(final ProcessInstance processInstance) {
			cus.info(null, format("process '%s' resumed", //
					processInstance.getProcessDefinitionId()));
			sendProcessUpdateEvent(processInstance);
		}

		@Override
		public void activityStarted(final ActivityInstance activityInstance) {
			cus.info(null, format("activity '%s' started", //
					activityInstance.getActivityDefinitionId()));
			sendProcessUpdateEventIfNoImpl(activityInstance);
		}

		@Override
		public void activityClosed(final ActivityInstance activityInstance) {
			cus.info(null, format("activity '%s' closed", //
					activityInstance.getActivityDefinitionId()));
			sendProcessUpdateEventIfNoImpl(activityInstance);
		}

		private void sendProcessUpdateEventIfNoImpl(final ActivityInstance activityInstance) {
			if (activityInstance.isNoImplementationActivity()) {
				cus.info(null, format("sending notification for activity '%s'", //
						activityInstance.getActivityDefinitionId()));
				sendProcessUpdateEvent(activityInstance);

				final Optional<String> processClass = processClass(activityInstance);
				final Optional<Long> processId = processId(activityInstance);
				if (processClass.isPresent() && processId.isPresent()) {
					if (new MonostateSelfSuspensionRequestHolder().remove(processId.get())) {
						try {
							/*
							 * Calling CMDBuild API for suspend current process
							 * will result in an error because process's state
							 * is not "stable" at the moment. So that we must
							 * call Shark API.
							 */
							Shark.getInstance().getWAPIConnection().changeProcessInstanceState(
									activityInstance.getSessionHandle(), activityInstance.getProcessInstanceId(),
									OPEN_NOTRUNNING_SUSPENDED);
						} catch (final Exception e) {
							cus.error( //
									activityInstance.getSessionHandle(), //
									format("cannot suspend the current process: %s", //
											activityInstance.getProcessInstanceId()), //
									e);
						}
					}
				}
			}
		}

		private void sendProcessUpdateEvent(final ProcessInstance processInstance) {
			cus.info(null, format("sending notification for update of process '%s'", //
					processInstance.getProcessDefinitionId()));
			final AbstractWorkflowEvent event = new ProcessUpdateEvent();
			fillEventProperties(processInstance, event);
			proxy.notify(event);
		}

		private void sendProcessStartEvent(final ProcessInstance processInstance) {
			cus.info(null, format("sending notification for start of process '%s'", //
					processInstance.getProcessDefinitionId()));
			final AbstractWorkflowEvent event = new ProcessStartEvent();
			fillEventProperties(processInstance, event);
			proxy.notify(event);
		}

		private void fillEventProperties(final ProcessInstance processInstance,
				final AbstractWorkflowEvent workflowEvent) {
			final int sessionId = processInstance.getSessionHandle().getId();
			workflowEvent.setSessionId(sessionId);
			workflowEvent.setProcessDefinitionId(processInstance.getProcessDefinitionId());
			workflowEvent.setProcessInstanceId(processInstance.getProcessInstanceId());
		}

		private Optional<String> processClass(final ProcessInstance processInstance) {
			try {
				final WMAttribute attribute = Shark.getInstance().getWAPIConnection().getProcessInstanceAttributeValue(
						processInstance.getSessionHandle(), processInstance.getProcessInstanceId(),
						PROCESS_CLASSNAME_VARIABLE);
				final Object value = attribute.getValue();
				return Optional.of(String.class.cast(value));
			} catch (final Throwable e) {
				return Optional.absent();
			}
		}

		private Optional<Long> processId(final ProcessInstance processInstance) {
			try {
				final WMAttribute attribute = Shark.getInstance().getWAPIConnection().getProcessInstanceAttributeValue(
						processInstance.getSessionHandle(), processInstance.getProcessInstanceId(),
						PROCESS_CARD_ID_VARIABLE);
				final Object value = attribute.getValue();
				return Optional.of(Number.class.cast(value).longValue());
			} catch (final Throwable e) {
				return Optional.absent();
			}
		}

	}

	@Override
	public void configure(final CallbackUtilities cus) throws Exception {
		super.configure(cus);
		final Private proxy = newProxy(Private.class, new AbstractInvocationHandler() {

			private final Configuration configuration = new CusProperties(cus);
			private volatile boolean initialized;
			private Private value;

			private Private delegate() {
				if (!initialized) {
					synchronized (this) {
						if (!initialized) {
							final Private t = new CusSoapProxyBuilder(configuration).build();
							value = t;
							initialized = true;
							return t;
						}
					}
				}
				return value;
			}

			private synchronized void reset() {
				initialized = false;
			}

			/**
			 * Ugly way for determining if there is a problem with the
			 * management of the session.
			 *
			 * This happens when session management is thinked at the end and
			 * not at the beginning and an adeguate rewrite is not allowed.
			 */
			@Override
			protected Object handleInvocation(final Object proxy, final Method method, final Object[] args)
					throws Throwable {
				try {
					return method.invoke(delegate(), args);
				} catch (final InvocationTargetException e) {
					if (!configuration.isTokenEnabled()) {
						/*
						 * no need to check
						 */
						throw e.getCause();
					}

					try {
						/*
						 * any method that does not modify the server should
						 * work
						 */
						delegate().getUserInfo();
						throw e.getCause();
					} catch (final Exception ignore) {
					}
				}

				try {
					reset();
					return method.invoke(delegate(), args);
				} catch (final InvocationTargetException e) {
					throw e.getCause();
				}
			}

		});
		setEventManager(new WSEventNotifier(proxy, cus));
	}

}

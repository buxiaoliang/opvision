package org.cmdbuild.workflow;

import static java.lang.String.format;

import java.util.HashMap;
import java.util.Map;

import org.cmdbuild.dao.entrytype.CMAttribute;
import org.cmdbuild.logger.Log;
import org.cmdbuild.workflow.WorkflowPersistence.ProcessData;
import org.cmdbuild.workflow.service.CMWorkflowService;
import org.cmdbuild.workflow.service.WSActivityInstInfo;
import org.cmdbuild.workflow.service.WSProcessInstInfo;
import org.cmdbuild.workflow.service.WSProcessInstanceState;
import org.cmdbuild.workflow.user.UserProcessInstance;
import org.slf4j.Logger;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

import com.google.common.collect.Maps;
import org.slf4j.LoggerFactory;

public class ProcessSynchronizer {

	private final Marker legacyLoggerMarker = MarkerFactory.getMarker(ProcessSynchronizer.class.getName());
	private final Logger legacyLogger = Log.WORKFLOW;
	private final Logger logger = LoggerFactory.getLogger(getClass());

	public static ProcessSynchronizer of(final CMWorkflowService service, final WorkflowPersistence persistence,
			final WorkflowTypesConverter typesConverter) {
		return new ProcessSynchronizer(service, persistence, typesConverter);
	}

	private final CMWorkflowService workflowService;
	private final WorkflowPersistence persistence;
	private final WorkflowTypesConverter typesConverter;

	private ProcessSynchronizer(final CMWorkflowService service, final WorkflowPersistence persistence, final WorkflowTypesConverter typesConverter) {
		this.workflowService = service;
		this.persistence = persistence;
		this.typesConverter = typesConverter;
	}

	public UserProcessInstance syncProcessStateActivitiesAndVariables(final CMProcessInstance processInstance, final WSProcessInstInfo processInstanceInfo) throws CMWorkflowException {
		return syncProcessStateActivitiesAndMaybeVariables(processInstance, processInstanceInfo, true);
	}

	public UserProcessInstance syncProcessStateAndActivities(final CMProcessInstance processInstance, final WSProcessInstInfo processInstanceInfo) throws CMWorkflowException {
		return syncProcessStateActivitiesAndMaybeVariables(processInstance, processInstanceInfo, false);
	}

	private UserProcessInstance syncProcessStateActivitiesAndMaybeVariables(final CMProcessInstance processInstance, final WSProcessInstInfo processInstanceInfo, final boolean syncVariables) throws CMWorkflowException {
		legacyLogger.info(legacyLoggerMarker, "synchronizing process state, activities and (maybe) variables");
		logger.info("synchronizing process state, activities and (maybe) variables");

		final Map<String, Object> values = Maps.newHashMap();
		if (syncVariables) {
			legacyLogger.info(legacyLoggerMarker, "synchronizing variables");
			logger.info("synchronizing variables");
			final Map<String, Object> workflowValues = workflowService.getProcessInstanceVariables(processInstance.getProcessInstanceId());
			final Map<String, Object> nativeValues = fromWorkflowValues(workflowValues);
			for (final CMAttribute a : processInstance.getType().getAttributes()) {
				final String attributeName = a.getName();
				final Object newValue = nativeValues.get(attributeName);
				legacyLogger.debug(legacyLoggerMarker, format("synchronizing variable '%s' with value '%s'", attributeName, newValue));
				values.put(attributeName, newValue);
			}
		} else {
			logger.info("variables syncronization not required, skipping");
		}

		final WSProcessInstanceState state;
		final WSActivityInstInfo[] addActivities;
		final WSActivityInstInfo[] activities;
		final WSProcessInstInfo uniqueProcessDefinition;

		if (processInstanceInfo == null) {
			legacyLogger.warn(legacyLoggerMarker, "process instance info is null, setting process as completed (should never happen, but who knows...");
			logger.warn("process instance info is null, setting process as completed (this should not happen)");
			state = WSProcessInstanceState.COMPLETED;
			addActivities = new WSActivityInstInfo[0];
			activities = ProcessData.NO_ACTIVITIES;
			uniqueProcessDefinition = ProcessData.NO_PROCESS_INSTANCE_INFO;
		} else {
			uniqueProcessDefinition = processInstanceInfo;
			addActivities = ProcessData.NO_ACTIVITIES;
			activities = workflowService.findOpenActivitiesForProcessInstance(processInstance.getProcessInstanceId());
			state = processInstanceInfo.getStatus();
			if (state == WSProcessInstanceState.COMPLETED) {
				legacyLogger.info(legacyLoggerMarker, "process is completed, delete if from workflow service");
				logger.info("process state = COMPLETED, delete if from workflow service");
				workflowService.deleteProcessInstance(processInstanceInfo.getProcessInstanceId());
			} else {
				logger.info("process state = {}, nothing to do", state);
			}
		}

		return persistence.updateProcessInstance(processInstance, new ProcessData() {

			@Override
			public Map<String, ?> values() {
				return values;
			}

			@Override
			public WSProcessInstanceState state() {
				return state;
			}

			@Override
			public WSActivityInstInfo[] addActivities() {
				return addActivities;
			}

			@Override
			public WSActivityInstInfo[] activities() {
				return activities;
			}

			@Override
			public WSProcessInstInfo processInstanceInfo() {
				return uniqueProcessDefinition;
			}

		});
	}

	private Map<String, Object> fromWorkflowValues(final Map<String, Object> workflowValues) {
		return fromWorkflowValues(workflowValues, typesConverter);
	}

	/*
	 * FIXME AWFUL pre-release hack
	 */
	public static final Map<String, Object> fromWorkflowValues(final Map<String, Object> workflowValues,
			final WorkflowTypesConverter workflowVariableConverter) {
		final Map<String, Object> nativeValues = new HashMap<>();
		for (final Map.Entry<String, Object> wv : workflowValues.entrySet()) {
			nativeValues.put(wv.getKey(), workflowVariableConverter.fromWorkflowType(wv.getValue()));
		}
		return nativeValues;
	}

}

package org.cmdbuild.workflow;

import static java.util.Arrays.asList;
import static java.util.stream.Collectors.toList;

public enum ProcessAttributes {

	ProcessInstanceId("ProcessCode"), //
	FlowStatus("FlowStatus"), //
	ActivityInstanceId("ActivityInstanceId"), //
	CurrentActivityPerformers("NextExecutor"), //
	AllActivityPerformers("PrevExecutors"), //
	UniqueProcessDefinition("UniqueProcessDefinition"), //
	ActivityDefinitionId("ActivityDefinitionId"), //
	;

	public static Iterable<String> columnNames() {
		return asList(values()).stream() //
				.map(input -> input.dbColumnName()) //
				.collect(toList());
	}

	private final String columnName;

	ProcessAttributes(final String columnName) {
		this.columnName = columnName;
	}

	@Override
	public String toString() {
		return columnName;
	}

	public String dbColumnName() {
		return columnName;
	}

}

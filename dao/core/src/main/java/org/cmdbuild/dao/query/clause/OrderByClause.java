package org.cmdbuild.dao.query.clause;

public class OrderByClause {

	public static enum Direction {

		ASC, //
		DESC, //
		;

	}

	private final QueryAttribute attribute;
	private final Direction direction;

	public OrderByClause(final QueryAttribute attribute, final Direction direction) {
		this.attribute = attribute;
		this.direction = direction;
	}

	public QueryAttribute getAttribute() {
		return attribute;
	}

	public Direction getDirection() {
		return direction;
	}

}

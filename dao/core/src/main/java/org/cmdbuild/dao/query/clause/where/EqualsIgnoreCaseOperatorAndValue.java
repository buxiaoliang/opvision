package org.cmdbuild.dao.query.clause.where;

public class EqualsIgnoreCaseOperatorAndValue implements OperatorAndValue {

	private final Object value;

	EqualsIgnoreCaseOperatorAndValue(final Object value) {
		this.value = value;
	}

	@Override
	public void accept(final OperatorAndValueVisitor visitor) {
		visitor.visit(this);
	}

	public Object getValue() {
		return value;
	}

}

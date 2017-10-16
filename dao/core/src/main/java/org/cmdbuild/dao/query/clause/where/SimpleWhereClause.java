package org.cmdbuild.dao.query.clause.where;

import static org.apache.commons.lang3.builder.ToStringBuilder.reflectionToString;
import static org.apache.commons.lang3.builder.ToStringStyle.SHORT_PREFIX_STYLE;

import org.apache.commons.lang3.Validate;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.cmdbuild.dao.query.clause.QueryAttribute;

public class SimpleWhereClause implements WhereClause {

	public static class Builder implements org.apache.commons.lang3.builder.Builder<SimpleWhereClause> {

		private QueryAttribute attribute;
		private OperatorAndValue operator;
		private String attributeNameCast;

		/**
		 * Use factory method.
		 */
		private Builder() {
		}

		@Override
		public SimpleWhereClause build() {
			Validate.notNull(attribute, "missing attribute");
			Validate.notNull(operator, "missing operatorand value");
			return new SimpleWhereClause(this);
		}

		public Builder withAttribute(final QueryAttribute value) {
			attribute = value;
			return this;
		}

		public Builder withOperatorAndValue(final OperatorAndValue value) {
			operator = value;
			return this;
		}

		public Builder withAttributeNameCast(final String value) {
			attributeNameCast = value;
			return this;
		}

	}

	public static Builder newInstance() {
		return new Builder();
	}

	private final QueryAttribute attribute;
	private final OperatorAndValue operator;
	private final String attributeNameCast;

	private SimpleWhereClause(final Builder builder) {
		this.attribute = builder.attribute;
		this.operator = builder.operator;
		this.attributeNameCast = builder.attributeNameCast;
	}

	@Override
	public void accept(final WhereClauseVisitor visitor) {
		visitor.visit(this);
	}

	public QueryAttribute getAttribute() {
		return attribute;
	}

	public OperatorAndValue getOperator() {
		return operator;
	}

	public String getAttributeNameCast() {
		return attributeNameCast;
	}

	@Override
	public boolean equals(final Object obj) {
		if (obj == this) {
			return true;
		}
		if (!(obj instanceof SimpleWhereClause)) {
			return false;
		}
		final SimpleWhereClause other = SimpleWhereClause.class.cast(obj);
		return new EqualsBuilder() //
				.append(attribute, other.attribute) //
				.append(operator, other.operator) //
				.append(attributeNameCast, other.attributeNameCast) //
				.isEquals();
	}

	@Override
	public int hashCode() {
		return new HashCodeBuilder() //
				.append(attribute) //
				.append(operator) //
				.append(attributeNameCast) //
				.toHashCode();
	}

	@Override
	public String toString() {
		return reflectionToString(this, SHORT_PREFIX_STYLE);
	}

	public static WhereClause condition(final QueryAttribute attribute, final OperatorAndValue operator) {
		return newInstance() //
				.withAttribute(attribute) //
				.withOperatorAndValue(operator) //
				.build();
	}

}

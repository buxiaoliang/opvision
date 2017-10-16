package org.cmdbuild.dao.query.clause;

import static org.apache.commons.lang3.builder.ToStringBuilder.reflectionToString;
import static org.apache.commons.lang3.builder.ToStringStyle.SHORT_PREFIX_STYLE;
import static org.cmdbuild.dao.query.clause.alias.Aliases.canonical;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.cmdbuild.dao.entrytype.CMAttribute;
import org.cmdbuild.dao.entrytype.CMEntryType;
import org.cmdbuild.dao.query.clause.alias.Alias;

public class QueryAliasAttribute implements QueryAttribute {
	
	public static QueryAliasAttribute attribute(final CMEntryType type, final CMAttribute attribute) {
		return attribute(type, attribute.getName());
	}

	public static QueryAliasAttribute attribute(final CMEntryType type, final String name) {
		return attribute(canonical(type), name);
	}

	public static QueryAliasAttribute attribute(final Alias entryTypeAlias, final CMAttribute attribute) {
		return attribute(entryTypeAlias, attribute.getName());
	}

	public static QueryAliasAttribute attribute(final Alias entryTypeAlias, final String name) {
		return new QueryAliasAttribute(entryTypeAlias, name);
	}

	private final Alias alias;
	private final String name;

	QueryAliasAttribute(final Alias alias, final String name) {
		this.alias = alias;
		this.name = name;
	}

	@Override
	public void accept(final QueryAttributeVisitor visitor) {
		visitor.visit(this);
	}

	@Override
	public Alias getAlias() {
		return alias;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public boolean equals(final Object obj) {
		if (obj == this) {
			return true;
		}
		if (!(obj instanceof QueryAliasAttribute)) {
			return false;
		}
		final QueryAliasAttribute other = QueryAliasAttribute.class.cast(obj);
		return new EqualsBuilder() //
				.append(alias, other.alias) //
				.append(name, other.name) //
				.isEquals();
	}

	@Override
	public int hashCode() {
		return new HashCodeBuilder() //
				.append(alias) //
				.append(name) //
				.toHashCode();
	}

	@Override
	public String toString() {
		return reflectionToString(this, SHORT_PREFIX_STYLE);
	}

}

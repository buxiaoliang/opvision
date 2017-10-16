package org.cmdbuild.dao.query.clause;

import static org.cmdbuild.dao.query.clause.QueryAliasAttribute.attribute;

import org.cmdbuild.dao.entrytype.CMAttribute;
import org.cmdbuild.dao.entrytype.CMEntryType;

import com.google.common.base.Function;

public class Functions {

	public static final Function<QueryAttribute, String> name() {
		return new Function<QueryAttribute, String>() {

			@Override
			public String apply(final QueryAttribute input) {
				return input.getName();
			}

		};
	}

	private static class ToQueryAliasAttributeWithAlias implements Function<CMAttribute, QueryAliasAttribute> {

		private final org.cmdbuild.dao.query.clause.alias.Alias alias;

		public ToQueryAliasAttributeWithAlias(final org.cmdbuild.dao.query.clause.alias.Alias alias) {
			this.alias = alias;
		}

		@Override
		public QueryAliasAttribute apply(final CMAttribute input) {
			return attribute(alias, input);
		}

	}

	public static Function<CMAttribute, QueryAliasAttribute> queryAliasAttribute(
			final org.cmdbuild.dao.query.clause.alias.Alias alias) {
		return new ToQueryAliasAttributeWithAlias(alias);
	}

	private static class ToQueryAliasAttributeWithEntryType implements Function<CMAttribute, QueryAliasAttribute> {

		private final CMEntryType entryType;

		public ToQueryAliasAttributeWithEntryType(final CMEntryType entryType) {
			this.entryType = entryType;
		}

		@Override
		public QueryAliasAttribute apply(final CMAttribute input) {
			return attribute(entryType, input);
		}

	}

	public static Function<CMAttribute, QueryAliasAttribute> queryAliasAttribute(final CMEntryType entryType) {
		return new ToQueryAliasAttributeWithEntryType(entryType);
	}

	private static class Alias<T extends QueryAttribute>
			implements Function<T, org.cmdbuild.dao.query.clause.alias.Alias> {

		private Alias() {
		}

		@Override
		public org.cmdbuild.dao.query.clause.alias.Alias apply(T input) {
			return input.getAlias();
		}

	}

	@SuppressWarnings("rawtypes")
	private static final Alias ALIAS = new Alias<>();

	@SuppressWarnings("unchecked")
	public static <T extends QueryAttribute> Function<T, org.cmdbuild.dao.query.clause.alias.Alias> alias() {
		return ALIAS;
	}

	private Functions() {
		// prevents instantiation
	}

}

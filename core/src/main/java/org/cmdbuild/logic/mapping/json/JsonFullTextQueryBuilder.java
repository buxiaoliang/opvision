package org.cmdbuild.logic.mapping.json;

import static org.cmdbuild.dao.query.clause.AnyAttribute.anyAttribute;
import static org.cmdbuild.dao.query.clause.where.ContainsOperatorAndValue.contains;

import org.apache.commons.lang3.Validate;
import org.cmdbuild.common.Builder;
import org.cmdbuild.dao.entrytype.CMEntryType;
import org.cmdbuild.dao.query.clause.alias.Alias;
import org.cmdbuild.dao.query.clause.where.SimpleWhereClause;
import org.cmdbuild.dao.query.clause.where.WhereClause;

/**
 * Creates a WhereClause starting from a full text query filter. This means that
 * it searches if the text is in almost one of all the attributes of the
 * specified class
 */
public class JsonFullTextQueryBuilder implements Builder<WhereClause> {

	public static JsonFullTextQueryBuilder newInstance() {
		return new JsonFullTextQueryBuilder();
	}

	private String fullTextQuery;
	private CMEntryType entryType;
	private Alias entryTypeAlias;

	private JsonFullTextQueryBuilder() {
		// use factory method
	}

	public JsonFullTextQueryBuilder withFullTextQuery(final String fullTextQuery) {
		this.fullTextQuery = fullTextQuery;
		return this;
	}

	public JsonFullTextQueryBuilder withEntryType(final CMEntryType entryType) {
		this.entryType = entryType;
		return this;
	}

	public JsonFullTextQueryBuilder withEntryTypeAlias(final Alias entryTypeAlias) {
		this.entryTypeAlias = entryTypeAlias;
		return this;
	}

	@Override
	public WhereClause build() {
		validate();
		return doBuild();
	}

	private void validate() {
		Validate.notNull(fullTextQuery, "missing full-text query");
		Validate.notNull(entryType, "missing entry type");
	}

	private WhereClause doBuild() {
		// TODO remove implementation detail
		return SimpleWhereClause.newInstance() //
				.withAttribute((entryTypeAlias == null) ? anyAttribute(entryType) : anyAttribute(entryTypeAlias)) //
				.withOperatorAndValue(contains(fullTextQuery)) //
				.withAttributeNameCast("varchar") //
				.build();
	}

}

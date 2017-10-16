package org.cmdbuild.dao.query;

import java.util.Map;

import org.apache.commons.lang3.builder.Builder;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMEntryType;
import org.cmdbuild.dao.query.clause.OrderByClause.Direction;
import org.cmdbuild.dao.query.clause.QueryAttribute;
import org.cmdbuild.dao.query.clause.QueryDomain.Source;
import org.cmdbuild.dao.query.clause.alias.Alias;
import org.cmdbuild.dao.query.clause.join.Over;
import org.cmdbuild.dao.query.clause.where.WhereClause;

/**
 * Builder for {@link QuerySpecs}.
 */
public interface QuerySpecsBuilder extends Builder<QuerySpecs> {

	QuerySpecsBuilder select(QueryAttribute... attrDef);

	QuerySpecsBuilder distinct();

	QuerySpecsBuilder _from(CMEntryType entryType, Alias alias);

	QuerySpecsBuilder from(CMEntryType fromEntryType, Alias fromAlias);

	QuerySpecsBuilder from(CMClass cmClass);

	/*
	 * TODO: Consider more join levels (join with join tables)
	 */
	QuerySpecsBuilder join(CMClass joinClass, Over overClause);

	QuerySpecsBuilder join(CMClass joinClass, Alias joinClassAlias, Over overClause);

	QuerySpecsBuilder join(CMClass joinClass, Alias joinClassAlias, Over overClause, Source source);

	/*
	 * TODO refactor to have a single join method
	 */
	QuerySpecsBuilder leftJoin(CMClass joinClass, Alias joinClassAlias, Over overClause);

	QuerySpecsBuilder leftJoin(CMClass joinClass, Alias joinClassAlias, Over overClause, Source source);

	QuerySpecsBuilder where(WhereClause clause);

	QuerySpecsBuilder offset(Number offset);

	QuerySpecsBuilder limit(Number limit);

	QuerySpecsBuilder orderBy(QueryAttribute attribute, Direction direction);

	QuerySpecsBuilder orderBy(Map<QueryAttribute, Direction> order);

	QuerySpecsBuilder numbered();

	QuerySpecsBuilder numbered(WhereClause whereClause);

	QuerySpecsBuilder count();

	/**
	 * @deprecated used temporary for performance improvements since it seems
	 *             there is an issue with PostgresSQL queries.
	 */
	@Deprecated
	QuerySpecsBuilder skipDefaultOrdering();

	CMQueryResult run();

}
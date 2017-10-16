package org.cmdbuild.dao.query.clause.join;

import static com.google.common.base.Predicates.and;
import static com.google.common.base.Predicates.not;
import static com.google.common.collect.FluentIterable.from;
import static com.google.common.collect.Iterables.isEmpty;
import static com.google.common.collect.Maps.newHashMap;
import static com.google.common.collect.Sets.newHashSet;
import static org.cmdbuild.dao.entrytype.Deactivable.IsActivePredicate.activeOnes;
import static org.cmdbuild.dao.entrytype.Functions.disabled1;
import static org.cmdbuild.dao.entrytype.Functions.disabled2;
import static org.cmdbuild.dao.entrytype.Predicates.contains;
import static org.cmdbuild.dao.entrytype.Predicates.domain;
import static org.cmdbuild.dao.entrytype.Predicates.domainFor;
import static org.cmdbuild.dao.query.clause.where.OrWhereClause.or;
import static org.cmdbuild.dao.query.clause.where.TrueWhereClause.trueWhereClause;

import java.util.Collection;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.commons.lang3.Validate;
import org.apache.commons.lang3.builder.Builder;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMDomain;
import org.cmdbuild.dao.query.clause.AnyClass;
import org.cmdbuild.dao.query.clause.AnyDomain;
import org.cmdbuild.dao.query.clause.DomainHistory;
import org.cmdbuild.dao.query.clause.QueryDomain;
import org.cmdbuild.dao.query.clause.QueryDomain.Source;
import org.cmdbuild.dao.query.clause.alias.Alias;
import org.cmdbuild.dao.query.clause.where.WhereClause;
import org.cmdbuild.dao.view.CMDataView;

public class JoinClause {

	public static class JoinClauseBuilder implements Builder<JoinClause> {

		private final CMDataView viewForRun;
		private final CMDataView viewForBuild;
		private final CMClass source;

		private Alias targetAlias;
		private Alias domainAlias;
		private final Map<CMClass, WhereClause> targetsWithFilters;
		private final Set<QueryDomain> queryDomains;
		private boolean domainHistory;
		private boolean left;
		private final Map<QueryDomain, Iterable<CMClass>> disabled;

		private JoinClauseBuilder(final CMDataView viewForRun, final CMDataView viewForBuild, final CMClass source) {
			Validate.notNull(source);
			this.viewForRun = viewForRun;
			this.viewForBuild = viewForBuild;
			this.source = source;
			this.queryDomains = newHashSet();
			this.targetsWithFilters = newHashMap();
			this.disabled = newHashMap();
		}

		public JoinClauseBuilder withDomain(CMDomain domain, final Alias domainAlias) {
			Validate.notNull(domain);
			Validate.notNull(domainAlias);
			if (domain instanceof DomainHistory) {
				domain = ((DomainHistory) domain).getCurrent();
				domainHistory = true;
			}
			if (domain instanceof AnyDomain) {
				addAllDomains();
			} else {
				addQueryDomain(new QueryDomain(domain, Source._1));
				addQueryDomain(new QueryDomain(domain, Source._2));
			}
			this.domainAlias = domainAlias;
			return this;
		}

		public JoinClauseBuilder withDomain(final QueryDomain queryDomain, final Alias domainAlias) {
			Validate.notNull(queryDomain);
			Validate.notNull(domainAlias);
			addQueryDomain(queryDomain);
			this.domainAlias = domainAlias;
			return this;
		}

		public JoinClauseBuilder withTarget(final CMClass target, final Alias targetAlias) {
			Validate.notNull(target);
			Validate.notNull(targetAlias);
			/**
			 * Add here the where condition for privilege filters on rows?
			 */
			if (target instanceof AnyClass) {
				addAnyTarget();
			} else {
				addTarget(target);
			}
			this.targetAlias = targetAlias;
			return this;
		}

		public JoinClauseBuilder left() {
			this.left = true;
			return this;
		}

		@Override
		public JoinClause build() {
			return new JoinClause(this);
		}

		private final void addAllDomains() {
			for (final CMDomain domain : from(viewForBuild.findDomains()) //
					.filter(and(activeOnes(), domainFor(source)))) {
				if (domain(disabled1(), not(contains(source.getName()))).apply(domain)) {
					final QueryDomain queryDomain = new QueryDomain(domain, Source._1);
					addQueryDomain(queryDomain);
					final Collection<CMClass> targets = newHashSet();
					domain.getClass2().getLeaves().forEach(input -> {
						if (!input.isActive()) {
							targets.add(input);
						}
					});
					domain.getDisabled2().forEach(input -> {
						targets.add(viewForBuild.findClass(input));
					});
					disabled.put(queryDomain, targets);
				}
				if (domain(disabled2(), not(contains(source.getName()))).apply(domain)) {
					final QueryDomain queryDomain = new QueryDomain(domain, Source._2);
					addQueryDomain(queryDomain);
					final Collection<CMClass> targets = newHashSet();
					domain.getClass1().getLeaves().forEach(input -> {
						if (!input.isActive()) {
							targets.add(input);
						}
					});
					domain.getDisabled1().forEach(input -> {
						targets.add(viewForBuild.findClass(input));
					});
					disabled.put(queryDomain, targets);
				}
			}
		}

		private final void addQueryDomain(final QueryDomain queryDomain) {
			if (queryDomain.getSourceClass().isAncestorOf(source)) {
				queryDomains.add(queryDomain);
			}
		}

		private void addAnyTarget() {
			for (final QueryDomain queryDomain : queryDomains) {
				addTargetLeaves(queryDomain.getTargetClass());
			}
		}

		private void addTarget(final CMClass target) {
			for (final QueryDomain queryDomain : queryDomains) {
				if (queryDomain.getTargetClass().isAncestorOf(target)) {
					addTargetLeaves(target);
				}
			}
		}

		private void addTargetLeaves(final CMClass targetDomainClass) {
			for (final CMClass leaf : targetDomainClass.getLeaves()) {
				final Iterable<? extends WhereClause> whereClauses = viewForRun.getAdditionalFiltersFor(leaf);
				targetsWithFilters.put(leaf, isEmpty(whereClauses) ? trueWhereClause() : or(whereClauses));
			}
		}
	}

	public static final JoinClauseBuilder newJoinClause(final CMDataView viewForRun, final CMDataView viewForBuild,
			final CMClass source) {
		return new JoinClauseBuilder(viewForRun, viewForBuild, source);
	}

	private final Alias targetAlias;
	private final Alias domainAlias;
	private final boolean domainHistory;
	private final boolean left;

	private final Map<CMClass, WhereClause> targetsWithFilters;
	private final Set<QueryDomain> queryDomains;
	private final Map<QueryDomain, Iterable<CMClass>> disabled;

	private JoinClause(final JoinClauseBuilder builder) {
		this.targetAlias = builder.targetAlias;
		this.domainAlias = builder.domainAlias;
		this.targetsWithFilters = builder.targetsWithFilters;
		this.queryDomains = builder.queryDomains;
		this.domainHistory = builder.domainHistory;
		this.left = builder.left;
		this.disabled = builder.disabled;
	}

	public Alias getTargetAlias() {
		return targetAlias;
	}

	public Alias getDomainAlias() {
		return domainAlias;
	}

	public boolean hasTargets() {
		return !targetsWithFilters.isEmpty();
	}

	public Iterable<Entry<CMClass, WhereClause>> getTargets() {
		return targetsWithFilters.entrySet();
	}

	public boolean hasQueryDomains() {
		return !queryDomains.isEmpty();
	}

	public Iterable<QueryDomain> getQueryDomains() {
		return queryDomains;
	}

	public boolean isDomainHistory() {
		return domainHistory;
	}

	public boolean isLeft() {
		return left;
	}

	public Map<QueryDomain, Iterable<CMClass>> getDisabled() {
		return disabled;
	}

}

package org.cmdbuild.dao.query;

import static java.util.Collections.emptyMap;
import static org.apache.commons.lang3.ObjectUtils.defaultIfNull;
import static org.apache.commons.lang3.StringUtils.isNotEmpty;
import static org.cmdbuild.common.Constants.LOOKUP_CLASS_NAME;
import static org.cmdbuild.dao.constants.Cardinality.CARDINALITY_1N;
import static org.cmdbuild.dao.constants.Cardinality.CARDINALITY_N1;
import static org.cmdbuild.dao.entrytype.EntryTypeAnalyzer.inspect;
import static org.cmdbuild.dao.query.ExternalReferenceAliasHandler.EXTERNAL_ATTRIBUTE;
import static org.cmdbuild.dao.query.clause.AnyClass.anyClass;
import static org.cmdbuild.dao.query.clause.Functions.name;
import static org.cmdbuild.dao.query.clause.Predicates.withAlias;
import static org.cmdbuild.dao.query.clause.QueryAliasAttribute.attribute;
import static org.cmdbuild.dao.query.clause.alias.Aliases.canonical;
import static org.cmdbuild.dao.query.clause.alias.Aliases.name;
import static org.cmdbuild.dao.query.clause.where.WhereClauses.alwaysTrue;
import static org.cmdbuild.dao.query.clause.where.WhereClauses.and;
import static org.cmdbuild.dao.query.clause.where.WhereClauses.not;
import static org.cmdbuild.dao.query.clause.where.WhereClauses.or;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.cmdbuild.dao.constants.Cardinality;
import org.cmdbuild.dao.entrytype.CMAttribute;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMDomain;
import org.cmdbuild.dao.entrytype.CMEntryType;
import org.cmdbuild.dao.entrytype.CMEntryTypeVisitor;
import org.cmdbuild.dao.entrytype.CMFunctionCall;
import org.cmdbuild.dao.entrytype.EntryTypeAnalyzer;
import org.cmdbuild.dao.entrytype.ForwardingEntryTypeVisitor;
import org.cmdbuild.dao.entrytype.NullEntryTypeVisitor;
import org.cmdbuild.dao.entrytype.attributetype.CMAttributeType;
import org.cmdbuild.dao.entrytype.attributetype.CMAttributeTypeVisitor;
import org.cmdbuild.dao.entrytype.attributetype.ForeignKeyAttributeType;
import org.cmdbuild.dao.entrytype.attributetype.ForwardingAttributeTypeVisitor;
import org.cmdbuild.dao.entrytype.attributetype.LookupAttributeType;
import org.cmdbuild.dao.entrytype.attributetype.NullAttributeTypeVisitor;
import org.cmdbuild.dao.entrytype.attributetype.ReferenceAttributeType;
import org.cmdbuild.dao.query.clause.AnyAttribute;
import org.cmdbuild.dao.query.clause.ClassHistory;
import org.cmdbuild.dao.query.clause.DomainHistory;
import org.cmdbuild.dao.query.clause.OrderByClause;
import org.cmdbuild.dao.query.clause.OrderByClause.Direction;
import org.cmdbuild.dao.query.clause.QueryAliasAttribute;
import org.cmdbuild.dao.query.clause.QueryAttribute;
import org.cmdbuild.dao.query.clause.QueryAttributeVisitor;
import org.cmdbuild.dao.query.clause.QueryDomain;
import org.cmdbuild.dao.query.clause.QueryDomain.Source;
import org.cmdbuild.dao.query.clause.alias.Alias;
import org.cmdbuild.dao.query.clause.from.ClassFromClause;
import org.cmdbuild.dao.query.clause.from.FromClause;
import org.cmdbuild.dao.query.clause.from.FunctionFromClause;
import org.cmdbuild.dao.query.clause.join.DirectJoinClause;
import org.cmdbuild.dao.query.clause.join.JoinClause;
import org.cmdbuild.dao.query.clause.join.Over;
import org.cmdbuild.dao.query.clause.where.AndWhereClause;
import org.cmdbuild.dao.query.clause.where.EmptyWhereClause;
import org.cmdbuild.dao.query.clause.where.ForwardingWhereClauseVisitor;
import org.cmdbuild.dao.query.clause.where.NotWhereClause;
import org.cmdbuild.dao.query.clause.where.NullWhereClauseVisitor;
import org.cmdbuild.dao.query.clause.where.OrWhereClause;
import org.cmdbuild.dao.query.clause.where.SimpleWhereClause;
import org.cmdbuild.dao.query.clause.where.WhereClause;
import org.cmdbuild.dao.query.clause.where.WhereClauseVisitor;
import org.cmdbuild.dao.view.CMDataView;

import com.google.common.base.Function;
import com.google.common.base.Predicate;
import com.google.common.collect.FluentIterable;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

import net.jcip.annotations.NotThreadSafe;

@NotThreadSafe
// TODO split build and run
public class QuerySpecsBuilderImpl implements QuerySpecsBuilder {

	private static class AliasLibrary {

		private final Set<Alias> aliasSet;
		private CMEntryType fromType;
		private Alias fromAlias;

		AliasLibrary() {
			aliasSet = Sets.newHashSet();
		}

		public void addAlias(final Alias alias) {
			if (aliasSet.contains(alias)) {
				throw new IllegalArgumentException("Duplicate alias");
			}
			aliasSet.add(alias);
		}

		public void setFrom(final CMEntryType type, final Alias alias) {
			this.aliasSet.remove(this.fromAlias);
			addAlias(alias);
			this.fromType = type;
			this.fromAlias = alias;
		}

		public CMEntryType getFrom() {
			return fromType;
		}

		public Alias getFromAlias() {
			return fromAlias;
		}

		public void checkAlias(final Alias alias) {
			if (!aliasSet.contains(alias)) {
				throw new NoSuchElementException("Alias " + alias + " was not found");
			}
		}

		public boolean containsAlias(final Alias alias) {
			return aliasSet.contains(alias);
		}

	}

	private static final Alias DEFAULT_ANYCLASS_ALIAS = name("_*");
	private static final Map<QueryAttribute, Direction> NO_ORDER = emptyMap();

	private Collection<QueryAttribute> attributes;
	private final Collection<JoinClause> joinClauses;
	private final Collection<DirectJoinClause> directJoinClauses;
	private final Map<QueryAttribute, OrderByClause.Direction> orderings;
	private WhereClause whereClause;
	private Long offset;
	private Long limit;
	private boolean distinct;
	private boolean numbered;
	private WhereClause conditionOnNumberedQuery;
	private boolean count;
	private boolean skipDefaultOrdering;

	private final AliasLibrary aliases;

	private final CMDataView viewForBuild;
	private final CMDataView viewForRun;

	public QuerySpecsBuilderImpl(final CMDataView view) {
		this(view, view);
	}

	/**
	 *
	 * @param viewForBuild
	 *            is a the data view for building the query. It must be a system
	 *            view because it must know all attributes, included those for
	 *            which the logged user does not have privileges
	 * @param viewForRun
	 *            is a data view for running the query. It must be a user data
	 *            view
	 */
	public QuerySpecsBuilderImpl(final CMDataView viewForBuild, final CMDataView viewForRun) {
		this.viewForBuild = viewForBuild;
		this.viewForRun = viewForRun;
		aliases = new AliasLibrary();
		select();
		_from(anyClass(), DEFAULT_ANYCLASS_ALIAS);
		joinClauses = Lists.newArrayList();
		directJoinClauses = Lists.newArrayList();
		orderings = Maps.newLinkedHashMap();
		whereClause = EmptyWhereClause.emptyWhereClause();
		conditionOnNumberedQuery = EmptyWhereClause.emptyWhereClause();
	}

	@Override
	public QuerySpecsBuilder select(final QueryAttribute... attrDef) {
		attributes = new HashSet<>();
		for (final QueryAttribute element : attrDef) {
			attributes.add(element);
		}
		return this;
	}

	@Override
	public QuerySpecsBuilder distinct() {
		distinct = true;
		return this;
	}

	@Override
	public QuerySpecsBuilder _from(final CMEntryType entryType, final Alias alias) {
		aliases.setFrom(entryType, alias);
		return this;
	}

	@Override
	public QuerySpecsBuilder from(final CMEntryType fromEntryType, final Alias fromAlias) {
		aliases.setFrom(transform(fromEntryType), fromAlias);
		return this;
	}

	private void addDirectJoinClausesForLookup(final Iterable<CMAttribute> lookupAttributes, //
			final CMEntryType entryType, //
			final Alias entryTypeAlias) {
		final CMClass lookupClass = viewForBuild.findClass(LOOKUP_CLASS_NAME);
		for (final CMAttribute attribute : lookupAttributes) {
			final Alias lookupClassAlias = name(new ExternalReferenceAliasHandler(entryType, attribute).forQuery());
			if (!aliases.containsAlias(lookupClassAlias)) {
				aliases.addAlias(lookupClassAlias);
			}
			final DirectJoinClause lookupJoinClause = DirectJoinClause.newInstance() //
					.leftJoin(lookupClass) //
					.as(lookupClassAlias) //
					.on(attribute(lookupClassAlias, "Id")) //
					.equalsTo(attribute(entryTypeAlias, attribute.getName())) //
					.build();
			directJoinClauses.add(lookupJoinClause);
		}
	}

	private void addDirectJoinClausesForReference(final Iterable<CMAttribute> referenceAttributes, //
			final CMEntryType entryType, //
			final Alias entryTypeAlias) {
		for (final CMAttribute attribute : referenceAttributes) {
			final ReferenceAttributeType attributeType = (ReferenceAttributeType) attribute.getType();
			final CMDomain domain = viewForBuild.findDomain(attributeType.getDomainName());
			final CMClass referencedClass;
			if (domain.getCardinality().equals(Cardinality.CARDINALITY_1N.value())) {
				referencedClass = viewForBuild.findClass(domain.getClass1().getName());
			} else { // CARDINALITY_N1
				referencedClass = viewForBuild.findClass(domain.getClass2().getName());
			}

			final Alias referencedClassAlias = name(new ExternalReferenceAliasHandler(entryType, attribute).forQuery());
			if (!aliases.containsAlias(referencedClassAlias)) {
				aliases.addAlias(referencedClassAlias);
			}
			final DirectJoinClause lookupJoinClause = DirectJoinClause.newInstance() //
					.leftJoin(referencedClass) //
					.as(referencedClassAlias) //
					.on(attribute(referencedClassAlias, "Id")) //
					.equalsTo(attribute(entryTypeAlias, attribute.getName())) //
					.build();
			directJoinClauses.add(lookupJoinClause);
		}
	}

	private void addDirectJoinClausesForForeignKey(final Iterable<CMAttribute> foreignKeyAttributes, //
			final CMEntryType entryType, //
			final Alias entryTypeAlias) {

		for (final CMAttribute attribute : foreignKeyAttributes) {
			final ForeignKeyAttributeType attributeType = (ForeignKeyAttributeType) attribute.getType();
			final CMClass referencedClass = viewForBuild.findClass(attributeType.getForeignKeyDestinationClassName());
			final Alias referencedClassAlias = name(new ExternalReferenceAliasHandler(entryType, attribute).forQuery());
			if (!aliases.containsAlias(referencedClassAlias)) {
				aliases.addAlias(referencedClassAlias);
			}
			final DirectJoinClause foreignKeyJoinClause = DirectJoinClause.newInstance() //
					.leftJoin(referencedClass) //
					.as(referencedClassAlias) //
					.on(attribute(referencedClassAlias, "Id")) //
					.equalsTo(attribute(entryTypeAlias, attribute.getName())) //
					.build();
			directJoinClauses.add(foreignKeyJoinClause);
		}
	}

	private void addSubclassesJoinClauses(final CMEntryType entryType, final Alias entryTypeAlias) {
		final Map<Alias, CMClass> descendantsByAlias = Maps.newHashMap();
		entryType.accept(new ForwardingEntryTypeVisitor() {

			private final CMEntryTypeVisitor delegate = NullEntryTypeVisitor.getInstance();

			@Override
			protected CMEntryTypeVisitor delegate() {
				return delegate;
			}

			@Override
			public void visit(final CMClass type) {
				for (final CMClass descendant : type.getDescendants()) {
					final Alias alias = canonical(descendant);
					if (!aliases.containsAlias(alias)) {
						aliases.addAlias(alias);
					}
					descendantsByAlias.put(alias, descendant);
				}
			}

		});
		whereClause.accept(new ForwardingWhereClauseVisitor() {

			private final WhereClauseVisitor delegate = NullWhereClauseVisitor.getInstance();

			@Override
			protected WhereClauseVisitor delegate() {
				return delegate;
			}

			@Override
			public void visit(final AndWhereClause whereClause) {
				for (final WhereClause subWhereClause : whereClause.getClauses()) {
					subWhereClause.accept(this);
				}
			}

			@Override
			public void visit(final OrWhereClause whereClause) {
				for (final WhereClause subWhereClause : whereClause.getClauses()) {
					subWhereClause.accept(this);
				}
			}

			@Override
			public void visit(final SimpleWhereClause whereClause) {
				final QueryAttribute attribute = whereClause.getAttribute();
				final Alias alias = attribute.getAlias();
				if (!aliases.containsAlias(alias)) {
					aliases.addAlias(alias);
				}
				if (descendantsByAlias.containsKey(alias)) {
					final CMClass type = descendantsByAlias.get(alias);
					final DirectJoinClause clause = DirectJoinClause.newInstance() //
							.leftJoin(type) //
							.as(alias) //
							.on(attribute(alias, "Id")) //
							.equalsTo(attribute(entryTypeAlias, "Id")) //
							.build();
					directJoinClauses.add(clause);
				}
			}

		});

	}

	@Override
	public QuerySpecsBuilder from(final CMClass cmClass) {
		return from(transform(cmClass), canonical(cmClass));
	}

	/*
	 * TODO: Consider more join levels (join with join tables)
	 */
	@Override
	public QuerySpecsBuilder join(final CMClass joinClass, final Over overClause) {
		return join(joinClass, canonical(joinClass), overClause);
	}

	@Override
	public QuerySpecsBuilder join(final CMClass joinClass, final Alias joinClassAlias, final Over overClause) {
		// from must be a class
		final CMClass fromClass = (CMClass) aliases.getFrom();
		final JoinClause joinClause = JoinClause.newJoinClause(viewForRun, viewForBuild, transform(fromClass))
				.withDomain(transform(overClause.getDomain()), overClause.getAlias()) //
				.withTarget(transform(joinClass), joinClassAlias) //
				.build();
		return join(joinClause, joinClassAlias, overClause);
	}

	@Override
	public QuerySpecsBuilder join(final CMClass joinClass, final Alias joinClassAlias, final Over overClause,
			final Source source) {
		// from must be a class
		final CMClass fromClass = (CMClass) aliases.getFrom();
		final JoinClause joinClause = JoinClause.newJoinClause(viewForRun, viewForBuild, transform(fromClass))
				.withDomain(new QueryDomain(transform(overClause.getDomain()), source), overClause.getAlias()) //
				.withTarget(transform(joinClass), joinClassAlias) //
				.build();
		return join(joinClause, joinClassAlias, overClause);
	}

	// TODO refactor to have a single join method
	@Override
	public QuerySpecsBuilder leftJoin(final CMClass joinClass, final Alias joinClassAlias, final Over overClause) {
		// from must be a class
		final CMClass fromClass = (CMClass) aliases.getFrom();
		final JoinClause join = JoinClause.newJoinClause(viewForRun, viewForBuild, fromClass)
				.withDomain(transform(overClause.getDomain()), overClause.getAlias()) //
				.withTarget(transform(joinClass), joinClassAlias) //
				.left() //
				.build();
		return join(join, joinClassAlias, overClause);
	}

	@Override
	public QuerySpecsBuilder leftJoin(final CMClass joinClass, final Alias joinClassAlias, final Over overClause,
			final Source source) {
		// from must be a class
		final CMClass fromClass = (CMClass) aliases.getFrom();
		final JoinClause join = JoinClause.newJoinClause(viewForRun, viewForBuild, fromClass)
				.withDomain(new QueryDomain(transform(overClause.getDomain()), source), overClause.getAlias()) //
				.withTarget(transform(joinClass), joinClassAlias) //
				.left() //
				.build();
		return join(join, joinClassAlias, overClause);
	}

	private QuerySpecsBuilder join(final JoinClause joinClause, final Alias joinClassAlias, final Over overClause) {
		joinClauses.add(joinClause);
		aliases.addAlias(joinClassAlias);
		aliases.addAlias(overClause.getAlias());
		return this;
	}

	@Override
	public QuerySpecsBuilder where(final WhereClause clause) {
		whereClause = (clause == null) ? alwaysTrue() : clause;
		return this;
	}

	@Override
	public QuerySpecsBuilder offset(final Number offset) {
		this.offset = offset.longValue();
		return this;
	}

	@Override
	public QuerySpecsBuilder limit(final Number limit) {
		this.limit = limit.longValue();
		return this;
	}

	@Override
	public QuerySpecsBuilder orderBy(final QueryAttribute attribute, final Direction direction) {
		orderings.put(attribute, direction);
		return this;
	}

	@Override
	public QuerySpecsBuilder orderBy(final Map<QueryAttribute, Direction> order) {
		orderings.putAll(defaultIfNull(order, NO_ORDER));
		return this;
	}

	@Override
	public QuerySpecsBuilder numbered() {
		numbered = true;
		return this;
	}

	@Override
	public QuerySpecsBuilder numbered(final WhereClause whereClause) {
		numbered = true;
		conditionOnNumberedQuery = whereClause;
		return this;
	}

	@Override
	public QuerySpecsBuilder count() {
		count = true;
		return this;
	}

	@Override
	public QuerySpecsBuilder skipDefaultOrdering() {
		skipDefaultOrdering = true;
		return this;
	}

	@Override
	public QuerySpecs build() {
		final FromClause fromClause = createFromClause();

		final CMEntryType fromEntryType = fromClause.getType();
		final Alias fromAlias = fromClause.getAlias();
		final EntryTypeAnalyzer entryTypeAnalyzer = inspect(fromEntryType, new Predicate<CMAttribute>() {

			private final boolean anyAttribute = !FluentIterable.from(attributes) //
					.filter(AnyAttribute.class) //
					.filter(withAlias(fromAlias)) //
					.isEmpty();
			private final Collection<String> names = FluentIterable.from(attributes) //
					.filter(QueryAliasAttribute.class) //
					.filter(withAlias(fromAlias)) //
					.transform(name()) //
					.toList();

			@Override
			public boolean apply(final CMAttribute input) {
				return anyAttribute || names.contains(input.getName());
			}

		}, viewForBuild);
		if (entryTypeAnalyzer.hasExternalReferences()) {
			addDirectJoinClausesForLookup(entryTypeAnalyzer.getLookupAttributes(), fromEntryType, fromAlias);
			addDirectJoinClausesForReference(entryTypeAnalyzer.getReferenceAttributes(), fromEntryType, fromAlias);
			addDirectJoinClausesForForeignKey(entryTypeAnalyzer.getForeignKeyAttributes(), fromEntryType, fromAlias);
		}
		addSubclassesJoinClauses(fromEntryType, fromAlias);

		final QuerySpecsImpl qs = QuerySpecsImpl.newInstance() //
				.fromClause(fromClause) //
				.distinct(distinct) //
				.numbered(numbered) //
				.conditionOnNumberedQuery(conditionOnNumberedQuery) //
				.count(count) //
				.skipDefaultOrdering(skipDefaultOrdering) //
				.build();

		for (final JoinClause joinClause : joinClauses) {
			if (!joinClause.hasTargets()) {
				return new EmptyQuerySpecs();
			}
			qs.addJoin(joinClause);
		}
		for (final DirectJoinClause directJoinClause : directJoinClauses) {
			qs.addDirectJoin(directJoinClause);
			final QueryAliasAttribute externalRefAttribute =
					attribute(directJoinClause.getTargetClassAlias(), EXTERNAL_ATTRIBUTE);
			qs.addSelectAttribute(checkAlias(externalRefAttribute));
		}

		qs.setWhereClause(adapt(whereClause, fromClause, qs));
		qs.setOffset(offset);
		qs.setLimit(limit);
		for (final QueryAttribute attribute : orderings.keySet()) {
			final QueryAttribute _attribute = new QueryAttributeVisitor() {

				private QueryAttribute output = attribute;

				public QueryAttribute adapt(final QueryAttribute attribute) {
					attribute.accept(this);
					return output;
				}

				@Override
				public void accept(final AnyAttribute value) {
					throw new IllegalArgumentException(value.toString());
				}

				@Override
				public void visit(final QueryAliasAttribute value) {
					output = new ForwardingAttributeTypeVisitor() {

						private final CMAttributeTypeVisitor DELEGATE = NullAttributeTypeVisitor.getInstance();
						private final CMAttribute attribute = fromEntryType.getAttribute(value.getName());
						private final CMAttributeType<?> type = (attribute == null) ? null : attribute.getType();

						private QueryAliasAttribute output = value;

						@Override
						protected CMAttributeTypeVisitor delegate() {
							return DELEGATE;
						}

						public QueryAttribute adapt(final QueryAliasAttribute value) {
							type.accept(this);
							if (output.equals(value)) {
								int candidates = 0;
								for (final QueryAttribute element : attributes) {
									if (new QueryAttributeVisitor() {

										private final QueryAttribute _value = value;
										private boolean output = false;

										public boolean candidate() {
											element.accept(this);
											return output;
										}

										@Override
										public void accept(final AnyAttribute value) {
											output = value.getAlias().equals(_value.getAlias());
										}

										@Override
										public void visit(final QueryAliasAttribute value) {
											output = value.equals(_value);
										}

									}.candidate()) {
										candidates++;
									}
								}
								if (candidates == 0) {
									attributes.add(output);
								}
							} else {
								attributes.add(output);
							}
							return output;
						}

						@Override
						public void visit(final ForeignKeyAttributeType attributeType) {
							final Alias alias = alias(value);
							output = attribute(alias, EXTERNAL_ATTRIBUTE);
							addDirectJoin(attributeType.getForeignKeyDestinationClassName(), alias);
						}

						@Override
						public void visit(final LookupAttributeType attributeType) {
							final Alias alias = alias(value);
							output = attribute(alias, EXTERNAL_ATTRIBUTE);
							addDirectJoin(LOOKUP_CLASS_NAME, alias);
						}

						@Override
						public void visit(final ReferenceAttributeType attributeType) {
							final String domainName = attributeType.getDomainName();
							final CMDomain domain = viewForBuild.findDomain(domainName);
							final String target;
							if (domain == null) {
								target = null;
							} else if (CARDINALITY_1N.value().equals(domain.getCardinality())) {
								target = domain.getClass1().getName();
							} else if (CARDINALITY_N1.value().equals(domain.getCardinality())) {
								target = domain.getClass2().getName();
							} else {
								target = null;
							}
							if (isNotEmpty(target)) {
								final Alias alias = alias(value);
								output = attribute(alias, EXTERNAL_ATTRIBUTE);
								addDirectJoin(target, alias);
							}
						}

						private Alias alias(final QueryAttribute value) {
							final Alias alias =
									name(new ExternalReferenceAliasHandler(value.getAlias().toString(), attribute)
											.forQuery());
							if (!aliases.containsAlias(alias)) {
								aliases.addAlias(alias);
							}
							return alias;
						}

						private void addDirectJoin(final String targetName, final Alias alias) {
							qs.addDirectJoin(DirectJoinClause.newInstance() //
									.leftJoin(viewForBuild.findClass(targetName)) //
									.as(alias) //
									.on(attribute(alias, "Id")) //
									.equalsTo(attribute(fromAlias, attribute.getName())) //
									.build());
						}

					}.adapt(value);
				}

			}.adapt(attribute);
			qs.addOrderByClause(new OrderByClause(_attribute, orderings.get(attribute)));
		}

		for (final QueryAttribute qa : attributes) {
			qs.addSelectAttribute(checkAlias(qa));
		}

		return qs;
	}

	private WhereClause adapt(final WhereClause whereClause, final FromClause fromClause,
			final QuerySpecsImpl querySpecsImpl) {
		return new ForwardingWhereClauseVisitor() {

			private final WhereClauseVisitor DELEGATE = NullWhereClauseVisitor.getInstance();

			private WhereClause output = whereClause;

			@Override
			protected WhereClauseVisitor delegate() {
				return DELEGATE;
			}

			public WhereClause adapt() {
				output.accept(this);
				return output;
			}

			@Override
			public void visit(final AndWhereClause whereClause) {
				output = and(adaptAll(whereClause.getClauses()));
			}

			@Override
			public void visit(final NotWhereClause whereClause) {
				output = not(adaptSingle(whereClause.getClause()));
			}

			@Override
			public void visit(final OrWhereClause whereClause) {
				output = or(adaptAll(whereClause.getClauses()));
			}

			@Override
			public void visit(final SimpleWhereClause whereClause) {
				output = new QueryAttributeVisitor() {

					private WhereClause output = whereClause;

					public WhereClause adapt() {
						whereClause.getAttribute().accept(this);
						return output;
					}

					@Override
					public void accept(final AnyAttribute value) {
						final Collection<WhereClause> elements = new HashSet<>();
						for (final CMAttribute element : fromClause.getType().getActiveAttributes()) {
							elements.add(new ForwardingAttributeTypeVisitor() {

								private final CMAttributeTypeVisitor DELEGATE = NullAttributeTypeVisitor.getInstance();

								private WhereClause output = SimpleWhereClause.newInstance() //
										.withAttribute(attribute(value.getAlias(), element.getName())) //
										.withOperatorAndValue(whereClause.getOperator()) //
										.withAttributeNameCast(whereClause.getAttributeNameCast()) //
										.build();

								@Override
								protected CMAttributeTypeVisitor delegate() {
									return DELEGATE;
								}

								public WhereClause adapt() {
									element.getType().accept(this);
									return output;
								}

								@Override
								public void visit(final ForeignKeyAttributeType attributeType) {
									final Alias alias = alias(whereClause.getAttribute());
									output = SimpleWhereClause.newInstance() //
											.withAttribute(attribute(alias, EXTERNAL_ATTRIBUTE)) //
											.withOperatorAndValue(whereClause.getOperator()) //
											.withAttributeNameCast(whereClause.getAttributeNameCast()) //
											.build();
									addDirectJoin(attributeType.getForeignKeyDestinationClassName(), alias);
								}

								@Override
								public void visit(final LookupAttributeType attributeType) {
									final Alias alias = alias(whereClause.getAttribute());
									output = SimpleWhereClause.newInstance() //
											.withAttribute(attribute(alias, EXTERNAL_ATTRIBUTE)) //
											.withOperatorAndValue(whereClause.getOperator()) //
											.withAttributeNameCast(whereClause.getAttributeNameCast()) //
											.build();
									addDirectJoin(LOOKUP_CLASS_NAME, alias);
								};

								@Override
								public void visit(final ReferenceAttributeType attributeType) {
									final Alias alias = alias(whereClause.getAttribute());
									output = SimpleWhereClause.newInstance() //
											.withAttribute(attribute(alias, EXTERNAL_ATTRIBUTE)) //
											.withOperatorAndValue(whereClause.getOperator()) //
											.withAttributeNameCast(whereClause.getAttributeNameCast()) //
											.build();
									final CMClass target;
									final CMDomain domain = viewForBuild.findDomain(attributeType.getDomainName());
									switch (Cardinality.of(domain.getCardinality())) {

									case CARDINALITY_1N:
										target = domain.getClass1();
										break;

									case CARDINALITY_N1:
										target = domain.getClass2();
										break;

									default:
										throw new IllegalArgumentException(domain.getCardinality());

									}
									addDirectJoin(target.getName(), alias);
								}

								private Alias alias(final QueryAttribute value) {
									final Alias alias =
											name(new ExternalReferenceAliasHandler(value.getAlias().toString(), element)
													.forQuery());
									if (!aliases.containsAlias(alias)) {
										aliases.addAlias(alias);
									}
									return alias;
								}

								private void addDirectJoin(final String targetName, final Alias alias) {
									querySpecsImpl.addDirectJoin(DirectJoinClause.newInstance() //
											.leftJoin(viewForBuild.findClass(targetName)) //
											.as(alias) //
											.on(attribute(alias, "Id")) //
											.equalsTo(attribute(fromClause.getAlias(), element.getName())) //
											.build());
								}

							}.adapt());

						}
						output = or(elements);
					}

					@Override
					public void visit(final QueryAliasAttribute value) {
					}

				}.adapt();
			}

			private Iterable<WhereClause> adaptAll(final Iterable<? extends WhereClause> inputs) {
				return FluentIterable.from(inputs) //
						.transform(new Function<WhereClause, WhereClause>() {

							@Override
							public WhereClause apply(final WhereClause input) {
								return adaptSingle(input);
							}

						});
			}

			private WhereClause adaptSingle(final WhereClause input) {
				return QuerySpecsBuilderImpl.this.adapt(input, fromClause, querySpecsImpl);
			}

		}.adapt();
	}

	private FromClause createFromClause() {
		final FromClause output;
		if (aliases.getFrom() instanceof CMFunctionCall) {
			output = new FunctionFromClause(aliases.getFrom(), aliases.getFromAlias());
		} else {
			output = new ClassFromClause(viewForRun, aliases.getFrom(), aliases.getFromAlias());
		}
		return output;
	}

	private QueryAttribute checkAlias(final QueryAttribute queryAttribute) {
		aliases.checkAlias(queryAttribute.getAlias());
		return queryAttribute;
	}

	@Override
	public CMQueryResult run() {
		return viewForRun.executeQuery(build());
	}

	/*
	 * Object
	 */

	@Override
	public String toString() {
		return super.toString(); // TODO
	}

	@Override
	public boolean equals(final Object obj) {
		return EqualsBuilder.reflectionEquals(this, obj);
	}

	@Override
	public int hashCode() {
		return HashCodeBuilder.reflectionHashCode(this);
	}

	private <T extends CMEntryType> T transform(final T entryType) {
		try {
			return new CMEntryTypeVisitor() {

				private T transformed;

				@Override
				public void visit(final CMClass type) {
					transformed = (T) viewForBuild.findClass(type.getId());
					if (type instanceof ClassHistory) {
						transformed = (T) ClassHistory.history((CMClass) transformed);
					}
				}

				@Override
				public void visit(final CMDomain type) {
					transformed = (T) viewForBuild.findDomain(type.getId());
					if (type instanceof DomainHistory) {
						transformed = (T) DomainHistory.history((CMDomain) transformed);
					}
				}

				@Override
				public void visit(final CMFunctionCall type) {
					// function does not need transformation
					transformed = entryType;
				}

				public T transform(final T entryType) {
					entryType.accept(this);
					return transformed;
				}

			}.transform(entryType);
		} catch (final Exception e) {
			return entryType;
		}
	}

}

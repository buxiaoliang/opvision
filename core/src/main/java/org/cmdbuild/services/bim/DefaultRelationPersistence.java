package org.cmdbuild.services.bim;

import static org.cmdbuild.common.Constants.DESCRIPTION_ATTRIBUTE;
import static org.cmdbuild.common.Constants.ID_ATTRIBUTE;
import static org.cmdbuild.dao.query.clause.AnyAttribute.anyAttribute;
import static org.cmdbuild.dao.query.clause.AnyClass.anyClass;
import static org.cmdbuild.dao.query.clause.QueryAliasAttribute.attribute;
import static org.cmdbuild.dao.query.clause.join.Over.over;
import static org.cmdbuild.dao.query.clause.where.EqualsOperatorAndValue.eq;
import static org.cmdbuild.dao.query.clause.where.SimpleWhereClause.condition;
import static org.cmdbuild.data.converter.StorableProjectConverter.TABLE_NAME;

import java.util.ArrayList;
import java.util.List;

import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.dao.entry.CMRelation;
import org.cmdbuild.dao.entry.CMRelation.CMRelationDefinition;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMDomain;
import org.cmdbuild.dao.query.CMQueryResult;
import org.cmdbuild.dao.query.CMQueryRow;
import org.cmdbuild.dao.query.clause.QueryRelation;
import org.cmdbuild.dao.query.clause.alias.Alias;
import org.cmdbuild.dao.query.clause.alias.Aliases;
import org.cmdbuild.dao.view.CMDataView;

import com.google.common.collect.Lists;

public class DefaultRelationPersistence implements RelationPersistence {

	public static final String DEFAULT_DOMAIN_SUFFIX = TABLE_NAME;
	final CMDataView dataView;

	public DefaultRelationPersistence(final CMDataView dataView) {
		this.dataView = dataView;
	}

	@Override
	public ProjectRelations readRelations(final Long projectCardId, final String rootName) {
		ArrayList<CMRelation> relations = Lists.newArrayList();
		final CMDomain domain = dataView.findDomain(rootName + DEFAULT_DOMAIN_SUFFIX);
		if (domain != null) {
			relations = getAllRelationsForDomain(domain, projectCardId);

			final List<String> bindedCardsList = Lists.newArrayList();
			for (final CMRelation relation : relations) {
				bindedCardsList.add(relation.getCard1Id().toString());
			}
			final Iterable<String> bindedCards = bindedCardsList;
			return new ProjectRelations() {

				@Override
				public Long getProjectCardId() {
					return projectCardId;
				}

				@Override
				public Iterable<String> getBindedCards() {
					return bindedCards;
				}
			};
		} else {
			return RelationPersistence.NULL_RELATIONS;
		}
	}

	private void removeRelations(final Long projectCardId, final String rootClassName) {
		final CMDomain domain = dataView.findDomain(rootClassName + DEFAULT_DOMAIN_SUFFIX);
		final ArrayList<CMRelation> oldRelations = getAllRelationsForDomain(domain, projectCardId);
		for (final CMRelation relation : oldRelations) {
			dataView.delete(relation);
		}
	}

	private ArrayList<CMRelation> getAllRelationsForDomain(final CMDomain domain, final Long projectCardId) {
		final ArrayList<CMRelation> oldRelations = Lists.newArrayList();

		final CMClass projectClass = domain.getClass2();
		final CMClass rootClass = domain.getClass1();

		final Alias DOM_ALIAS = Aliases.canonical(domain);
		final Alias DST_ALIAS = Aliases.canonical(projectClass);
		final CMQueryResult result = dataView
				.select( //
						anyAttribute(DOM_ALIAS), attribute(DST_ALIAS, DESCRIPTION_ATTRIBUTE)) //
				.from(rootClass) //
				.join(anyClass(), Aliases.as(DST_ALIAS), over(domain, Aliases.as(DOM_ALIAS))) //
				.where(condition(attribute(DST_ALIAS, ID_ATTRIBUTE), eq(projectCardId)))//
				.run();

		for (final java.util.Iterator<CMQueryRow> it = result.iterator(); it.hasNext();) {
			final CMQueryRow row = it.next();
			final QueryRelation queryRelation = row.getRelation(domain);
			final CMRelation relation = queryRelation.getRelation();
			oldRelations.add(relation);
		}
		return oldRelations;
	}

	@Override
	public void writeRelations(final Long projectCardId, final Iterable<String> cardBinding, final String className) {

		removeRelations(projectCardId, className);

		final CMClass projectsClass = dataView.findClass(TABLE_NAME);
		final CMClass rootClass = dataView.findClass(className);
		final CMDomain domain = dataView.findDomain(className + DEFAULT_DOMAIN_SUFFIX);

		for (final String cardId : cardBinding) {
			final CMRelationDefinition relationDefinition = dataView.createRelationFor(domain);

			final CMCard projectCard = dataView.select(attribute(projectsClass, DESCRIPTION_ATTRIBUTE)) //
					.from(projectsClass) //
					.where(condition(attribute(projectsClass, ID_ATTRIBUTE), eq(projectCardId))) //
					.limit(1) //
					.run() //
					.getOnlyRow() //
					.getCard(projectsClass);

			final CMCard rootCard = dataView.select(attribute(rootClass, DESCRIPTION_ATTRIBUTE)) //
					.from(rootClass) //
					.where(condition(attribute(rootClass, ID_ATTRIBUTE), eq(Long.parseLong(cardId)))) //
					.limit(1) //
					.run() //
					.getOnlyRow() //
					.getCard(rootClass);

			relationDefinition.setCard1(rootCard);
			relationDefinition.setCard2(projectCard);
			relationDefinition.save();
		}

	}

}

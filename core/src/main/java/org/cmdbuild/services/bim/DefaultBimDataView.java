package org.cmdbuild.services.bim;

import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.cmdbuild.common.Constants.CLASS_ID_ATTRIBUTE;
import static org.cmdbuild.common.Constants.DESCRIPTION_ATTRIBUTE;
import static org.cmdbuild.common.Constants.ID_ATTRIBUTE;
import static org.cmdbuild.dao.query.clause.AnyAttribute.anyAttribute;
import static org.cmdbuild.dao.query.clause.AnyClass.anyClass;
import static org.cmdbuild.dao.query.clause.Clauses.call;
import static org.cmdbuild.dao.query.clause.QueryAliasAttribute.attribute;
import static org.cmdbuild.dao.query.clause.join.Over.over;
import static org.cmdbuild.dao.query.clause.where.EqualsOperatorAndValue.eq;
import static org.cmdbuild.dao.query.clause.where.SimpleWhereClause.condition;
import static org.cmdbuild.services.bim.DefaultBimDataModelManager.DEFAULT_DOMAIN_SUFFIX;

import java.util.Iterator;
import java.util.List;

import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.dao.entry.CMRelation;
import org.cmdbuild.dao.entry.IdAndDescription;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMDomain;
import org.cmdbuild.dao.entrytype.CMIdentifier;
import org.cmdbuild.dao.entrytype.DBIdentifier;
import org.cmdbuild.dao.function.CMFunction;
import org.cmdbuild.dao.query.CMQueryResult;
import org.cmdbuild.dao.query.CMQueryRow;
import org.cmdbuild.dao.query.clause.QueryRelation;
import org.cmdbuild.dao.query.clause.alias.Alias;
import org.cmdbuild.dao.query.clause.alias.Aliases;
import org.cmdbuild.dao.query.clause.join.Over;
import org.cmdbuild.dao.query.clause.where.WhereClause;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.dao.view.ForwardingDataView;

import com.google.common.collect.Lists;

public class DefaultBimDataView extends ForwardingDataView implements BimDataView {

	private static final String CARDDATA_FROM_GUID_FUNCTION = "_bim_carddata_from_globalid";
	private static final String CLASSNAME = "ClassName";

	private final CMDataView dataView;

	public DefaultBimDataView(final CMDataView dataView) {
		this.dataView = dataView;
	}

	@Override
	protected CMDataView delegate() {
		return dataView;
	}

	@Override
	public CMCard getCmCardFromGlobalId(final String globalId, final String className) {
		CMCard matchingCard = null;
		final BimCard bimCard = getBimDataFromGlobalid(globalId);
		if (bimCard != null && bimCard.isValid()) {
			bimCard.getId();
			final Long masterId = bimCard.getId();
			final CMClass theClass = dataView.findClass(className);
			final CMQueryResult result = dataView
					.select( //
							anyAttribute(theClass)) //
					.from(theClass).where(condition(attribute(theClass, ID_ATTRIBUTE), eq(masterId))) //
					.limit(1) //
					.run();
			if (!result.isEmpty()) {
				final CMQueryRow row = result.getOnlyRow();
				matchingCard = row.getCard(theClass);
			}
		}
		return matchingCard;
	}

	@Override
	public List<CMCard> getCardsWithAttributeAndValue(final CMIdentifier classIdentifier, final Object attributeValue,
			final String attributeName) {
		final CMClass theClass = dataView.findClass(classIdentifier);
		CMQueryResult result = null;
		if (isBlank(attributeName)) {
			result = dataView.select(anyAttribute(theClass)) //
					.from(theClass) //
					.run();
		} else {
			result = dataView.select(anyAttribute(theClass)) //
					.from(theClass) //
					.where(condition(attribute(theClass, attributeName), eq(attributeValue))) //
					.run();
		}
		final List<CMCard> cards = Lists.newArrayList();
		for (final Iterator<CMQueryRow> it = result.iterator(); it.hasNext();) {
			final CMQueryRow row = it.next();
			cards.add(row.getCard(theClass));
		}
		return cards;
	}

	@Override
	public BimCard getBimDataFromGlobalid(final String globalId) {
		final CMFunction function = dataView.findFunctionByName(CARDDATA_FROM_GUID_FUNCTION);
		final Alias f = Aliases.name("f");
		final CMQueryResult queryResult = dataView.select(anyAttribute(function, f)) //
				.from(call(function, globalId), f) //
				.limit(1) //
				.run();
		if (queryResult.isEmpty()) {
			logger.warn("No matching card found for globalid " + globalId);
		}

		final BimCard bimCard = new BimCard();
		final CMQueryRow row = queryResult.getOnlyRow();
		final Integer rowIdInt = (Integer) row.getValueSet(f).get(ID_ATTRIBUTE);
		final Integer rowIdClassInt = (Integer) row.getValueSet(f).get(CLASS_ID_ATTRIBUTE);
		final String className = (String) row.getValueSet(f).get(CLASSNAME);
		final String description = String.class.cast(row.getValueSet(f).get(DESCRIPTION_ATTRIBUTE));
		if (rowIdInt != null && rowIdClassInt != null) {
			final Long rowId = new Long(rowIdInt.longValue());
			final Long rowIdClass = new Long(rowIdClassInt.longValue());
			bimCard.setGlobalId(globalId);
			bimCard.setId(rowId);
			bimCard.setClassId(rowIdClass);
			bimCard.setCardDescription(description);
			bimCard.setClassName(className);
		}
		return bimCard;
	}

	public static class BimCard {
		private Long id;
		private Long classId;
		private String className;
		private String cardDescription;
		private String globalId;

		public BimCard() {
		}

		public BimCard( //
				final Long id, //
				final Long classId, //
				final String cardDescription, //
				final String className //
		) {
			this.id = id;
			this.classId = classId;
			this.cardDescription = cardDescription;
			this.className = className;
		}

		public boolean isValid() {
			return id != null && classId != null;
		}

		public Long getId() {
			return id;
		}

		public void setId(final Long id) {
			this.id = id;
		}

		public Long getClassId() {
			return classId;
		}

		public void setClassId(final Long classId) {
			this.classId = classId;
		}

		public String getClassName() {
			return className;
		}

		public void setClassName(final String className) {
			this.className = className;
		}

		public String getCardDescription() {
			return cardDescription;
		}

		public void setCardDescription(final String cardDescription) {
			this.cardDescription = cardDescription;
		}

		public String getGlobalId() {
			return globalId;
		}

		public void setGlobalId(final String globalId) {
			this.globalId = globalId;
		}
	}

	@Override
	public Long getRootId(final Long cardId, final String className, final String referenceRootName) {
		final CMClass theClass = dataView.findClass(className);
		final CMCard card = dataView
				.select( //
						attribute(theClass, referenceRootName)) //
				.from(theClass) //
				.where(condition(attribute(theClass, ID_ATTRIBUTE), eq(cardId))) //
				.limit(1) //
				.run() //
				.getOnlyRow() //
				.getCard(theClass);
		final IdAndDescription reference = IdAndDescription.class.cast(card.get(referenceRootName));
		return reference.getId();
	}

	@Override
	public Long getIdFromGlobalId(final String globalId, final String className) {
		Long id = null;
		final BimCard cardData = getBimDataFromGlobalid(globalId);
		if (cardData != null && cardData.isValid()) {
			if (cardData.getClassName().equals(className)) {
				id = cardData.getId();
			}
		}
		return id;
	}

	@Override
	public CMCard fetchCard(final String className, final Long id) {
		final CMClass theClass = dataView.findClass(className);
		return dataView.select(anyAttribute(theClass)).from(theClass)
				.where(condition(attribute(theClass, ID_ATTRIBUTE), eq(id))) //
				.limit(1) //
				.run() //
				.getOnlyRow() //
				.getCard(theClass);
	}

	@Override
	public Long getProjectCardIdFromRootCard(final Long rootId, final String rootClassName) {
		Long projectId = (long) -1;

		final Alias DOM_ALIAS = Aliases.name("DOM");
		final Alias DST_ALIAS = Aliases.name("DST");
		final CMClass rootClass = dataView.findClass(DBIdentifier.fromName(rootClassName));

		final String domainName = rootClassName + DEFAULT_DOMAIN_SUFFIX;
		final CMDomain domain = dataView.findDomain(domainName);

		final WhereClause clause = condition(attribute(rootClass, ID_ATTRIBUTE), eq(rootId));
		final Over overClause = over(domain, Aliases.as(DOM_ALIAS));

		final CMQueryResult result = dataView.select(anyAttribute(DOM_ALIAS)) //
				.from(rootClass) //
				.join(anyClass(), Aliases.as(DST_ALIAS), overClause) //
				.where(clause) //
				.run();

		for (final CMQueryRow row : result) {
			final QueryRelation relation = row.getRelation(DOM_ALIAS);
			if (relation != null) {
				final CMRelation relation2 = relation.getRelation();
				projectId = Long.class.cast(relation2.getCard2Id());
			}
		}
		return projectId;
	}

}

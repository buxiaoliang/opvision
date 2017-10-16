package org.cmdbuild.logic.data.access;

import org.cmdbuild.model.data.Card;
import org.springframework.transaction.annotation.Transactional;

public abstract class TransactionalDataAccessLogic extends ForwardingDataAccessLogic {

	@Override
	@Transactional
	public Long createCard(final Card userGivenCard) {
		return delegate().createCard(userGivenCard);
	}

	@Override
	@Transactional
	public Long createCard(final Card userGivenCard, final boolean manageAlsoDomainsAttributes) {
		return delegate().createCard(userGivenCard, manageAlsoDomainsAttributes);
	}

	@Override
	@Transactional
	public Long createCard(final CreateCard value) {
		return delegate().createCard(value);
	}

	@Override
	@Transactional
	public void createCards(final Iterable<CreateCard> values) {
		delegate().createCards(values);
	}

	@Override
	@Transactional
	public void deleteCard(final String className, final Long cardId) {
		delegate().deleteCard(className, cardId);
	}

	@Override
	@Transactional
	public Iterable<Long> createRelations(final RelationDTO relationDTO) {
		return delegate().createRelations(relationDTO);
	}

	@Override
	@Transactional
	public void updateRelation(final RelationDTO relationDTO) {
		delegate().updateRelation(relationDTO);
	}

	@Override
	@Transactional
	public void deleteRelation(final String domainName, final Long relationId) {
		delegate().deleteRelation(domainName, relationId);
	}

	@Override
	@Transactional
	public void deleteDetail(final Card master, final Card detail, final String domainName) {
		delegate().deleteDetail(master, detail, domainName);
	}

}

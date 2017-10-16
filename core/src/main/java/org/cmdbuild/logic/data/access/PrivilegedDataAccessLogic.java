package org.cmdbuild.logic.data.access;

import static java.util.stream.StreamSupport.stream;
import static org.cmdbuild.exception.AuthException.AuthExceptionType.AUTH_CLASS_NOT_AUTHORIZED;

import java.util.Map;

import org.cmdbuild.auth.acl.PrivilegeContext;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.model.data.Card;

public class PrivilegedDataAccessLogic extends ForwardingDataAccessLogic {

	private final DataAccessLogic delegate;
	private final PrivilegeContext privilegeContext;

	public PrivilegedDataAccessLogic(final DataAccessLogic delegate, final PrivilegeContext privilegeContext) {
		this.delegate = delegate;
		this.privilegeContext = privilegeContext;
	}

	@Override
	protected DataAccessLogic delegate() {
		return delegate;
	}

	@Override
	public Long createCard(final CreateCard value) {
		assureWrite(value.card().getClassName());
		return delegate().createCard(value);
	}

	@Override
	public void createCards(final Iterable<CreateCard> values) {
		stream(values.spliterator(), false) //
				.map(input -> input.card()) //
				.forEach(input -> assureWrite(input.getClassName()));
		delegate().createCards(values);
	}

	@Override
	public Long createCard(final Card card) {
		assureWrite(card.getClassName());
		return delegate().createCard(card);
	}

	@Override
	public Long createCard(final Card userGivenCard, final boolean manageAlsoDomainsAttributes) {
		assureWrite(userGivenCard.getClassName());
		return delegate().createCard(userGivenCard, manageAlsoDomainsAttributes);
	}

	@Override
	public void updateCards(final Iterable<Card> cards) {
		stream(cards.spliterator(), false) //
				.forEach(input -> assureWrite(input.getClassName()));
		delegate().updateCards(cards);
	}

	@Override
	public void updateFetchedCard(final Card card, final Map<String, Object> attributes) {
		assureWrite(card.getClassName());
		delegate().updateFetchedCard(card, attributes);
	}

	private void assureWrite(final String className) {
		final CMClass found = delegate().findClass(className);
		if ((found == null) || found.isSuperclass() || !privilegeContext.hasWriteAccess(found)) {
			throw AUTH_CLASS_NOT_AUTHORIZED.createException(className);
		}
	}

}

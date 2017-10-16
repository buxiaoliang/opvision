package org.cmdbuild.servlets.json.serializers.translations.commons;

import static com.google.common.collect.FluentIterable.from;

import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.logic.data.access.DataAccessLogic;
import org.cmdbuild.logic.data.access.ForwardingDataAccessLogic;

public class DefaultDataAccessLogicHelper extends ForwardingDataAccessLogic implements DataAccessLogicHelper {

	private final org.cmdbuild.logic.data.access.DataAccessLogic delegate;

	public DefaultDataAccessLogicHelper(final DataAccessLogic delegate) {
		this.delegate = delegate;
	}

	@Override
	protected DataAccessLogic delegate() {
		return delegate;
	}

	@Override
	public Iterable<? extends CMClass> findLocalizableClasses(final boolean activeOnly) {
		return from(delegate().findClasses(activeOnly)) //
				.filter(input -> !input.isBaseClass() && !input.isSystem());
	}

}

package org.cmdbuild.auth;

import static java.util.Objects.requireNonNull;

import org.cmdbuild.dao.view.CMDataView;

/**
 * Checks password stored in the DAO layer
 */
public class LegacyDBAuthenticator extends DatabaseAuthenticator {

	public static interface Configuration extends DatabaseAuthenticator.Configuration {

	}

	private final Configuration configuration;
	private final CMDataView view;

	public LegacyDBAuthenticator(final Configuration configuration, final CMDataView view) {
		this.configuration = requireNonNull(configuration);
		this.view = requireNonNull(view);
	}

	@Override
	protected Configuration configuration() {
		return configuration;
	}

	@Override
	protected CMDataView view() {
		return view;
	}

	@Override
	protected String loginAttributeName(final Login login) {
		return userNameAttribute();
	}

}

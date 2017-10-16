package org.cmdbuild.workflow;

import static java.lang.String.format;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.apache.commons.lang3.StringUtils.isNotBlank;
import static org.cmdbuild.services.soap.client.CmdbuildSoapClient.token;
import static org.cmdbuild.services.soap.client.CmdbuildSoapClient.usernameAndPassword;
import static org.cmdbuild.services.soap.client.CmdbuildSoapClient.PasswordType.DIGEST;

import java.util.function.Supplier;

import org.apache.commons.lang3.Validate;
import org.cmdbuild.services.soap.Private;
import org.cmdbuild.services.soap.client.CmdbuildSoapClient;
import org.cmdbuild.services.soap.client.SoapClient;

/*
 * TODO rename
 */
public class CusSoapProxyBuilder implements org.apache.commons.lang3.builder.Builder<Private> {

	public interface Configuration {

		String getUrl();

		String getUsername();

		String getPassword();

		boolean isTokenEnabled();

		/**
		 * @deprecated Use a {@link Logger}.
		 */
		@Deprecated
		void debug(String message);

	}

	private static final String URL_SEPARATOR = "/";
	private static final String URL_SUFFIX = "services/soap/Private";

	private static final String USER_SEPARATOR = "#";
	private static final String USER_SEPARATOR_2 = "!";
	private static final String GROUP_SEPARATOR = "@";

	private final Configuration configuration;
	private String username;
	private String group;
	private boolean forciblyImpersonate;

	public CusSoapProxyBuilder(final Configuration configuration) {
		this.configuration = configuration;
		this.username = EMPTY;
		this.group = EMPTY;
	}

	public CusSoapProxyBuilder withUsername(final String username) {
		this.username = username;
		return this;
	}

	public CusSoapProxyBuilder withGroup(final String group) {
		this.group = group;
		return this;
	}

	public CusSoapProxyBuilder forciblyImpersonate(final boolean forciblyImpersonate) {
		this.forciblyImpersonate = forciblyImpersonate;
		return this;
	}

	@Override
	public Private build() {
		Validate.notNull(username);
		Validate.notNull(group);

		final String url = completeUrl(configuration.getUrl());
		final String fullUsername = completeUsername(configuration.getUsername(), username, group);
		final String password = configuration.getPassword();

		configuration.debug(format("creating SOAP client for url '%s' and username '%s'", url, fullUsername));

		final SoapClient<Private> soapClient;
		if (configuration.isTokenEnabled()) {
			final Supplier<String> tokenSupplier = new Supplier<String>() {

				@Override
				public String get() {
					return CmdbuildSoapClient.<Private> aSoapClient() //
							.forClass(Private.class) //
							.withUrl(url) //
							.withAuthentication(usernameAndPassword(DIGEST, fullUsername, password)) //
							.build() //
							.getProxy() //
							.createSession();
				}

			};
			soapClient = CmdbuildSoapClient.<Private> aSoapClient() //
					.forClass(Private.class) //
					.withUrl(url) //
					.withAuthentication(token(tokenSupplier)) //
					.build();
		} else {
			soapClient = CmdbuildSoapClient.<Private> aSoapClient() //
					.forClass(Private.class) //
					.withUrl(url) //
					.withAuthentication(usernameAndPassword(DIGEST, fullUsername, password)) //
					.build();
		}
		return soapClient.getProxy();
	}

	private String completeUrl(final String baseUrl) {
		return new StringBuilder(baseUrl) //
				.append(baseUrl.endsWith(URL_SEPARATOR) ? EMPTY : URL_SEPARATOR) //
				.append(URL_SUFFIX) //
				.toString();
	}

	private String completeUsername(final String wsUsername, final String currentUser, final String currentGroup) {
		final String userSeparator = forciblyImpersonate ? USER_SEPARATOR_2 : USER_SEPARATOR;
		return new StringBuilder(wsUsername) //
				.append(isNotBlank(currentUser) ? userSeparator + currentUser : EMPTY) //
				.append(isNotBlank(currentGroup) ? GROUP_SEPARATOR + currentGroup : EMPTY) //
				.toString();
	}

}

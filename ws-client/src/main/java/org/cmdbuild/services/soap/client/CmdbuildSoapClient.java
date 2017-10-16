package org.cmdbuild.services.soap.client;

import static com.google.common.reflect.Reflection.newProxy;
import static org.apache.commons.lang3.Validate.notBlank;
import static org.apache.commons.lang3.Validate.notNull;
import static org.apache.commons.lang3.builder.ToStringBuilder.reflectionToString;
import static org.apache.commons.lang3.builder.ToStringStyle.SHORT_PREFIX_STYLE;
import static org.apache.wss4j.common.ConfigurationConstants.ACTION;
import static org.apache.wss4j.common.ConfigurationConstants.PASSWORD_TYPE;
import static org.apache.wss4j.common.ConfigurationConstants.PW_CALLBACK_REF;
import static org.apache.wss4j.common.ConfigurationConstants.USER;
import static org.apache.wss4j.common.ConfigurationConstants.USERNAME_TOKEN;
import static org.apache.wss4j.common.WSS4JConstants.PW_DIGEST;
import static org.apache.wss4j.common.WSS4JConstants.PW_NONE;
import static org.apache.wss4j.common.WSS4JConstants.PW_TEXT;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;

import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.callback.UnsupportedCallbackException;
import javax.xml.namespace.QName;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.cxf.endpoint.Client;
import org.apache.cxf.endpoint.Endpoint;
import org.apache.cxf.frontend.ClientProxy;
import org.apache.cxf.headers.Header;
import org.apache.cxf.jaxb.JAXBDataBinding;
import org.apache.cxf.jaxws.JaxWsProxyFactoryBean;
import org.apache.cxf.ws.security.wss4j.WSS4JOutInterceptor;
import org.apache.wss4j.common.ext.WSPasswordCallback;

import com.google.common.reflect.AbstractInvocationHandler;

public class CmdbuildSoapClient<T> implements SoapClient<T> {

	public static interface Authentication {

		void accept(AuthenticationVisitor visitor);

	}

	public static interface AuthenticationVisitor {

		void accept(PasswordAuthentication element);

		void accept(TokenAuthenticator element);

	}

	/**
	 * @deprecated Should be put within {@link PasswordAuthentication} but it's
	 *             kept for backward compatibility.
	 */
	@Deprecated
	public static enum PasswordType {

		NONE {
			@Override
			String toClient() {
				return PW_NONE;
			}
		},

		TEXT {
			@Override
			String toClient() {
				return PW_TEXT;
			}
		},

		DIGEST {
			@Override
			String toClient() {
				return PW_DIGEST;
			}
		},

		;

		@Deprecated
		abstract String toClient();

	}

	public static class PasswordAuthentication implements Authentication {

		private final PasswordType type;
		private final String username;
		private final String password;

		/**
		 * Use factory method.
		 */
		private PasswordAuthentication(final PasswordType type, final String username, final String password) {
			this.type = type;
			this.username = username;
			this.password = password;
		}

		public void accept(final AuthenticationVisitor visitor) {
			visitor.accept(this);
		}

		public PasswordType getType() {
			return type;
		}

		public String getUsername() {
			return username;
		}

		public String getPassword() {
			return password;
		}

		@Override
		public boolean equals(final Object obj) {
			if (obj == this) {
				return true;
			}
			if (!(obj instanceof PasswordAuthentication)) {
				return false;
			}
			final PasswordAuthentication other = PasswordAuthentication.class.cast(obj);
			return new EqualsBuilder() //
					.append(this.type, other.type) //
					.append(this.username, other.username) //
					.append(this.password, other.password) //
					.isEquals();
		}

		@Override
		public int hashCode() {
			return new HashCodeBuilder() //
					.append(type) //
					.append(username) //
					.append(password) //
					.build();
		}

		@Override
		public String toString() {
			return reflectionToString(this, SHORT_PREFIX_STYLE);
		}

	}

	public static Authentication usernameAndPassword(final PasswordType type, final String username,
			final String password) {
		final PasswordType _type = (type == null) ? PasswordType.NONE : type;
		if (PasswordType.NONE != _type) {
			notBlank(username);
			notBlank(password);
		}
		return new PasswordAuthentication(_type, username, password);
	}

	public static class TokenAuthenticator implements Authentication {

		private final Supplier<String> value;

		/**
		 * Use factory method.
		 *
		 * @param value
		 */
		private TokenAuthenticator(final Supplier<String> value) {
			this.value = value;
		}

		public void accept(final AuthenticationVisitor visitor) {
			visitor.accept(this);
		}

		public String getValue() {
			return value.get();
		}

		@Override
		public boolean equals(final Object obj) {
			if (obj == this) {
				return true;
			}
			if (!(obj instanceof TokenAuthenticator)) {
				return false;
			}
			final TokenAuthenticator other = TokenAuthenticator.class.cast(obj);
			return new EqualsBuilder() //
					.append(this.value, other.value) //
					.isEquals();
		}

		@Override
		public int hashCode() {
			return new HashCodeBuilder() //
					.append(value) //
					.build();
		}

		@Override
		public String toString() {
			return reflectionToString(this, SHORT_PREFIX_STYLE);
		}

	}

	public static TokenAuthenticator token(final Supplier<String> value) {
		return new TokenAuthenticator(notNull(value));
	}

	public static class SoapClientBuilder<T>
			implements org.apache.commons.lang3.builder.Builder<CmdbuildSoapClient<T>> {

		private Class<T> proxyClass;
		private String url;
		private Authentication authentication;

		@Deprecated
		private PasswordType passwordType;
		@Deprecated
		private String username;
		@Deprecated
		private String password;

		/**
		 * @deprecated Should be private but it's kept for backward
		 *             compatibility.
		 */
		@Deprecated
		public SoapClientBuilder() {
		}

		public CmdbuildSoapClient<T> build() {
			notNull(proxyClass);
			notBlank(url);
			if (authentication == null) {
				authentication = usernameAndPassword(passwordType, username, password);
			}
			notNull(authentication);
			return new CmdbuildSoapClient<T>(this);
		}

		public SoapClientBuilder<T> forClass(final Class<T> proxyClass) {
			this.proxyClass = proxyClass;
			return this;
		}

		public SoapClientBuilder<T> withAuthentication(final Authentication authentication) {
			this.authentication = authentication;
			return this;
		}

		public SoapClientBuilder<T> withUrl(final String url) {
			this.url = url;
			return this;
		}

		@Deprecated
		public SoapClientBuilder<T> withPasswordType(final PasswordType passwordType) {
			this.passwordType = passwordType;
			return this;
		}

		@Deprecated
		public SoapClientBuilder<T> withUsername(final String username) {
			this.username = username;
			return this;
		}

		@Deprecated
		public SoapClientBuilder<T> withPassword(final String password) {
			this.password = password;
			return this;
		}

	}

	private static class MemoizingSupplier<T> implements Supplier<T> {

		private final Supplier<T> delegate;
		private transient volatile boolean initialized;
		private transient T value;

		public MemoizingSupplier(final Supplier<T> delegate) {
			this.delegate = delegate;
		}

		public T get() {
			if (!initialized) {
				synchronized (this) {
					if (!initialized) {
						final T t = delegate.get();
						value = t;
						initialized = true;
						return t;
					}
				}
			}
			return value;
		}

	}

	private final Class<T> proxyClass;
	private final String url;
	private final Authentication authentication;
	private final T proxy;

	private CmdbuildSoapClient(final SoapClientBuilder<T> builder) {
		this.proxyClass = builder.proxyClass;
		this.url = builder.url;
		this.authentication = builder.authentication;
		this.proxy = newProxy(proxyClass, new AbstractInvocationHandler() {

			private final Supplier<T> supplier = new MemoizingSupplier<T>(new Supplier<T>() {

				public T get() {
					final JaxWsProxyFactoryBean proxyFactory = new JaxWsProxyFactoryBean();
					proxyFactory.setServiceClass(proxyClass);
					proxyFactory.setAddress(url);
					final Object proxy = proxyFactory.create();
					final Client client = ClientProxy.getClient(proxy);

					final Collection<Header> headers = new ArrayList<Header>();
					client.getRequestContext().put(Header.HEADER_LIST, headers);

					final Endpoint endpoint = client.getEndpoint();

					authentication.accept(new AuthenticationVisitor() {

						public void accept(final PasswordAuthentication element) {
							switch (element.getType()) {
							case NONE:
								// nothing to do
								break;

							case TEXT:
							case DIGEST:
								final Map<String, Object> properties = new HashMap<String, Object>();
								properties.put(ACTION, USERNAME_TOKEN);
								properties.put(USER, element.getUsername());
								properties.put(PASSWORD_TYPE, element.getType().toClient());
								properties.put(PW_CALLBACK_REF,
										new ClientPasswordCallback(element.getUsername(), element.getPassword()));
								endpoint.getOutInterceptors().add(new WSS4JOutInterceptor(properties));
								break;
							}
						}

						public void accept(final TokenAuthenticator element) {
							headers.add(header("CMDBuild-Authorization", element.getValue()));
						}

					});

					return (T) proxy;
				}

			});

			@Override
			protected Object handleInvocation(final Object proxy, final Method method, final Object[] args)
					throws Throwable {
				try {
					return method.invoke(supplier.get(), args);
				} catch (final InvocationTargetException e) {
					throw e.getCause();
				}
			}

		});
	}

	public Class<T> getProxyClass() {
		return proxyClass;
	}

	public String getUrl() {
		return url;
	}

	public T getProxy() {
		return proxy;
	}

	private Header header(final String name, final String value) {
		try {
			return new Header(new QName(name), value, new JAXBDataBinding(String.class));
		} catch (final Exception e) {
			throw new RuntimeException(e);
		}
	}

	private final class ClientPasswordCallback implements CallbackHandler {

		private final String password;
		private final String username;

		public ClientPasswordCallback(final String username, final String password) {
			this.username = username;
			this.password = password;
		}

		public void handle(final Callback[] callbacks) throws IOException, UnsupportedCallbackException {
			final WSPasswordCallback pc = (WSPasswordCallback) callbacks[0];
			if (username.equals(pc.getIdentifier())) {
				pc.setPassword(password);
			}
		}
	}

	public static <T> SoapClientBuilder<T> aSoapClient() {
		return new SoapClientBuilder<T>();
	}

	@Override
	public String toString() {
		return new ToStringBuilder(this) //
				.append("proxy class", proxyClass) //
				.append("url", url) //
				.append("authentication", authentication) //
				.toString();
	}

}

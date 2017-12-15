package org.cmdbuild.services.soap;

import static com.google.common.collect.FluentIterable.from;
import static java.util.Arrays.asList;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.apache.commons.lang3.StringUtils.isNotBlank;
import static org.cmdbuild.auth.Login.LoginType.EMAIL;
import static org.cmdbuild.auth.user.Predicates.privileged;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Set;

import javax.xml.namespace.QName;

import org.apache.cxf.binding.soap.SoapMessage;
import org.apache.cxf.binding.soap.interceptor.AbstractSoapInterceptor;
import org.apache.cxf.headers.Header;
import org.apache.cxf.interceptor.Fault;
import org.apache.cxf.message.Message;
import org.apache.cxf.phase.Phase;
import org.apache.cxf.phase.PhaseInterceptor;
import org.apache.cxf.ws.security.wss4j.WSS4JInInterceptor;
import org.cmdbuild.auth.AuthenticationStore;
import org.cmdbuild.auth.Login;
import org.cmdbuild.auth.acl.CMGroup;
import org.cmdbuild.auth.acl.NullGroup;
import org.cmdbuild.auth.user.AuthenticatedUser;
import org.cmdbuild.auth.user.CMUser;
import org.cmdbuild.auth.user.ForwardingAuthenticatedUser;
import org.cmdbuild.auth.user.OperationUser;
import org.cmdbuild.logger.Log;
import org.cmdbuild.logic.auth.LoginDTO;
import org.cmdbuild.logic.auth.SessionLogic;
import org.cmdbuild.logic.auth.SoapSessionLogic;
import org.cmdbuild.services.auth.UserType;
import org.cmdbuild.services.soap.security.LoginAndGroup;
import org.cmdbuild.services.soap.security.PasswordHandler.AuthenticationString;
import org.cmdbuild.services.soap.utils.WebserviceUtils;
import org.slf4j.Logger;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.w3c.dom.Element;

import com.google.common.base.Predicate;
import com.google.common.reflect.AbstractInvocationHandler;
import com.google.common.reflect.Reflection;

public class OperationUserInterceptor extends AbstractSoapInterceptor implements ApplicationContextAware {

	private static final Logger logger = Log.SOAP;
	private static final Marker marker = MarkerFactory.getMarker(OperationUserInterceptor.class.getName());

	private static class AuthenticatedUserWithExtendedUsername extends ForwardingAuthenticatedUser {

		public static AuthenticatedUserWithExtendedUsername from(final AuthenticatedUser authenticatedUser,
				final String username) {
			return new AuthenticatedUserWithExtendedUsername(authenticatedUser, username);
		}

		private static final String SYSTEM = "system";
		private static final String FORMAT = "%s / %s";

		private final AuthenticatedUser authenticatedUser;
		private final String username;

		private AuthenticatedUserWithExtendedUsername(final AuthenticatedUser authenticatedUser,
				final String username) {
			this.authenticatedUser = authenticatedUser;
			this.username = username;
		}

		@Override
		protected AuthenticatedUser delegate() {
			return authenticatedUser;
		}

		@Override
		public String getUsername() {
			return String.format(FORMAT, SYSTEM, username);
		}

		@Override
		public boolean isPasswordExpired() {
			return authenticatedUser.isPasswordExpired();
		}

		@Override
		public LocalDateTime getPasswordExpirationTimestamp() {
			return authenticatedUser.getPasswordExpirationTimestamp();
		}

		@Override
		public LocalDateTime getLastPasswordChangeTimestamp() {
			return authenticatedUser.getLastPasswordChangeTimestamp();
		}

		@Override
		public LocalDateTime getLastExpiringNotificationTimestamp() {
			return authenticatedUser.getLastExpiringNotificationTimestamp();
		}

	}

	private static final class AuthenticatedUserWithOtherGroups extends ForwardingAuthenticatedUser {

		public static AuthenticatedUserWithOtherGroups from(final AuthenticatedUser authenticatedUser,
				final AuthenticatedUser userForGroups) {
			return new AuthenticatedUserWithOtherGroups(authenticatedUser, userForGroups);
		}

		private final AuthenticatedUser authenticatedUser;
		private final AuthenticatedUser userForGroups;

		private AuthenticatedUserWithOtherGroups(final AuthenticatedUser authenticatedUser,
				final AuthenticatedUser userForGroups) {
			this.authenticatedUser = authenticatedUser;
			this.userForGroups = userForGroups;
		}

		@Override
		protected AuthenticatedUser delegate() {
			return authenticatedUser;
		}

		@Override
		public Collection<String> getGroupNames() {
			return userForGroups.getGroupNames();
		}

		@Override
		public Collection<String> getGroupDescriptions() {
			return userForGroups.getGroupDescriptions();
		}

		@Override
		public boolean isPasswordExpired() {
			return authenticatedUser.isPasswordExpired();
		}

		@Override
		public LocalDateTime getPasswordExpirationTimestamp() {
			return authenticatedUser.getPasswordExpirationTimestamp();
		}

		@Override
		public LocalDateTime getLastPasswordChangeTimestamp() {
			return authenticatedUser.getLastPasswordChangeTimestamp();
		}

		@Override
		public LocalDateTime getLastExpiringNotificationTimestamp() {
			return authenticatedUser.getLastExpiringNotificationTimestamp();
		}

	}

	@Autowired
	private AuthenticationStore authenticationStore;

	private ApplicationContext applicationContext;

	private final WSS4JInInterceptor delegate;

	public OperationUserInterceptor(final WSS4JInInterceptor delegate) {
		super(Phase.PRE_INVOKE);
		this.delegate = delegate;
	}

	@Override
	public Collection<PhaseInterceptor<? extends Message>> getAdditionalInterceptors() {
		@SuppressWarnings("unchecked")
		final PhaseInterceptor<? extends Message> delegate =
				Reflection.newProxy(PhaseInterceptor.class, new AbstractInvocationHandler() {

					@Override
					protected Object handleInvocation(final Object proxy, final Method method, final Object[] args)
							throws Throwable {
						try {
							if ("handleMessage".equals(method.getName())) {
								final SoapMessage message = SoapMessage.class.cast(args[0]);
								if (message.hasHeader(QName.valueOf("CMDBuild-Authorization"))) {
									return null;
								}
							}
							return method.invoke(OperationUserInterceptor.this.delegate, args);
						} catch (final InvocationTargetException e) {
							throw e.getCause();
						}
					}

				});
		return asList(delegate);
	}

	@Override
	public Set<QName> getUnderstoodHeaders() {
		return delegate.getUnderstoodHeaders();
	}

	@Override
	public void setApplicationContext(final ApplicationContext applicationContext) throws BeansException {
		this.applicationContext = applicationContext;
	}

	private SessionLogic authenticationLogic() {
		return applicationContext.getBean(SoapSessionLogic.class);
	}

	@Override
	public void handleMessage(final SoapMessage message) throws Fault {
		final Header header = message.getHeader(QName.valueOf("CMDBuild-Authorization"));
		final String token =
				(header == null) ? null : Element.class.cast(header.getObject()).getFirstChild().getTextContent();
		if (isNotBlank(token)) {
			logger.debug(marker, "token found '{}'", token);
			if (authenticationLogic().exists(token)) {
				authenticationLogic().setCurrent(token);
			} else {
				throw new IllegalArgumentException(token);
			}
		} else {
			final String authData = new WebserviceUtils().getAuthData(message);
			final AuthenticationString authenticationString = new AuthenticationString(authData);
			storeOperationUser(authenticationString);
		}
	}

	private void storeOperationUser(final AuthenticationString authenticationString) {
		logger.info(marker, "storing operation user for authentication string '{}'", authenticationString);
		final LoginAndGroup loginAndGroup = loginAndGroupFor(authenticationString);
		try {
			authenticationStore.setType(UserType.APPLICATION);
			tryLogin(loginAndGroup);
			authenticationStore.setLogin(loginAndGroup.getLogin());
		} catch (final RuntimeException e) {
			logger.warn(marker, "error logging in", e);
			if (authenticationString.shouldImpersonate()) {
				/*
				 * fallback to the authentication login, should always work
				 */
				final LoginAndGroup fallbackLogin = authenticationString.getAuthenticationLogin();
				final String current = authenticationLogic().getCurrent();
				if (isNotBlank(current) && authenticationLogic().exists(current)) {
					authenticationLogic().delete(current);
				}
				tryLogin(fallbackLogin);
				authenticationStore.setLogin(loginAndGroup.getLogin());
				authenticationStore.setType(UserType.GUEST);
			} else {
				logger.error(marker, "cannot recover this error", e);
				throw e;
			}
		}
		wrapExistingOperationUser(authenticationString);
		logger.info(marker, "operation user successfully stored");
	}

	private LoginAndGroup loginAndGroupFor(final AuthenticationString authenticationString) {
		logger.debug(marker, "getting login and group for authentication string '{}'", authenticationString);
		final LoginAndGroup authenticationLogin = authenticationString.getAuthenticationLogin();
		final LoginAndGroup impersonationLogin = authenticationString.getImpersonationLogin();
		final LoginAndGroup loginAndGroup;
		if (authenticationString.shouldImpersonate()) {
			logger.debug(marker, "should authenticate");
			/*
			 * should impersonate but authentication user can be a privileged
			 * service user
			 */
			if (isPrivilegedServiceUser(authenticationLogin)) {
				/*
				 * we trust that the privileged service user has one group only
				 */
				loginAndGroup = LoginAndGroup.newInstance(authenticationLogin.getLogin());
			} else {
				loginAndGroup = impersonationLogin;
			}
		} else {
			loginAndGroup = authenticationLogin;
		}
		logger.debug(marker, "login and group are '{}'", loginAndGroup);
		return loginAndGroup;
	}

	private void wrapExistingOperationUser(final AuthenticationString authenticationString) {
		final String current = authenticationLogic().getCurrent();
		final OperationUser operationUser = authenticationLogic().getUser(current);
		final OperationUser wrapperOperationUser;
		if (authenticationString.shouldImpersonate()) {
			final AuthenticatedUser authenticatedUser = operationUser.getAuthenticatedUser();
			if (isPrivilegedServiceUser(authenticationString.getAuthenticationLogin())) {
				logger.debug(marker, "wrapping operation user with extended username");
				final String username = authenticationString.getImpersonationLogin().getLogin().getValue();
				final CMGroup group;
				if (authenticationString.impersonateForcibly()) {
					final CMGroup _group = authenticationLogic()
							.getGroupWithName(authenticationString.getImpersonationLogin().getGroup());
					if (_group instanceof NullGroup) {
						group = operationUser.getPreferredGroup();
					} else {
						group = _group;
					}
				} else {
					group = operationUser.getPreferredGroup();
				}
				wrapperOperationUser = new OperationUser( //
						AuthenticatedUserWithExtendedUsername.from(authenticatedUser, username), //
						operationUser.getPrivilegeContext(), //
						group);
			} else if (authenticationStore.getType() == UserType.DOMAIN) {
				/*
				 * we don't want that a User is represented by a Card of a user
				 * class, so we login again with the authentication user
				 *
				 * at the end we keep the authenticated user with the privileges
				 * of the impersonated... it's a total mess
				 */
				tryLogin(authenticationString.getAuthenticationLogin());
				final OperationUser _operationUser = authenticationLogic().getUser(current);
				wrapperOperationUser = new OperationUser( //
						AuthenticatedUserWithOtherGroups.from(_operationUser.getAuthenticatedUser(), authenticatedUser), //
						operationUser.getPrivilegeContext(), //
						operationUser.getPreferredGroup());
				authenticationStore.setType(UserType.DOMAIN);
			} else {
				wrapperOperationUser = operationUser;
			}
		} else {
			wrapperOperationUser = operationUser;
		}
		authenticationLogic().setUser(current, wrapperOperationUser);
	}

	private boolean isPrivilegedServiceUser(final LoginAndGroup loginAndGroup) {
		final String username = loginAndGroup.getLogin().getValue();
		final boolean privileged = from(authenticationLogic().getServiceOrPrivilegedUsers()) //
				.filter(privileged()) //
				.filter(new Predicate<CMUser>() {

					@Override
					public boolean apply(final CMUser input) {
						final Login login = Login.newInstance() //
								.withValue(username) //
								.build();
						return (login.getType() == EMAIL) ? input.getEmail().equals(username)
								: input.getUsername().equals(username);
					}

				}) //
				.first() //
				.isPresent();
		logger.debug(marker, "'{}' is {} a privileged service user", username, privileged ? EMPTY : "not");
		return privileged;
	}

	private void tryLogin(final LoginAndGroup loginAndGroup) {
		logger.debug(marker, "trying login with '{}'", loginAndGroup);
		final String id = authenticationLogic().create(loginFor(loginAndGroup));
		authenticationLogic().setCurrent(id);
	}

	private LoginDTO loginFor(final LoginAndGroup loginAndGroup) {
		return LoginDTO.newInstance() //
				.withLoginString(loginAndGroup.getLogin().getValue()) //
				.withGroupName(loginAndGroup.getGroup()) //
				.withNoPasswordRequired() //
				.build();
	}

}

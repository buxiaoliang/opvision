package org.cmdbuild.workflow.api;

import static com.google.common.reflect.Reflection.newProxy;
import static java.lang.String.format;
import static java.lang.System.currentTimeMillis;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.apache.commons.lang3.StringUtils.defaultString;
import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.cmdbuild.common.utils.Reflection.unsupported;
import static org.cmdbuild.shark.Logging.LOGGER_NAME;
import static org.cmdbuild.workflow.Constants.CURRENT_GROUP_NAME_VARIABLE;
import static org.cmdbuild.workflow.Constants.CURRENT_USER_USERNAME_VARIABLE;
import static org.cmdbuild.workflow.Constants.PROCESS_CARD_ID_VARIABLE;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Properties;

import org.cmdbuild.api.fluent.ExecutorBasedFluentApi;
import org.cmdbuild.api.fluent.FluentApi;
import org.cmdbuild.api.fluent.FluentApiExecutor;
import org.cmdbuild.api.fluent.ws.WsFluentApiExecutor;
import org.cmdbuild.common.api.mail.Configuration;
import org.cmdbuild.common.api.mail.MailApi;
import org.cmdbuild.common.api.mail.MailApiFactory;
import org.cmdbuild.services.soap.Private;
import org.cmdbuild.workflow.ConfigurationHelper;
import org.cmdbuild.workflow.CusSoapProxyBuilder;
import org.cmdbuild.workflow.api.WorkflowApiImpl.Context;
import org.enhydra.shark.Shark;
import org.enhydra.shark.api.client.wfmc.wapi.WAPI;
import org.enhydra.shark.api.client.wfmc.wapi.WMAttribute;
import org.enhydra.shark.api.client.wfmc.wapi.WMSessionHandle;
import org.enhydra.shark.api.internal.working.CallbackUtilities;

import com.google.common.base.Optional;
import com.google.common.reflect.AbstractInvocationHandler;

public class SoapSharkWorkflowApiFactory implements SharkWorkflowApiFactory {

	private static MailApi NULL_MAIL_API = newProxy(MailApi.class, unsupported("should not be used"));

	private static class ProcessData {

		public final WMSessionHandle shandle;
		public final String procInstId;

		public ProcessData(final WMSessionHandle shandle, final String procInstId) {
			this.shandle = shandle;
			this.procInstId = procInstId;
		}

	}

	private static class DelegatingWorkflowApi extends ForwardingWorkflowApi {

		private static final WorkflowApi UNSUPPORTED = newProxy(WorkflowApi.class, unsupported("delegate not setted"));

		private WorkflowApi delegate = UNSUPPORTED;

		@Override
		protected WorkflowApi delegate() {
			synchronized (this) {
				return delegate;
			}
		}

		private void setDelegate(final WorkflowApi delegate) {
			synchronized (this) {
				this.delegate = delegate;
			}
		}

	}

	private class AuditMethodInvocationHandler extends AbstractInvocationHandler {

		private final Object delegate;

		public AuditMethodInvocationHandler(final Object delegate) {
			this.delegate = delegate;
		}

		@Override
		protected Object handleInvocation(final Object proxy, final Method method, final Object[] args)
				throws Throwable {
			final long start = currentTimeMillis();
			try {
				return method.invoke(delegate, args);
			} catch (final InvocationTargetException e) {
				throw e.getCause();
			} finally {
				cus.debug(processData.shandle, LOGGER_NAME,
						format("elapsed time for method '%s': %dms", method, currentTimeMillis() - start));
			}
		}

	}

	public static class CusProperties implements CusSoapProxyBuilder.Configuration, SharkWsTypeConverter.Configuration {

		private static final String PREFIX = "org.cmdbuild.";

		private static final String WS_PREFIX = PREFIX + "ws.";
		private static final String WS_URL = WS_PREFIX + "url";
		private static final String WS_USERNAME = WS_PREFIX + "username";
		private static final String WS_PASSWORD = WS_PREFIX + "password";
		private static final String WS_TOKEN = WS_PREFIX + "token.enable";
		private static final String WS_REFERENCE_TYPE_LEGACY = WS_PREFIX + "referencetype.legacy";

		private static final boolean WS_TOKEN_DEFAULT = true;
		private static final boolean WS_REFERENCE_TYPE_LEGACY_DEFAULT = false;

		private final CallbackUtilities cus;
		private final Properties properties;

		public CusProperties(final CallbackUtilities cus) {
			this.cus = cus;
			this.properties = new Properties(cus.getProperties());
			this.properties.putAll(System.getProperties());
		}

		@Override
		public String getUrl() {
			return properties.getProperty(WS_URL);
		}

		@Override
		public String getUsername() {
			return properties.getProperty(WS_USERNAME);
		}

		@Override
		public String getPassword() {
			return properties.getProperty(WS_PASSWORD);
		}

		@Override
		public boolean isTokenEnabled() {
			final String value = properties.getProperty(WS_TOKEN);
			return isBlank(value) ? WS_TOKEN_DEFAULT : Boolean.valueOf(value);
		}

		@Override
		public void debug(final String message) {
			cus.debug(null, message);
		}

		@Override
		public boolean legacyReference() {
			final String value = properties.getProperty(WS_REFERENCE_TYPE_LEGACY);
			return isBlank(value) ? WS_REFERENCE_TYPE_LEGACY_DEFAULT : Boolean.valueOf(value);
		}

	}

	private CallbackUtilities cus;
	private ProcessData processData;

	@Override
	public void setup(final CallbackUtilities cus) {
		setup(cus, null);
	}

	@Override
	public void setup(final CallbackUtilities cus, final WMSessionHandle shandle, final String procInstId) {
		setup(cus, new ProcessData(shandle, procInstId));
	}

	private void setup(final CallbackUtilities cus, final ProcessData processData) {
		this.cus = cus;
		this.processData = processData;
	}

	@Override
	public WorkflowApi createWorkflowApi() {
		return new WorkflowApiImpl(context(defaultProxy()));
	}

	private Context context(final Private _proxy) {
		final Private proxy = newProxy(Private.class, new AuditMethodInvocationHandler(_proxy));
		return new Context() {

			// FIXME needed for cut-off circular dependency
			private final DelegatingWorkflowApi delegatingWorkflowApi = new DelegatingWorkflowApi();
			private final SchemaApi schemaApi =
					new SynchronizedSchemaApi(new CachedWsSchemaApi(new SoapSchemaApi(proxy), proxy));
			private final MailApi mailApi = SoapSharkWorkflowApiFactory.this.mailApi();
			private final SharkWsTypeConverter.Configuration configuration = new CusProperties(cus);
			private final FluentApiExecutor _wsFluentApiExecutor =
					new WsFluentApiExecutor(proxy, new SharkWsEntryTypeConverter(delegatingWorkflowApi, configuration),
							new SharkWsRawTypeConverter(delegatingWorkflowApi, configuration));
			private final FluentApiExecutor wsFluentApiExecutor =
					newProxy(FluentApiExecutor.class, new AuditMethodInvocationHandler(_wsFluentApiExecutor));
			private final SharkFluentApiExecutor executor = new SharkFluentApiExecutor(wsFluentApiExecutor,
					currentProcessId(), new MonostateSelfSuspensionRequestHolder());
			private final FluentApi fluentApi = new ExecutorBasedFluentApi(executor);

			@Override
			public FluentApi fluentApi() {
				return fluentApi;
			}

			@Override
			public Private proxy() {
				return proxy;
			}

			@Override
			public SchemaApi schemaApi() {
				return schemaApi;
			}

			@Override
			public MailApi mailApi() {
				return mailApi;
			}

			@Override
			public void callback(final WorkflowApiImpl object) {
				delegatingWorkflowApi.setDelegate(object);
			}

			@Override
			public Context impersonate(final String username, final String group) {
				return context(SoapSharkWorkflowApiFactory.this.impersonatedProxy(username, group));
			}

		};
	}

	private Private defaultProxy() {
		return new CusSoapProxyBuilder(new CusProperties(cus)) //
				.withUsername(defaultString(currentUserOrEmptyOnError(), currentUserOrEmptyOnError())) //
				.withGroup(defaultString(currentGroupOrEmptyOnError(), currentGroupOrEmptyOnError())) //
				.build();
	}

	private Private impersonatedProxy(final String username, final String group) {
		return new CusSoapProxyBuilder(new CusProperties(cus)) //
				.withUsername(defaultString(username, currentUserOrEmptyOnError())) //
				.withGroup(defaultString(group, currentGroupOrEmptyOnError())) //
				.forciblyImpersonate(true) //
				.build();
	}

	private String currentUserOrEmptyOnError() {
		if (processData == null) {
			return EMPTY;
		}

		try {
			final WMAttribute attribute = wapi().getProcessInstanceAttributeValue(processData.shandle,
					processData.procInstId, CURRENT_USER_USERNAME_VARIABLE);
			final Object value = attribute.getValue();
			return String.class.cast(value);
		} catch (final Throwable e) {
			return EMPTY;
		}
	}

	private String currentGroupOrEmptyOnError() {
		if (processData == null) {
			return EMPTY;
		}

		try {
			final WMAttribute attribute = wapi().getProcessInstanceAttributeValue(processData.shandle,
					processData.procInstId, CURRENT_GROUP_NAME_VARIABLE);
			final Object value = attribute.getValue();
			return String.class.cast(value);
		} catch (final Throwable e) {
			return EMPTY;
		}
	}

	private Optional<Long> currentProcessId() {
		if (processData == null) {
			return Optional.absent();
		}

		try {
			final WMAttribute attribute = wapi().getProcessInstanceAttributeValue(processData.shandle,
					processData.procInstId, PROCESS_CARD_ID_VARIABLE);
			final Object value = attribute.getValue();
			return Optional.of(Number.class.cast(value).longValue());
		} catch (final Throwable e) {
			return Optional.absent();
		}
	}

	private WAPI wapi() throws Exception {
		return Shark.getInstance().getWAPIConnection();
	}

	private MailApi mailApi() {
		try {
			final ConfigurationHelper helper = new ConfigurationHelper(cus);
			final Configuration.All mailApiConfiguration = helper.getMailApiConfiguration();
			final MailApiFactory mailApiFactory = helper.getMailApiFactory();
			return mailApiFactory.create(mailApiConfiguration);
		} catch (final Exception e) {
			return NULL_MAIL_API;
		}
	}

}

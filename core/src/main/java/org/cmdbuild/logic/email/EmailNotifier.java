package org.cmdbuild.logic.email;

import static com.google.common.reflect.Reflection.newProxy;
import static org.apache.commons.lang3.StringUtils.defaultString;
import static org.cmdbuild.common.utils.Reflection.unsupported;
import static org.cmdbuild.logic.email.EmailLogic.Statuses.outgoing;
import static org.joda.time.DateTime.now;

import java.util.Map;

import org.cmdbuild.logic.email.EmailAttachmentsLogic.Attachment;
import org.cmdbuild.logic.email.EmailLogic.Email;
import org.cmdbuild.logic.email.EmailLogic.ForwardingEmail;
import org.cmdbuild.logic.email.EmailLogic.Status;
import org.cmdbuild.logic.email.EmailQueueCommand.Notifier;
import org.cmdbuild.logic.email.EmailTemplateLogic.Template;
import org.joda.time.DateTime;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

public class EmailNotifier implements Notifier {

	public static interface Configuration {

		String account();

		String template();

		String destination();

	}

	public static final String DEFAULT_SUBJECT = "DMS Service unavailable";
	public static final String DEFAULT_CONTENT = //
			"CMDBuild email service is unable to access the DMS service. " //
					+ "Some emails could have been sent without attachments. " //
					+ "Check logs for more information.";

	private static class TemplateAdapter extends ForwardingEmail {

		private static final Email UNSUPPORTED = newProxy(Email.class, unsupported("unsupported"));

		private final Template delegate;

		public TemplateAdapter(final Template delegate) {
			this.delegate = delegate;
		}

		@Override
		protected Email delegate() {
			return UNSUPPORTED;
		}

		@Override
		public Long getId() {
			return null;
		}

		@Override
		public String getFromAddress() {
			return delegate.getFrom();
		}

		@Override
		public String getToAddresses() {
			return delegate.getTo();
		}

		@Override
		public String getCcAddresses() {
			return delegate.getCc();
		}

		@Override
		public String getBccAddresses() {
			return delegate.getBcc();
		}

		@Override
		public String getSubject() {
			return delegate.getSubject();
		}

		@Override
		public String getContent() {
			return delegate.getBody();
		}

		@Override
		public DateTime getDate() {
			return now();
		}

		@Override
		public String getNotifyWith() {
			return null;
		}

		@Override
		public boolean isNoSubjectPrefix() {
			return false;
		}

		@Override
		public String getAccount() {
			return delegate.getAccount();
		}

		@Override
		public boolean isTemporary() {
			return false;
		}

		@Override
		public String getTemplate() {
			return delegate.getName();
		}

		@Override
		public boolean isKeepSynchronization() {
			return delegate.isKeepSynchronization();
		}

		@Override
		public boolean isPromptSynchronization() {
			return delegate.isPromptSynchronization();
		}

		@Override
		public long getDelay() {
			return delegate.getDelay();
		}

	}

	private static final Marker MARKER = MarkerFactory.getMarker(ForgivingNotifier.class.getName());

	private final Configuration configuration;
	private final EmailTemplateLogic emailTemplateLogic;
	private final EmailLogic emailLogic;

	public EmailNotifier(final Configuration configuration, final EmailTemplateLogic emailTemplateLogic,
			final EmailLogic emailLogic) {
		this.configuration = configuration;
		this.emailTemplateLogic = emailTemplateLogic;
		this.emailLogic = emailLogic;
	}

	@Override
	public void dmsError(final Email email, final Attachment attachment) {
		final Email template = new TemplateAdapter(template());
		final Email notification = new ForwardingEmail() {

			@Override
			protected Email delegate() {
				return template;
			}

			@Override
			public String getToAddresses() {
				return defaultString(super.getToAddresses(), configuration.destination());
			}

			@Override
			public Long getReference() {
				return email.getId();
			}

			@Override
			public String getAccount() {
				return defaultString(super.getAccount(), configuration.account());
			}

		};
		final Long id = emailLogic.create(notification);
		emailLogic.update(new ForwardingEmail() {

			@Override
			protected Email delegate() {
				return notification;
			}

			@Override
			public Long getId() {
				return id;
			}

			@Override
			public Status getStatus() {
				return outgoing();
			}

		});
	}

	private Template template() {
		try {
			return emailTemplateLogic.read(configuration.template());
		} catch (final Exception e) {
			logger.warn(MARKER, "error getting template, using default one", e);
			return new Template() {

				@Override
				public Long getId() {
					return null;
				}

				@Override
				public String getName() {
					return null;
				}

				@Override
				public String getDescription() {
					return null;
				}

				@Override
				public String getFrom() {
					return null;
				}

				@Override
				public String getTo() {
					return configuration.destination();
				}

				@Override
				public String getCc() {
					return null;
				}

				@Override
				public String getBcc() {
					return null;
				}

				@Override
				public String getSubject() {
					return DEFAULT_SUBJECT;
				}

				@Override
				public String getBody() {
					return DEFAULT_CONTENT;
				}

				@Override
				public String getAccount() {
					return null;
				}

				@Override
				public boolean isKeepSynchronization() {
					return false;
				}

				@Override
				public boolean isPromptSynchronization() {
					return false;
				}

				@Override
				public long getDelay() {
					return 0;
				}

				@Override
				public Map<String, String> getVariables() {
					return null;
				}

			};
		}
	}

}
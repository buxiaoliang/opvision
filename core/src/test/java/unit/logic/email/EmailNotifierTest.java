package unit.logic.email;

import static com.google.common.reflect.Reflection.newProxy;
import static org.cmdbuild.common.utils.Reflection.unsupported;
import static org.cmdbuild.logic.email.EmailLogic.Statuses.outgoing;
import static org.cmdbuild.logic.email.EmailNotifier.DEFAULT_CONTENT;
import static org.cmdbuild.logic.email.EmailNotifier.DEFAULT_SUBJECT;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import java.util.NoSuchElementException;

import org.cmdbuild.logic.email.EmailAttachmentsLogic.Attachment;
import org.cmdbuild.logic.email.EmailLogic;
import org.cmdbuild.logic.email.EmailLogic.Email;
import org.cmdbuild.logic.email.EmailNotifier;
import org.cmdbuild.logic.email.EmailNotifier.Configuration;
import org.cmdbuild.logic.email.EmailTemplateLogic;
import org.cmdbuild.logic.email.EmailTemplateLogic.Template;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;

public class EmailNotifierTest {

	private static class DummyException extends Exception {

		private static final long serialVersionUID = 1L;

	}

	private static final Attachment unused = newProxy(Attachment.class, unsupported("should not be used"));

	private Configuration configuration;
	private EmailTemplateLogic emailTemplateLogic;
	private EmailLogic emailLogic;
	private EmailNotifier underTest;

	@Before
	public void setUp() throws Exception {
		configuration = mock(Configuration.class);
		emailTemplateLogic = mock(EmailTemplateLogic.class);
		emailLogic = mock(EmailLogic.class);
		underTest = new EmailNotifier(configuration, emailTemplateLogic, emailLogic);
	}

	@Test
	public void templateNotFoundOrUnexpectedExceptionLookingForIt() throws Exception {
		// given
		doReturn("the account name").when(configuration).account();
		doReturn("the template name").when(configuration).template();
		doReturn("the destination address").when(configuration).destination();
		doThrow(DummyException.class).when(emailTemplateLogic).read(anyString());
		doReturn(42L).when(emailLogic).create(any(Email.class));
		final Email email = mock(Email.class);
		doReturn(123L).when(email).getId();

		// when
		underTest.dmsError(email, unused);

		// then
		final ArgumentCaptor<Email> captor = ArgumentCaptor.forClass(Email.class);
		verify(configuration).template();
		verify(emailTemplateLogic).read(eq("the template name"));

		verify(emailLogic).create(captor.capture());
		final Email create = captor.getValue();
		assertThat(create.getToAddresses(), equalTo("the destination address"));
		assertThat(create.getSubject(), equalTo(DEFAULT_SUBJECT));
		assertThat(create.getContent(), equalTo(DEFAULT_CONTENT));
		assertThat(create.getAccount(), equalTo("the account name"));
		assertThat(create.getReference(), equalTo(123L));

		verify(emailLogic).update(captor.capture());
		final Email update = captor.getValue();
		assertThat(update.getId(), equalTo(42L));
		assertThat(update.getToAddresses(), equalTo("the destination address"));
		assertThat(update.getSubject(), equalTo(DEFAULT_SUBJECT));
		assertThat(update.getContent(), equalTo(DEFAULT_CONTENT));
		assertThat(update.getAccount(), equalTo("the account name"));
		assertThat(update.getStatus(), equalTo(outgoing()));
		assertThat(update.getReference(), equalTo(123L));

		verify(configuration, times(2)).account();
		verify(configuration, times(4)).destination();
		verifyNoMoreInteractions(configuration, emailTemplateLogic, emailLogic);
	}

	@Test(expected = DummyException.class)
	public void unexpectedExceptionCreatingEmail() throws Exception {
		// given
		doReturn("the account name").when(configuration).account();
		doReturn("the template name").when(configuration).template();
		doReturn("the destination address").when(configuration).destination();
		doThrow(NoSuchElementException.class).when(emailTemplateLogic).read(anyString());
		doThrow(DummyException.class).when(emailLogic).create(any(Email.class));
		final Email email = mock(Email.class);
		doReturn(123L).when(email).getId();

		// when
		try {
			underTest.dmsError(email, unused);
		} finally {
			// then
			final ArgumentCaptor<Email> captor = ArgumentCaptor.forClass(Email.class);
			verify(configuration).template();
			verify(emailTemplateLogic).read(eq("the template name"));

			verify(emailLogic).create(captor.capture());
			final Email create = captor.getValue();
			assertThat(create.getToAddresses(), equalTo("the destination address"));
			assertThat(create.getSubject(), equalTo(DEFAULT_SUBJECT));
			assertThat(create.getContent(), equalTo(DEFAULT_CONTENT));
			assertThat(create.getAccount(), equalTo("the account name"));
			assertThat(create.getReference(), equalTo(123L));

			verify(configuration, times(1)).account();
			verify(configuration, times(2)).destination();
			verifyNoMoreInteractions(configuration, emailTemplateLogic, emailLogic);
		}
	}

	@Test(expected = DummyException.class)
	public void unexpectedExceptionUpdatingEmail() throws Exception {
		// given
		doReturn("the account name").when(configuration).account();
		doReturn("the template name").when(configuration).template();
		doReturn("the destination address").when(configuration).destination();
		doThrow(NoSuchElementException.class).when(emailTemplateLogic).read(anyString());
		doReturn(42L).when(emailLogic).create(any(Email.class));
		doThrow(DummyException.class).when(emailLogic).update(any(Email.class));
		final Email email = mock(Email.class);
		doReturn(123L).when(email).getId();

		// when
		try {
			underTest.dmsError(email, unused);
		} finally {
			// then
			final ArgumentCaptor<Email> captor = ArgumentCaptor.forClass(Email.class);
			verify(configuration).template();
			verify(emailTemplateLogic).read(eq("the template name"));

			verify(emailLogic).create(captor.capture());
			final Email create = captor.getValue();
			assertThat(create.getToAddresses(), equalTo("the destination address"));
			assertThat(create.getSubject(), equalTo(DEFAULT_SUBJECT));
			assertThat(create.getContent(), equalTo(DEFAULT_CONTENT));
			assertThat(create.getAccount(), equalTo("the account name"));
			assertThat(create.getReference(), equalTo(123L));

			verify(emailLogic).update(captor.capture());
			final Email update = captor.getValue();
			assertThat(update.getId(), equalTo(42L));
			assertThat(update.getToAddresses(), equalTo("the destination address"));
			assertThat(update.getSubject(), equalTo(DEFAULT_SUBJECT));
			assertThat(update.getContent(), equalTo(DEFAULT_CONTENT));
			assertThat(update.getAccount(), equalTo("the account name"));
			assertThat(update.getStatus(), equalTo(outgoing()));
			assertThat(update.getReference(), equalTo(123L));

			verify(configuration, times(2)).account();
			verify(configuration, times(4)).destination();
			verifyNoMoreInteractions(configuration, emailTemplateLogic, emailLogic);
		}
	}

	@Test
	public void templateFoundButMissesDestinationAddress() throws Exception {
		// given
		doReturn("the account name").when(configuration).account();
		doReturn("the template name").when(configuration).template();
		doReturn("the destination address").when(configuration).destination();
		final Template template = mock(Template.class);
		doReturn("the template's subject").when(template).getSubject();
		doReturn("the template's body").when(template).getBody();
		doReturn(template).when(emailTemplateLogic).read(anyString());
		doReturn(42L).when(emailLogic).create(any(Email.class));
		final Email email = mock(Email.class);
		doReturn(123L).when(email).getId();

		// when
		underTest.dmsError(email, unused);

		// then
		final ArgumentCaptor<Email> captor = ArgumentCaptor.forClass(Email.class);
		verify(configuration).template();
		verify(emailTemplateLogic).read(eq("the template name"));

		verify(emailLogic).create(captor.capture());
		final Email create = captor.getValue();
		assertThat(create.getToAddresses(), equalTo("the destination address"));
		assertThat(create.getSubject(), equalTo("the template's subject"));
		assertThat(create.getContent(), equalTo("the template's body"));
		assertThat(create.getAccount(), equalTo("the account name"));
		assertThat(create.getReference(), equalTo(123L));

		verify(emailLogic).update(captor.capture());
		final Email update = captor.getValue();
		assertThat(update.getId(), equalTo(42L));
		assertThat(update.getToAddresses(), equalTo("the destination address"));
		assertThat(update.getSubject(), equalTo("the template's subject"));
		assertThat(update.getContent(), equalTo("the template's body"));
		assertThat(update.getAccount(), equalTo("the account name"));
		assertThat(update.getStatus(), equalTo(outgoing()));
		assertThat(update.getReference(), equalTo(123L));

		verify(configuration, times(2)).account();
		verify(configuration, times(2)).destination();
		verifyNoMoreInteractions(configuration, emailTemplateLogic, emailLogic);
	}

	@Test
	public void templateFound() throws Exception {
		// given
		doReturn("the account name").when(configuration).account();
		doReturn("the template name").when(configuration).template();
		doReturn("the destination address").when(configuration).destination();
		final Template template = mock(Template.class);
		doReturn("the template's destination").when(template).getTo();
		doReturn("the template's subject").when(template).getSubject();
		doReturn("the template's body").when(template).getBody();
		doReturn(template).when(emailTemplateLogic).read(anyString());
		doReturn(42L).when(emailLogic).create(any(Email.class));
		final Email email = mock(Email.class);
		doReturn(123L).when(email).getId();

		// when
		underTest.dmsError(email, unused);

		// then
		final ArgumentCaptor<Email> captor = ArgumentCaptor.forClass(Email.class);
		verify(configuration).template();
		verify(emailTemplateLogic).read(eq("the template name"));
		verify(emailLogic).create(captor.capture());
		verify(emailLogic).update(captor.capture());
		verifyNoMoreInteractions(configuration, emailTemplateLogic, emailLogic);

		final Email create = captor.getAllValues().get(0);
		assertThat(create.getToAddresses(), equalTo("the template's destination"));
		assertThat(create.getSubject(), equalTo("the template's subject"));
		assertThat(create.getContent(), equalTo("the template's body"));
		assertThat(create.getAccount(), equalTo("the account name"));
		assertThat(create.getReference(), equalTo(123L));

		final Email update = captor.getAllValues().get(1);
		assertThat(update.getId(), equalTo(42L));
		assertThat(update.getToAddresses(), equalTo("the template's destination"));
		assertThat(update.getSubject(), equalTo("the template's subject"));
		assertThat(update.getContent(), equalTo("the template's body"));
		assertThat(update.getAccount(), equalTo("the account name"));
		assertThat(update.getStatus(), equalTo(outgoing()));
		assertThat(update.getReference(), equalTo(123L));
	}

}

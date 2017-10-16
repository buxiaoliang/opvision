package unit.logic.email;

import static com.google.common.base.Optional.absent;
import static com.google.common.collect.Iterables.size;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import javax.activation.DataHandler;

import org.cmdbuild.logic.email.EmailAttachmentsLogic;
import org.cmdbuild.logic.email.EmailAttachmentsLogic.Attachment;
import org.cmdbuild.logic.email.EmailLogic.Email;
import org.cmdbuild.logic.email.EmailQueueCommand.Notifier;
import org.cmdbuild.logic.email.NotifyingEmailAttachmentsLogic;
import org.junit.Test;

import com.google.common.base.Optional;

public class NotifyingEmailAttachmentsLogicTest {

	private static class DummyException extends Exception {

		private static final long serialVersionUID = 1L;

	}

	@Test
	public void readAllThrowsException() throws Exception {
		// given
		final EmailAttachmentsLogic delegate = mock(EmailAttachmentsLogic.class);
		final Notifier notifier = mock(Notifier.class);
		final NotifyingEmailAttachmentsLogic underTest = new NotifyingEmailAttachmentsLogic(delegate, notifier);

		final Email email = mock(Email.class);
		doThrow(DummyException.class).when(delegate).readAll(email);

		// when
		final Iterable<Attachment> output = underTest.readAll(email);

		// then
		verify(delegate).readAll(eq(email));
		verify(notifier).dmsError(eq(email), eq(null));
		verifyNoMoreInteractions(delegate, notifier);

		assertThat(size(output), equalTo(0));
	}

	@Test
	public void readThrowsException() throws Exception {
		// given
		final EmailAttachmentsLogic delegate = mock(EmailAttachmentsLogic.class);
		final Notifier notifier = mock(Notifier.class);
		final NotifyingEmailAttachmentsLogic underTest = new NotifyingEmailAttachmentsLogic(delegate, notifier);

		final Email email = mock(Email.class);
		final Attachment attachment = mock(Attachment.class);
		doThrow(DummyException.class).when(delegate).read(email, attachment);

		// when
		final Optional<DataHandler> output = underTest.read(email, attachment);

		// then
		verify(delegate).read(eq(email), eq(attachment));
		verify(notifier).dmsError(eq(email), eq(attachment));
		verifyNoMoreInteractions(delegate, notifier);

		assertThat(output, equalTo(absent()));
	}

}

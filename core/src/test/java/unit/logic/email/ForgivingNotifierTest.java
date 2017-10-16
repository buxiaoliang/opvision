package unit.logic.email;

import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import org.cmdbuild.logic.email.EmailAttachmentsLogic.Attachment;
import org.cmdbuild.logic.email.EmailLogic.Email;
import org.cmdbuild.logic.email.EmailQueueCommand.Notifier;
import org.cmdbuild.logic.email.ForgivingNotifier;
import org.junit.Test;

public class ForgivingNotifierTest {

	private static class DummyException extends Exception {

		private static final long serialVersionUID = 1L;

	}

	@Test
	public void dmsError_EmailAttachment_ErrorsAreNotThrowed() throws Exception {
		// given
		final Notifier delegate = mock(Notifier.class);
		final ForgivingNotifier underTest = new ForgivingNotifier(delegate);

		final Email email = mock(Email.class);
		final Attachment attachment = mock(Attachment.class);
		doThrow(DummyException.class).when(delegate).dmsError(email, attachment);

		// when
		underTest.dmsError(email, attachment);

		// then
		verify(delegate).dmsError(eq(email), eq(attachment));
		verifyNoMoreInteractions(delegate);
	}

}

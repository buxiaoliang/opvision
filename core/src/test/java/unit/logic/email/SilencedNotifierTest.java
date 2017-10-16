package unit.logic.email;

import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import org.cmdbuild.logic.email.EmailAttachmentsLogic.Attachment;
import org.cmdbuild.logic.email.EmailLogic.Email;
import org.cmdbuild.logic.email.EmailQueueCommand.Notifier;
import org.cmdbuild.logic.email.SilencedNotifier;
import org.cmdbuild.logic.email.SilencedNotifier.Silence;
import org.junit.Test;

public class SilencedNotifierTest {

	@Test
	public void dmsErrorSilencedAtNeed() throws Exception {
		// given
		final Silence silence = mock(Silence.class);
		final Notifier delegate = mock(Notifier.class);
		final SilencedNotifier underTest = new SilencedNotifier(silence, delegate);

		doReturn(false).doReturn(true).doReturn(false).doReturn(true).when(silence).keep();
		final Email email = mock(Email.class);
		final Attachment attachment = mock(Attachment.class);

		// when
		underTest.dmsError(email, attachment);
		verify(delegate, times(1)).dmsError(eq(email), eq(attachment));
		underTest.dmsError(email, attachment);
		verify(delegate, times(1)).dmsError(eq(email), eq(attachment));
		underTest.dmsError(email, attachment);
		verify(delegate, times(2)).dmsError(eq(email), eq(attachment));
		underTest.dmsError(email, attachment);
		verify(delegate, times(2)).dmsError(eq(email), eq(attachment));
		underTest.dmsError(email, attachment);
		underTest.dmsError(email, attachment);

		// then
		verify(delegate, times(2)).dmsError(eq(email), eq(attachment));
		verifyNoMoreInteractions(delegate);
	}

}

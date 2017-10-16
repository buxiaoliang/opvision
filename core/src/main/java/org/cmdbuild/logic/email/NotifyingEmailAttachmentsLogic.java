package org.cmdbuild.logic.email;

import static com.google.common.base.Optional.absent;
import static java.util.Collections.emptyList;

import javax.activation.DataHandler;

import org.cmdbuild.exception.CMDBException;
import org.cmdbuild.logic.email.EmailAttachmentsLogic.ForwardingEmailAttachmentsLogic;
import org.cmdbuild.logic.email.EmailLogic.Email;
import org.cmdbuild.logic.email.EmailQueueCommand.Notifier;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

import com.google.common.base.Optional;

public class NotifyingEmailAttachmentsLogic extends ForwardingEmailAttachmentsLogic {

	private static final Marker MARKER = MarkerFactory.getMarker(EmailQueueCommand.class.getName());

	private static final Iterable<Attachment> NO_ATTACHMENTS = emptyList();

	private final Notifier notifier;
	private final EmailAttachmentsLogic delegate;

	public NotifyingEmailAttachmentsLogic(final EmailAttachmentsLogic delegate, final Notifier notifier) {
		this.notifier = notifier;
		this.delegate = delegate;
	}

	@Override
	protected EmailAttachmentsLogic delegate() {
		return delegate;
	}

	@Override
	public Iterable<Attachment> readAll(final Email email) throws CMDBException {
		try {
			return super.readAll(email);
		} catch (final Exception e) {
			logger.warn(MARKER, "error reading attachments, skipping", e);
			notifier.dmsError(email, null);
			return NO_ATTACHMENTS;
		}
	}

	@Override
	public Optional<DataHandler> read(final Email email, final Attachment attachment) throws CMDBException {
		try {
			return super.read(email, attachment);
		} catch (final Exception e) {
			logger.debug(MARKER, "error reading attachment, skipping", e);
			notifier.dmsError(email, attachment);
			return absent();
		}
	}

}

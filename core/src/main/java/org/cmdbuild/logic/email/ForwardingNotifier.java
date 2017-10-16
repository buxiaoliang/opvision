package org.cmdbuild.logic.email;

import org.cmdbuild.logic.email.EmailAttachmentsLogic.Attachment;
import org.cmdbuild.logic.email.EmailLogic.Email;
import org.cmdbuild.logic.email.EmailQueueCommand.Notifier;

import com.google.common.collect.ForwardingObject;

public abstract class ForwardingNotifier extends ForwardingObject implements Notifier {

	/**
	 * Usable by subclasses only.
	 */
	protected ForwardingNotifier() {
	}

	@Override
	protected abstract Notifier delegate();

	@Override
	public void dmsError(final Email email, final Attachment attachment) {
		delegate().dmsError(email, attachment);
	}

}

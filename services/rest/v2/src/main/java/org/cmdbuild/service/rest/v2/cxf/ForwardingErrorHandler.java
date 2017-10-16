package org.cmdbuild.service.rest.v2.cxf;

import com.google.common.collect.ForwardingObject;

public abstract class ForwardingErrorHandler extends ForwardingObject implements ErrorHandler {

	/**
	 * Usable by subclasses only.
	 */
	protected ForwardingErrorHandler() {
	}

	@Override
	protected abstract ErrorHandler delegate();

	@Override
	public void alreadyExistingAttachmentName(final String value) {
		delegate().alreadyExistingAttachmentName(value);
	}

	@Override
	public void attachmentNotFound(final String value) {
		delegate().attachmentNotFound(value);
	}

	@Override
	public void attributeNotFound(final String value) {
		delegate().attributeNotFound(value);
	}

	@Override
	public void cardNotFound(final Long value) {
		delegate().cardNotFound(value);
	}

	@Override
	public void classNotFound(final String value) {
		delegate().classNotFound(value);
	}

	@Override
	public void classNotFoundClassIsProcess(final String value) {
		delegate().classNotFoundClassIsProcess(value);
	}

	@Override
	public void dataStoreNotFound(final String value) {
		delegate().dataStoreNotFound(value);
	}

	@Override
	public void differentAttachmentName(final String value) {
		delegate().differentAttachmentName(value);
	}

	@Override
	public void domainNotFound(final String value) {
		delegate().domainNotFound(value);
	}

	@Override
	public void domainTreeNotFound(final String value) {
		delegate().domainTreeNotFound(value);
	}

	@Override
	public void duplicateFileName(final String value) {
		delegate().duplicateFileName(value);
	}

	@Override
	public void extensionNotFound(final String value) {
		delegate().extensionNotFound(value);
	}

	@Override
	public void fileNotCreated() {
		delegate().fileNotCreated();
	}

	@Override
	public void fileNotFound(final String value) {
		delegate().fileNotFound(value);
	}

	@Override
	public void filterNotFound(final Long value) {
		delegate().filterNotFound(value);
	}

	@Override
	public void folderNotFound(final String value) {
		delegate().folderNotFound(value);
	}

	@Override
	public void functionNotFound(final Long value) {
		delegate().functionNotFound(value);
	}

	@Override
	public void invalidIconType(final String type) {
		delegate().invalidIconType(type);
	}

	@Override
	public void invalidType(final String value) {
		delegate().invalidType(value);
	}

	@Override
	public void lookupTypeNotFound(final String value) {
		delegate().lookupTypeNotFound(value);
	}

	@Override
	public void missingAttachmentId() {
		delegate().missingAttachmentId();
	}

	@Override
	public void missingAttachmentMetadata() {
		delegate().missingAttachmentMetadata();
	}

	@Override
	public void missingAttachmentName() {
		delegate().missingAttachmentName();
	}

	@Override
	public void missingFile() {
		delegate().missingFile();
	}

	@Override
	public void missingIcon(final Long value) {
		delegate().missingIcon(value);
	}

	@Override
	public void missingParam(final String value) {
		delegate().missingParam(value);
	}

	@Override
	public void missingPassword() {
		delegate().missingPassword();
	}

	@Override
	public void missingUsername() {
		delegate().missingUsername();
	}

	@Override
	public void notAuthorized() {
		delegate().notAuthorized();
	}

	@Override
	public void processActivityNotFound(final String value) {
		delegate().processActivityNotFound(value);
	}

	@Override
	public void processInstanceNotFound(final Long value) {
		delegate().processInstanceNotFound(value);
	}

	@Override
	public void processNotFound(final String value) {
		delegate().processNotFound(value);
	}

	@Override
	public void propagate(final Throwable e) {
		delegate().propagate(e);
	}

	@Override
	public void relationNotFound(final Long value) {
		delegate().relationNotFound(value);
	}

	@Override
	public void reportNotFound(final Long value) {
		delegate().reportNotFound(value);
	}

	@Override
	public void roleNotFound(final String value) {
		delegate().roleNotFound(value);
	}

	@Override
	public void sessionNotFound(final String value) {
		delegate().sessionNotFound(value);
	}

}

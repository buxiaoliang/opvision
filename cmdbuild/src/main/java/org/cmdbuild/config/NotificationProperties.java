package org.cmdbuild.config;

import org.cmdbuild.services.Settings;

public class NotificationProperties extends DefaultProperties {

	private static final long serialVersionUID = 1L;

	private static final String MODULE_NAME = "notification";

	private static final String ENABLE = "notification.enable";
	private static final String EMAIL_DMS_ACCOUNT = "notification.email.dms.account";
	private static final String EMAIL_DMS_TEMPLATE = "notification.email.dms.template";
	private static final String EMAIL_DMS_DESTINATION = "notification.email.dms.destination";
	private static final String EMAIL_DMS_SILENCE = "notification.email.dms.silence";

	public NotificationProperties() {
		super();
		setProperty(ENABLE, "false");
		setProperty(EMAIL_DMS_ACCOUNT, "");
		setProperty(EMAIL_DMS_TEMPLATE, "");
		setProperty(EMAIL_DMS_DESTINATION, "");
		setProperty(EMAIL_DMS_SILENCE, "0");
	}

	public static NotificationProperties getInstance() {
		return (NotificationProperties) Settings.getInstance().getModule(MODULE_NAME);
	}

	public boolean isEnable() {
		return Boolean.valueOf(getProperty(ENABLE));
	}

	public String getEmailDmsAccount() {
		return getProperty(EMAIL_DMS_ACCOUNT);
	}

	public String getEmailDmsTemplate() {
		return getProperty(EMAIL_DMS_TEMPLATE);
	}

	public String getEmailDmsDestination() {
		return getProperty(EMAIL_DMS_DESTINATION);
	}

	public int getEmailDmsSilence() {
		return Integer.valueOf(getProperty(EMAIL_DMS_SILENCE));
	}

}

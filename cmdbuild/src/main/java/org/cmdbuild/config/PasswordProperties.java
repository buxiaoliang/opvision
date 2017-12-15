package org.cmdbuild.config;

import org.cmdbuild.services.Settings;

public final class PasswordProperties extends DefaultProperties {
	
	private static final long serialVersionUID = 1L;

	private static final String MODULE_NAME = "password";
	
	public static String propertyPrefix = "org.cmdbuild.config.password.";
	
	//ENABLE OR DISABLE FEATURE
	
	/**
	 * Main flag: if false the whole feature is disabled
	 */
	public static String MANAGE = propertyPrefix + "enable-password-change-management";
	
	//UI INTERACTION 
	
	/**
	 * Helper message for user ( html allowed ) 
	 */
	public static String HELPER_MESSAGE = propertyPrefix + "helper-message";
	/**
	 * If 0 or less, do not notify user his password is about to expire, otherwise warn user this amount of days before password expires
	 * Warn user (via email) 
	 */
	public static String FOREWARNING_DAYS = propertyPrefix + "forewarning-days";
	
	//PASSWORD RULES
	public static String PASSWORD_MAX_AGE_DAYS = propertyPrefix +  "max-password-age-days";
	public static String DIFFER_FROM_PREVIOUS = propertyPrefix + "differ-from-previous";
	public static String DIFFER_FROM_USERNAME = propertyPrefix + "differ-from-username";
	public static String MIN_LENGTH =propertyPrefix + "min-length";
	public static String REQUIRE_DIGIT = propertyPrefix + "require-digit";
	public static String REQUIRE_LOWERCASE = propertyPrefix + "require-lowercase";
	public static String REQUIRE_UPPERCASE = propertyPrefix + "require-uppercase";
	
	public PasswordProperties(PropertyContainer propertyContainer) {
		super(propertyContainer);
		
		//DEFAULTS
		setProperty(MANAGE, Boolean.FALSE.toString());
		setProperty(HELPER_MESSAGE, "Helper message not defined. Please contact your administrator...");
		setP(FOREWARNING_DAYS, "7");
		
		setP(PASSWORD_MAX_AGE_DAYS, "365");
		setP(DIFFER_FROM_PREVIOUS, Boolean.TRUE.toString());
		setP(DIFFER_FROM_USERNAME, Boolean.TRUE.toString());
		setP(MIN_LENGTH, "6");
		setP(REQUIRE_DIGIT, "false");
		setP(REQUIRE_LOWERCASE, "false");
		setP(REQUIRE_UPPERCASE, "false");
		
	}
	
	private void setP(String key, Object oVal) {
		if (oVal != null) {
			setProperty(key, oVal.toString());
		} else {
			setProperty(key, "null");
		}
	}

	public static PasswordProperties getInstance() {
		return (PasswordProperties) Settings.getInstance().getModule(MODULE_NAME);
	}

	//Comfort getters
	public String getAsString(String key) {
		Object val =  getProperty(key, null);
		if (val == null)
			return null;
		else
			return val.toString();
	}
	
}

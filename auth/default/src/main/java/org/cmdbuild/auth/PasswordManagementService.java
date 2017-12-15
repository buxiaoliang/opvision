package org.cmdbuild.auth;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;

import org.passay.LengthRule;
import org.passay.PasswordData;
import org.passay.PasswordValidator;
import org.passay.Rule;
import org.passay.RuleResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.passay.CharacterRule;
import org.passay.EnglishCharacterData;

//TODO: check if spring scheduling is really needed
//@EnableScheduling
@ComponentScan
@Component
public class PasswordManagementService {
	
	protected static boolean isPasswordManagementEnabled = false;
	protected static PasswordValidator validator = new PasswordValidator();
	protected static Integer maxPasswordAgeDays;

	protected static Boolean differFromPrevious;
	protected static Boolean differFromUserName;
	
	protected Integer passwordMinLenght;
	protected Integer forewarningDays;
	
	protected Boolean requireDigit;
	protected Boolean requireUppercase;
	protected Boolean requireLowerCase;
	
	private static final int MAX_PASSWORD_LENGTH = 65000;
	
	private static Logger logger = LoggerFactory.getLogger(PasswordManagementService.class);
	

	/**
	 * Set up of operative policy rules according to injected configuration.
	 * Should be called as soon as possible, better if before Bean instantiation
	 */
	public void init() {
		
		logger.info("PasswordManagerService init invoked. Building passay validator according to policy...");
		List<Rule> rules = new ArrayList<>();
		
		if (passwordMinLenght != null && passwordMinLenght > 0) 
			rules.add(new LengthRule(passwordMinLenght, MAX_PASSWORD_LENGTH));
		if (Boolean.TRUE.equals(requireDigit))
			rules.add(new CharacterRule(EnglishCharacterData.Digit));
		if (Boolean.TRUE.equals(requireLowerCase))
			rules.add(new CharacterRule(EnglishCharacterData.LowerCase));
		if (Boolean.TRUE.equals(requireUppercase))
			rules.add(new CharacterRule(EnglishCharacterData.UpperCase));

		validator = new PasswordValidator(rules);
		
	}
	
	
	
	/**
	 * @return true if password management is enabled
	 */
	public static boolean isPasswordManagementEnabled() {
		return isPasswordManagementEnabled;
	}
	
	/**
	 * @return expiration date of a changed password according to current policy
	 * if max password age in days is null or <= 0 then no expiration date is computed (null returned)
	 */
	public static LocalDateTime getPasswordExpiration() {
		if (maxPasswordAgeDays == null || (!isPasswordManagementEnabled) || maxPasswordAgeDays <= 0)
			return null;
		return (LocalDateTime.now().plusDays(maxPasswordAgeDays).withHour(23).withMinute(59).withSecond(59)); 
	}


	/**
	 * @param newPassword
	 * @param username username or null if you don't want validation against differ-from-username rule
	 * @param newPasswordOrHash new password or hashed new password if hashing is used to save passwords
	 * @param previousPasswordOrHash  previous password or hashed previous password if hashing is used
	 * @return true if password is valid, false otherwise
	 */
	public static boolean isValidPassword(String newPassword, String username, String newPasswordOrHash, String previousPasswordOrHash) {
		
		if (!isPasswordManagementEnabled)
			return true;
		if (Boolean.TRUE.equals(differFromUserName)) {
			if (username == null || newPassword == null)
				return false;
			if (newPassword.toLowerCase().contains(username.toLowerCase()))
				return false;
		}
		if (Boolean.TRUE.equals(differFromPrevious)) {
			if (previousPasswordOrHash == null || newPasswordOrHash == null || previousPasswordOrHash.equals(newPasswordOrHash))
				return false;
		}

		PasswordData passwordData = new PasswordData(newPassword);
		RuleResult validationResult = validator.validate(passwordData);
		return validationResult.isValid();
		
	}
	
	/**
	 * @param password
	 * @return true if password is valid, false otherwise
	 */
	public static boolean isValidPassword(String password) {
		
		if (!isPasswordManagementEnabled)
			return true;
		PasswordData passwordData = new PasswordData(password);
		RuleResult validationResult = validator.validate(passwordData);
		return validationResult.isValid();
	}
	
//	@Scheduled(initialDelay = 100000 , fixedDelay = 60000L * 60 * 8)
	//FIXME schedule period after debug
//	@Scheduled(initialDelay = 15000 , fixedDelay = 60000L * 60 * 8 )
//	public void sendMail4PasswordsAboutToExpire() {
//		logger.info("sendMail4PasswordsAboutToExpire invoked");
//	}
	
	@PostConstruct
	public void logConfiguration() {
		
		StringBuilder msg = new StringBuilder("PasswordManagementService Configuration: ");
		msg.append("Password Management Enabled: ").append(isPasswordManagementEnabled);
		msg.append(" Max Password Age (days): ").append(maxPasswordAgeDays);
		msg.append(" Password Min Length: ").append(passwordMinLenght);
		msg.append(" Forewarning (days): ").append(forewarningDays);
		msg.append(" Differ from previous: ").append(differFromPrevious);
		msg.append(" Differ from username: ").append(differFromUserName);
		msg.append(" Require Digit: ").append(requireDigit);
		msg.append(" Require Uppercase: ").append(requireUppercase);
		msg.append(" Require Lowercase: ").append(requireLowerCase);
		logger.info(msg.toString());
	}

	//SETTERS
	
	public void setPaswordValidationEnabled(boolean enabled) {
		isPasswordManagementEnabled = enabled;
	}
	
	public void setPasswordMinLength(Integer passwordMinLenght) {
		this.passwordMinLenght = passwordMinLenght;
	}


	public static void setPasswordValidationEnabled(boolean isPasswordValidationEnabled) {
		PasswordManagementService.isPasswordManagementEnabled = isPasswordValidationEnabled;
	}


	public void setPasswordMinLenght(Integer passwordMinLenght) {
		this.passwordMinLenght = passwordMinLenght;
	}


	public void setMaxPasswordAgeDays(Integer maxPasswordAgeDays) {
		this.maxPasswordAgeDays = maxPasswordAgeDays;
	}


	public void setForewarningDays(Integer forewarningDays) {
		this.forewarningDays = forewarningDays;
	}


	public void setDifferFromPrevious(Boolean differFromPrevious) {
		this.differFromPrevious = differFromPrevious;
	}


	public void setDifferFromUserName(Boolean differFromUserName) {
		this.differFromUserName = differFromUserName;
	}


	public void setRequireDigit(Boolean requireDigit) {
		this.requireDigit = requireDigit;
	}


	public void setRequireUppercase(Boolean requireUppercase) {
		this.requireUppercase = requireUppercase;
	}


	public void setRequireLowerCase(Boolean requireLowerCase) {
		this.requireLowerCase = requireLowerCase;
	}
	
	
}

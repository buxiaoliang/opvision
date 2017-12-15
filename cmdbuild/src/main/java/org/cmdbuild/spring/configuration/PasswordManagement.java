package org.cmdbuild.spring.configuration;

import org.cmdbuild.auth.PasswordManagementService;
import org.cmdbuild.config.PasswordProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PasswordManagement {
	
	@Autowired Properties properties;
	
	@Bean
	protected PasswordManagementService passwordManagementService() {
		
		PasswordManagementService pm = new PasswordManagementService();
		PasswordProperties pp = properties.passwordProperties();
		
		if (Boolean.TRUE.equals(Boolean.valueOf(pp.getAsString(PasswordProperties.MANAGE))))
			pm.setPaswordValidationEnabled(true); //defaults to false
		
		pm.setPasswordMinLength(Integer.valueOf(pp.getAsString(PasswordProperties.MIN_LENGTH)));
		pm.setMaxPasswordAgeDays(Integer.valueOf(pp.getAsString(PasswordProperties.PASSWORD_MAX_AGE_DAYS)));
		pm.setForewarningDays(Integer.valueOf(pp.getAsString(PasswordProperties.FOREWARNING_DAYS)));
		
		pm.setDifferFromUserName(Boolean.valueOf(pp.getAsString(PasswordProperties.DIFFER_FROM_USERNAME)));
		pm.setDifferFromPrevious(Boolean.valueOf(pp.getAsString(PasswordProperties.DIFFER_FROM_PREVIOUS)));
		pm.setRequireDigit(Boolean.valueOf(pp.getAsString(PasswordProperties.REQUIRE_DIGIT)));
		pm.setRequireLowerCase(Boolean.valueOf(pp.getAsString(PasswordProperties.REQUIRE_LOWERCASE)));
		pm.setRequireUppercase(Boolean.valueOf(pp.getAsString(PasswordProperties.REQUIRE_UPPERCASE)));
		
		//PasswordManagement::init is called before Component is initialized, so the bean can start with full init
		//This is not a strict requirement
		pm.init();
		return pm;
	}
	
	

}

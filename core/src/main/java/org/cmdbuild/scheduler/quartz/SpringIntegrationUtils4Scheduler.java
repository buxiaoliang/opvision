package org.cmdbuild.scheduler.quartz;



import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.stereotype.Component;

//@Configuration
@Component
@ComponentScan("org.cmdbuild.scheduler.quartz")
public class SpringIntegrationUtils4Scheduler implements ApplicationContextAware {

	private static ApplicationContext applicationContext;

	public static ApplicationContext applicationContext() {
		return applicationContext;
	}

	@Override
	public void setApplicationContext(final ApplicationContext applicationContext) throws BeansException {
		SpringIntegrationUtils4Scheduler.applicationContext = applicationContext;
	}

}
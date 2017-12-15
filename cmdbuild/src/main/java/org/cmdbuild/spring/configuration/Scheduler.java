package org.cmdbuild.spring.configuration;

import org.cmdbuild.logger.Log;
import org.cmdbuild.logic.scheduler.DefaultSchedulerLogic;
import org.cmdbuild.logic.scheduler.SchedulerLogic;
import org.cmdbuild.scheduler.SchedulerExeptionFactory;
import org.cmdbuild.scheduler.SchedulerService;
import org.cmdbuild.scheduler.quartz.QuartzSchedulerService;
import org.cmdbuild.services.scheduler.DefaultSchedulerExeptionFactory;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@Configuration
public class Scheduler {
	
	Logger logger = Log.CMDBUILD;

	@Autowired
	Properties properties;

	@Bean
	public SchedulerLogic defaultSchedulerLogic() {
		return new DefaultSchedulerLogic(defaultSchedulerService());
	}

	@Bean
	public SchedulerService defaultSchedulerService() {

		if (properties.cmdbuildProperties().isClustered()) {
			return new QuartzSchedulerService(schedulerExeptionFactory(), true,
					properties.schedulerProperties().getClusteredProperties());
		} else {
			return new QuartzSchedulerService(schedulerExeptionFactory(), false,
					properties.schedulerProperties().getStandaloneProperties());
		}
	}

	@Bean
	protected SchedulerExeptionFactory schedulerExeptionFactory() {
		return new DefaultSchedulerExeptionFactory();
	}

	@Bean
	public TaskScheduler taskScheduler() {

		ThreadPoolTaskScheduler taskScheduler = new ThreadPoolTaskScheduler();
		try {
			taskScheduler.setPoolSize(properties.schedulerProperties().getSpringManagedTaskSchedulerPoolSize());
			taskScheduler.initialize();
			taskScheduler.getScheduledThreadPoolExecutor().setCorePoolSize(properties.schedulerProperties().getSpringManagedTaskSchedulerCorePoolSize());
			taskScheduler.getScheduledThreadPoolExecutor().setMaximumPoolSize(properties.schedulerProperties().getSpringManagedTaskSchedulerMaximumPoolSize());
			taskScheduler.setThreadNamePrefix("SpringTaskScheduler[CMDBuild-configured]"); 
			logger.warn("SpringTaskScheduler[CMDBuild-configured] successfully configured.");
		} catch (IllegalStateException e) {
			logger.error("COULD NOT PROPERLY CONFIGURE ThreadPoolTaskScheduler");
			logger.error(e.toString());
		}

		return taskScheduler;
	}

}

package org.cmdbuild.scheduler.quartz;

import java.util.Properties;

import org.cmdbuild.logic.email.EmailQueueLogic;
import org.cmdbuild.scheduler.Job;
import org.cmdbuild.scheduler.SchedulerExeptionFactory;
import org.cmdbuild.scheduler.SchedulerService;
import org.cmdbuild.scheduler.Trigger;
import org.quartz.JobDetail;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.impl.StdSchedulerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

@ComponentScan
@Component
public class QuartzSchedulerService implements SchedulerService {
	
	//@Autowired EmailQueueLogic emailQueueLogic;

	private /*final*/ SchedulerExeptionFactory exeptionFactory;

	private Scheduler scheduler;
	
	private static final String QUARTZ_JOBSTORE_PROPERTY = "org.quartz.jobStore.class";
	private static final String QUARTZ_JOBSTORE_IMP_CLUSTERED = "org.quartz.impl.jdbcjobstore.JobStoreTX";
	private static final String QUARTZ_JOBSTORE_IMP_STANDALONE = "org.quartz.simpl.RAMJobStore";
	private static final String QUARTZ_CLUSTERED_JOBSTORETX_DATASOURCE_NAME = "CMDBuildDatasource";
	//TODO check
	
	private SchedulerExeptionFactory schedulerExceptionFactory;
	private boolean isClustered;
	private Properties quartzProperties;
	private boolean initialized = false;
	
	public QuartzSchedulerService() {
		
	}

	@Deprecated //TODO 
	public QuartzSchedulerService(final SchedulerExeptionFactory exeptionFactory) {
		this.exeptionFactory = exeptionFactory;
		try {
			scheduler = StdSchedulerFactory.getDefaultScheduler();
		} catch (final SchedulerException e) {
			throw exeptionFactory.internal(e);
		}
	}
	
	public  QuartzSchedulerService(final SchedulerExeptionFactory exceptionFactory /* , final CmdbuildConfiguration cmdBuildConfiguration*/, boolean isClustering, Properties quartzProperties) {
		
		this.exeptionFactory = exceptionFactory;
		this.quartzProperties = quartzProperties;
		this.isClustered = isClustering;
		init();
//		if (cmdBuildConfiguration.isClustered()) { //use Quartz JDBC-Jobstore 
		
	}
	

	
	private void init() {
		
		QuartzJob.setClustered(isClustered);
		
		
		if (isClustered) { //use Quartz JDBC-Jobstore 
			try {
				StdSchedulerFactory sf = new StdSchedulerFactory();
				
				//TODO externalize (unify) constants
				quartzProperties.setProperty(QUARTZ_JOBSTORE_PROPERTY, QUARTZ_JOBSTORE_IMP_CLUSTERED);
				quartzProperties.setProperty("org.quartz.jobStore.isClustered", "true");
				
				//try to use a custom connection provider
				quartzProperties.setProperty("org.quartz.jobStore.dataSource", QUARTZ_CLUSTERED_JOBSTORETX_DATASOURCE_NAME);
				quartzProperties.setProperty("org.quartz.dataSource."+ QUARTZ_CLUSTERED_JOBSTORETX_DATASOURCE_NAME +".connectionProvider.class" , "org.cmdbuild.scheduler.quartz.CMDBuildQuartzConnectionProvider");
				//
				sf.initialize(quartzProperties);
				scheduler = sf.getScheduler();
				
			//	QuartzJob.setEmailQueueLogic(emailQueueLogic);
				
				initialized = true;
			} catch (final SchedulerException e) {
				throw exeptionFactory.internal(e);
			}
		} else { //use default (RAMJobStore) implementation
			try {
				
				StdSchedulerFactory sf = new StdSchedulerFactory();
				quartzProperties.setProperty(QUARTZ_JOBSTORE_PROPERTY, QUARTZ_JOBSTORE_IMP_STANDALONE);
				
				sf.initialize(quartzProperties); 
				scheduler = sf.getScheduler();
				initialized = true;
			} catch (final SchedulerException e) {
				throw exeptionFactory.internal(e);
			}
		}
		
	}

	@Override
	public void add(final Job job, final Trigger trigger) {
		final org.quartz.Trigger quartzTrigger = new QuartzTriggerFactory(exeptionFactory).create(trigger);
		final JobDetail jobDetail = QuartzJob.createJobDetail(job);
		try {
			scheduler.deleteJob(QuartzJob.createJobKey(job));
			scheduler.scheduleJob(jobDetail, quartzTrigger);
		} catch (final SchedulerException e) {
			throw exeptionFactory.internal(e);
		}
	}

	@Override
	public void remove(final Job job) {
		try {
			final JobKey jobKey = QuartzJob.createJobKey(job);
			scheduler.deleteJob(jobKey);
		} catch (final SchedulerException e) {
			throw exeptionFactory.internal(e);
		}
	}

	@Override
	public boolean isStarted(final Job job) {
		//init();
		try {
			final JobKey jobKey = QuartzJob.createJobKey(job);
			return scheduler.checkExists(jobKey);
		} catch (final SchedulerException e) {
			throw exeptionFactory.internal(e);
		}
	}

	@Override
	public void start() {
		//init();
		try {
			scheduler.start();
		} catch (final SchedulerException e) {
			throw exeptionFactory.internal(e);
		}
	}

	@Override
	public void stop() {
		try {
			if (!scheduler.isShutdown()) {
				scheduler.shutdown(true);
			}
		} catch (final SchedulerException e) {
			throw exeptionFactory.internal(e);
		}
	}

}

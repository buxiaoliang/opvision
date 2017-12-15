package org.cmdbuild.logic.email;

import static org.cmdbuild.scheduler.CMDBuildSerializableJob.EmailQueueConventionalTaskId;
import static org.cmdbuild.scheduler.CMDBuildSerializableJob.EmailQueueParameterLastExecution;
import static org.cmdbuild.scheduler.CMDBuildSerializableJob.EmailQueueParameterRunning;

import static org.cmdbuild.scheduler.Triggers.everyMinute;
import static org.cmdbuild.scheduler.command.Commands.safe;
import static org.joda.time.DateTime.now;


import java.util.concurrent.atomic.AtomicBoolean;

import org.apache.commons.lang3.Validate;
import org.cmdbuild.config.EmailConfiguration;
import org.cmdbuild.scheduler.Job;
import org.cmdbuild.scheduler.SchedulerService;
import org.cmdbuild.scheduler.command.BuildableCommandBasedJob;
import org.cmdbuild.scheduler.command.Command;
import org.joda.time.DateTime;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;


public class DefaultClusteringEmailQueueLogic implements EmailQueueLogic , Command, org.quartz.Job {

	private final Command delegate;
	private final EmailConfiguration configuration;
	private final SchedulerService schedulerService;
	
	private final AtomicBoolean running = new AtomicBoolean(false);
	private DateTime lastExecution;
	private final Job job;

	public  DefaultClusteringEmailQueueLogic (final EmailConfiguration configuration, final SchedulerService schedulerService,
			final Command command) {
		
		this.configuration = configuration;
		this.schedulerService = schedulerService;
		this.delegate = command;
		
		this.job = BuildableCommandBasedJob.newInstance() //
				.withName(DefaultClusteringEmailQueueLogic.class.getName()) // TODO clustering: check what happens if switched from / to clustering mode
				.withCommand(this) //
				.withTaskId(EmailQueueConventionalTaskId)
				.build();
	}

	@Override
	public boolean running() {
		return schedulerService.isStarted(job);
	}

	@Override
	public void start() {
		configuration.setEnabled(true);
		configuration.save();
		schedulerService.add(job, everyMinute());
	}

	@Override
	public void stop() {
		if (running()) {
			schedulerService.remove(job);
			configuration.setEnabled(false);
			configuration.save();
		}
	}

	@Override
	public Configuration configuration() {
		return new Configuration() {

			@Override
			public long time() {
				return configuration.getQueueTime();
			}

		};
	}

	@Override
	public void configure(final Configuration configuration) {
		validate(configuration);
		this.configuration.setQueueTime(configuration.time());
		this.configuration.save();
	}

	private void validate(final Configuration configuration) {
		Validate.notNull(configuration, "missing configuration");
		Validate.isTrue(configuration.time() >= 0, "invalid time");
	}
		

	@Override
	public void execute(JobExecutionContext context) throws JobExecutionException {
		//TODO fill lastExecution from context
		//TODO eventually fill running NO!!!!
		JobDetail jobDetail = context.getJobDetail();
		JobDataMap jobDataMap = jobDetail.getJobDataMap();
		//running.set(jobDataMap.getBoolean(EmailQueueParameterRunning));
		Long millis = (Long) jobDataMap.get(EmailQueueParameterLastExecution);
		if (millis == null)
			lastExecution = null;
		else
			lastExecution = new DateTime(millis.longValue());
		
		execute();
		
		jobDataMap.put(EmailQueueParameterLastExecution, now().getMillis());
	
	}

	@Override
	public void execute() {
		
		//from nonclustered DefaultEmailQueueLogic
		if (!running.getAndSet(true)) {
			if ((lastExecution == null) || now().isAfter(lastExecution.plus(configuration.getQueueTime()))) {
				lastExecution = now();
				safe(delegate).execute();
			} else {
				logger.debug("time not elapsed");
			}
			running.set(false);
		} else {
			logger.debug("queue already running");
		}
		
	}
		
}
package org.cmdbuild.scheduler.quartz;

import static org.cmdbuild.scheduler.CMDBuildSerializableJob.EmailQueueConventionalTaskId;
import static org.cmdbuild.scheduler.CMDBuildSerializableJob.EmailQueueParameterLastExecution;
import static org.cmdbuild.scheduler.CMDBuildSerializableJob.EmailQueueParameterRunning;

import org.cmdbuild.scheduler.Job;
import org.cmdbuild.scheduler.JobWithTask;
import org.cmdbuild.scheduler.logging.LoggingSupport;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobBuilder;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.JobKey;
import org.quartz.PersistJobDataAfterExecution;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import static org.cmdbuild.scheduler.CMDBuildSerializableJob.*;

import javax.sql.DataSource;

import org.cmdbuild.logger.Log;
import org.cmdbuild.logic.email.DefaultClusteringEmailQueueLogic;
import org.cmdbuild.logic.email.EmailQueueLogic;
import org.cmdbuild.logic.scheduler.SchedulerLogic;
import org.cmdbuild.logic.taskmanager.TaskManagerLogic;

@PersistJobDataAfterExecution
@DisallowConcurrentExecution //TODO check if to be moved
public class QuartzJob implements org.quartz.Job {

	private static final String JOB = "job";
	private static final String TASK_ID = "taskID";
	
	private static final Logger logger = Log.SCHEDULER;
	
	//injected once
	private static boolean isClusteredIstance;
	private static TaskManagerLogic taskManagerLogic;
	private static SchedulerLogic schedulerLogic;
	private static EmailQueueLogic emailQueueLogic;
	

	public QuartzJob() {
		logger.debug("rebuilding a QuartzJob...");
	}
	
	@Override
	public void execute(final JobExecutionContext context) throws JobExecutionException {
		
		logger.debug("Executing a QuartzJob...");
		final JobDataMap jobDataMap = context.getJobDetail().getJobDataMap();
		Long taskId = null;
		if (jobDataMap.containsKey(TASK_ID))
			taskId = jobDataMap.getLong(TASK_ID); 
		
		if (!initialized()) 
			initialize();
		
		if (isClusteredIstance) {
			Job rebuiltJob = null;
			
			//TODO REBUILD job from db
			if (taskId != null) {
				String msg = "CLUSTERED SCHEDULER ABOUT TO EXECUTE Task #" + taskId;
				logger.debug(msg);
				//check for standard tasks that are not serialized on the persistence layer.. (see CMDBuildSerializableJob conventions)
				if (EmailQueueConventionalTaskId.equals(taskId)) {
					((DefaultClusteringEmailQueueLogic)emailQueueLogic).execute(context);
				} else {
					//Rebuild job from task id
					taskManagerLogic.execute(taskId);
					//rebuiltJob = buildJobFromTaskId(taskId);
					//rebuiltJob.execute();
				}
			} else {
				logger.error("NULL TaskId from jobMap"); 
				//TODO throw exception when stable
				//throw new JobExecutionException("NULL TaskId from jobMap", false);
			}
			
			
//			rebuiltJob.execute();
			
		} else {
			Job jobScheduler = Job.class.cast(jobDataMap.get(JOB));
			jobScheduler.execute();
		}
	}


	private void initialize() {
		
		schedulerLogic = SpringIntegrationUtils4Scheduler.applicationContext().getBean(SchedulerLogic.class);
		taskManagerLogic = SpringIntegrationUtils4Scheduler.applicationContext().getBean(TaskManagerLogic.class);
		if (!initialized())
			logger.error("Could not initialize QuartzJob");
	}


	private boolean initialized() {
		if (schedulerLogic == null || taskManagerLogic == null)
			return false;
		return true;
	}


	public static JobDetail createJobDetail(final Job schedulerJob) {
		
		logger.debug("Creating JobDetails for {}" , schedulerJob.getName());
		
		final JobDataMap jobDataMap = new JobDataMap();
		
		if (isClusteredIstance) {
			jobDataMap.put(TASK_ID, ((JobWithTask)schedulerJob).getTaskId() );
			//TODO manage EmailQueue, but delegating to the tasks extra parameter serialization should be evaluated if the case is common
			if (EmailQueueConventionalTaskId.equals( ((JobWithTask)schedulerJob).getTaskId())) {
				jobDataMap.put(EmailQueueParameterLastExecution, null);
//				jobDataMap.put(EmailQueueParameterRunning, ((DefaultClusteringEmailQueueLogic)emailQueueLogic).running()); //TODO
//				jobDataMap.put(EmailQueueParameterRunning, true);
			}
		} else {
			jobDataMap.put(JOB, schedulerJob);
		}
		
		return JobBuilder.newJob(QuartzJob.class) //
				.ofType(QuartzJob.class) //added Dino
				.withIdentity(schedulerJob.getName()) //
				.setJobData(jobDataMap) //
				.build();
	}

	public static JobKey createJobKey(final Job job) {
		return JobKey.jobKey(job.getName());
	}
	
	/**
	 * @param isClusteredIstance set once
	 */
	public static void setClustered(boolean isClusteredIstance) {
		QuartzJob.isClusteredIstance = isClusteredIstance;
	}
	
	public static void setEmailQueueLogic(EmailQueueLogic emailQueueLogic) {
		QuartzJob.emailQueueLogic = emailQueueLogic;
		
	}

//	public static void setTaskManagerLogic(TaskManagerLogic taskManagerLogic) {
//		QuartzJob.taskManagerLogic = taskManagerLogic;
//	}
//
//
//	public static void setSchedulerLogic(SchedulerLogic schedulerLogic) {
//		QuartzJob.schedulerLogic = schedulerLogic;
//	}

	//FIXME remove?
	private Job buildJobFromTaskId(Long taskId) {
		
		logger.warn("build job from task id not yet implemented");
		//taskManagerLogic.execute(taskId);
		// altrimenti provare con TaskStore (che pero' e' protected nella configurazioen)
		return null;
	}


}

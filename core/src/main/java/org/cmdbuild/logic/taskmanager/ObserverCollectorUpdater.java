package org.cmdbuild.logic.taskmanager;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.apache.commons.lang3.Validate;
import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.data.store.task.Task;
import org.cmdbuild.data.store.task.TaskStore;
import org.cmdbuild.logic.taskmanager.event.SynchronousEventFacade;
import org.cmdbuild.logic.taskmanager.store.LogicAndStoreConverter;
import org.cmdbuild.logic.taskmanager.task.event.synchronous.SynchronousEventTask;
import org.cmdbuild.services.event.DefaultObserverCollector;
import org.cmdbuild.services.event.ObserverCollector.IdentifiableObserver;
import org.cmdbuild.spring.SpringIntegrationUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Component;

/**
 * Used in clustered environment in order to react to distributed edits of synchronous event tasks<br>
 * Polls Task system table for Synchronous tasks changes (activation, deactivation, parameter update)<br>
 * Does nothing if not in clustered environment
 *
 */
@Component
@EnableScheduling 
public class ObserverCollectorUpdater {
	
	@Autowired TaskScheduler taskScheduler;
	
	
	 public ObserverCollectorUpdater(ObserverCollectorUpdaterConfiguration configuration) {
		
		this.isClustered = configuration.isClustered;
		this.observerCollector = configuration.observerCollector;
		this.taskStore = configuration.taskStore;
		this.converter = configuration.converter;
		this.synchronousEventFacade = configuration.synchronousEventFacade;
		this.initialDelaySeconds = configuration.initialDelaySeconds;
		if (configuration.pollingIntervalMillis >= 500)  {
			this.pollingIntervalMillis = configuration.pollingIntervalMillis; 
		} else {
			this.pollingIntervalMillis = 500; //min value (autoprotection)
		}
	}
	
	@Deprecated //in favour of one parameter constructor
	public ObserverCollectorUpdater(boolean clustered, DefaultObserverCollector defaultObserverCollector, 
			TaskStore taskStore, LogicAndStoreConverter converter /*,Store<TaskRuntime> store*/, 
			SynchronousEventFacade synchronousEventFacade) {
		this.isClustered = clustered;
		this.observerCollector = defaultObserverCollector;
		this.taskStore = taskStore;
		this.converter = converter;
		this.synchronousEventFacade = synchronousEventFacade;
		//this.taskRuntimeStore = taskRuntimeStore;
		
	}
	
	public static class ObserverCollectorUpdaterConfiguration {
		
		/**
		 * set to true when in clustered environment
		 * if set to false observer does nothing
		 */
		private boolean isClustered = false;
		private DefaultObserverCollector observerCollector;
		private TaskStore taskStore;
		private LogicAndStoreConverter converter;
		private SynchronousEventFacade synchronousEventFacade;
		/**
		 * Interval (milliseconds) between two consecutive checks for synchronous event state updates <br/>
		 * Default is 4000. 
		 */
		private long pollingIntervalMillis = 4000;
		/**
		 * Don't check for for synchronous event state updates for the starting initialDelaySeconds.
		 * When application starts tasks are updated, but these updates should not trigger Obseserver reactions (forwarded across the cluster...)
		 */
		private long initialDelaySeconds = 60;
		
		
		public ObserverCollectorUpdaterConfiguration(boolean isClustered, DefaultObserverCollector observerCollector,
				TaskStore taskStore, LogicAndStoreConverter converter, SynchronousEventFacade synchronousEventFacade,
				long pollingIntervalMillis, long initialDelaySeconds) {
			super();
			this.isClustered = isClustered;
			this.observerCollector = observerCollector;
			this.taskStore = taskStore;
			this.converter = converter;
			this.synchronousEventFacade = synchronousEventFacade;
			this.pollingIntervalMillis = pollingIntervalMillis;
			this.initialDelaySeconds = initialDelaySeconds;
		}
		
		
		
	}

	protected boolean isClustered;
	protected boolean isEnabled;
	protected DefaultObserverCollector observerCollector;
	protected TaskStore taskStore;
	protected LogicAndStoreConverter converter;
	private SynchronousEventFacade synchronousEventFacade;
//	private DefaultTaskManagerLogic taskManagerLogic;
//	protected Store<TaskRuntime> taskRuntimeStore;
	protected long initialDelaySeconds = 60;
	protected long pollingIntervalMillis = 4000;
	
	private DataSource dataSource;
	private JdbcTemplate template;
	
	protected LocalDateTime lastDetectedChange;
	
	private Logger logger = LoggerFactory.getLogger(ObserverCollectorUpdater.class); //maybe you want to assign a CMDBuild log...
	
	
	
	public void enable() {
	
		//FIXME: make enable to be called after application is fully initialized
		// Issue: when application starts tasks are updated, but these updates should not trigger Obseserver reactions (forwarded accross the cluster...)
		lastDetectedChange = LocalDateTime.now().plusSeconds(initialDelaySeconds);
		schedulePoll();
		isEnabled = true;
	}
	
	

	@Deprecated
	protected static class TrivialIdentifiableObserver implements IdentifiableObserver   {

		private Long taskId;
		
		public TrivialIdentifiableObserver(Long taskId) {
			this.taskId = taskId;
		}

		@Override
		public String getIdentifier() {
			return taskId.toString();
		}
		
		@Override
		public void afterCreate(CMCard current) {}

		@Override
		public void beforeUpdate(CMCard current, CMCard next) {}

		@Override
		public void afterUpdate(CMCard previous, CMCard current) {}

		@Override
		public void beforeDelete(CMCard current) {}

	}

//	@Scheduled(initialDelay = 60000 , fixedDelay = 4000)
	public void pollAsynchronousEventTasksForStateChange() {
		
		if (isClustered && isEnabled) {
			 //logger.debug("ObserverCollectionUpdater is polling for changes... @ {} lastDetectedChange is: {}" , LocalDateTime.now().toString() , lastDetectedChange );
			 List<Map<String, Object>> changedTasks = getTemplate().queryForList(sqlChangedTasks, TYPE_SYNCHRONOUS_EVENT, Timestamp.valueOf(lastDetectedChange));
			 //logger.trace("changedTasks size: {} changedTasks: {}" , changedTasks.size(), changedTasks.toString());
			 for ( Map<String, Object> t : changedTasks) {
				 logger.debug("ObserverCollectorUpdater found an edited Sinchronous Task {} and is about to refresh it..." , t);
				 Long taskId =  ((Integer) t.get("Id")).longValue();
				 //detach
				 IdentifiableObserver identifiableObserver = new TrivialIdentifiableObserver(taskId);
				 observerCollector.remove(identifiableObserver);
				 //restore
				 Task raw = taskStore.read(taskId);
				 Validate.notNull(raw, "ObserverCollectorUpdater cannot restore task with id = " + taskId);
				 org.cmdbuild.logic.taskmanager.Task task = converter.from(raw).toLogic();
				 if (task.isActive()) {
					 synchronousEventFacade.create( (SynchronousEventTask)task);
					 //do not use taskManagerLogic.activate because it updates db generating another changes...
					 
//						try {
//							taskManagerLogic.logger.debug("starting task '{}'", task.getId());
//							taskManagerLogic.activate(task.getId());
//						} catch (final Exception e) {
//							taskManagerLogic.logger.error("task '{}' cannot be started due to an error", task.getId());
//							taskManagerLogic.logger.error("error starting task", e);
//						}
					}
				 lastDetectedChange = LocalDateTime.now();
			 }
		}
		
	}
	
	//TODO externalize query into configuration
	protected String sqlChangedTasks = "select * from \"_Task\" where \"Status\" = 'A' and \"Type\" = ? and \"BeginDate\" > ?";
	//TODO externalize?
	protected static final String TYPE_SYNCHRONOUS_EVENT = "synchronous_event"; 
	
	protected JdbcTemplate getTemplate() {
		if (template == null) {
			template = new JdbcTemplate(getDataSource());
		}
		return template;
	}
	
	protected DataSource getDataSource() {
		if (dataSource == null) {
			dataSource = SpringIntegrationUtils.applicationContext().getBean(DataSource.class);
		}
		return dataSource;
	}
	
	private void schedulePoll() {
		
		Runnable poller = new Runnable() {
			
			@Override
			public void run() {
				pollAsynchronousEventTasksForStateChange();
			}
		};
		
		taskScheduler.scheduleWithFixedDelay(poller, pollingIntervalMillis);
		logger.warn("Scheduled synchronous tasks check every {} ms , with initial delay of {} s" , pollingIntervalMillis, initialDelaySeconds);
		
	}
	
	
	

}

package org.cmdbuild.config;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;

import org.cmdbuild.services.Settings;
import org.springframework.context.annotation.Configuration;


public final class SchedulerProperties extends DefaultProperties {
	
	private static final long serialVersionUID = 1L;

	private static final String MODULE_NAME = "scheduler";

	//TODO collect property definitions here
	//QUARTZ related
	private static final String QUARTZ_JOBSTORE_USEPROPERTIES = "org.quartz.jobStore.useProperties";
	
	private static final String CATEGORY_STANDALONE = "Standalone";
	private static final String CATEGORY_CLUSTERED = "Clustered";
	//ObserverCollectorUpdater related
	private static final String OBSERVERCOLLECTORUPDATER_INITIAL_DELAY = "org.cmdbuild.logic.taskmanager.observer-collector-updater.initial-delay-seconds";
	private static final String OBSERVERCOLLECTORUPDATER_FIXEDDELAY = "org.cmdbuild.logic.taskmanager.observer-collector-updater.fixed-delay-millis";

	private static final Long DEFAULT_OBSERVERCOLLECTORUPDATER_FIXEDDELAY = 4000L;
	private static final Long DEFAULT_OBSERVERCOLLECTORUPDATER_INITIALDELAY = 60L;
	
	//SPRING MANAGED TaskScheduler 
	private static final String  SPRING_MANAGED_TASKSCHEDULER_POOLSIZE = "org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler.poolSize";
	private static final String  SPRING_MANAGED_TASKSCHEDULER_COREPOOLSIZE = "org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler.corePoolSize";
	private static final String  SPRING_MANAGED_TASKSCHEDULER_MAXIMUMPOOLSIZE = "org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler.maximumPoolSize";
	private static final Integer DEFAULT_SPRING_MANAGED_TASKSCHEDULER_POOLSIZE = 2;
	private static final Integer DEFAULT_SPRING_MANAGED_TASKSCHEDULER_COREPOOLSIZE = 3;
	private static final Integer DEFAULT_SPRING_MANAGED_TASKSCHEDULER_MAXIMUMPOOLSIZE = 12;
	
	HashMap<String, Set<String>> categoryMap = new HashMap<>();

	
	public SchedulerProperties(PropertyContainer propertyContainer) {
		super(propertyContainer);
		
		//Common Configuration
		setProperty("org.quartz.threadPool.class", "org.quartz.simpl.SimpleThreadPool");
		setProperty("org.quartz.threadPool.threadCount", "5");
		setProperty("org.quartz.threadPool.threadPriority", "4");
		setProperty("org.quartz.scheduler.skipUpdateCheck", "true");
		
		setProperty("org.quartz.scheduler.instanceId", "AUTO"); //changed from previous default "one" to better fit clustering TODO check
		setProperty("org.quartz.scheduler.instanceName", "CMDBuildScheduler");
		setProperty(OBSERVERCOLLECTORUPDATER_FIXEDDELAY, DEFAULT_OBSERVERCOLLECTORUPDATER_FIXEDDELAY.toString());
		setProperty(OBSERVERCOLLECTORUPDATER_INITIAL_DELAY, DEFAULT_OBSERVERCOLLECTORUPDATER_INITIALDELAY.toString());

		setProperty(SPRING_MANAGED_TASKSCHEDULER_POOLSIZE, DEFAULT_SPRING_MANAGED_TASKSCHEDULER_POOLSIZE.toString());
		setProperty(SPRING_MANAGED_TASKSCHEDULER_COREPOOLSIZE, DEFAULT_SPRING_MANAGED_TASKSCHEDULER_COREPOOLSIZE.toString());
		setProperty(SPRING_MANAGED_TASKSCHEDULER_MAXIMUMPOOLSIZE, DEFAULT_SPRING_MANAGED_TASKSCHEDULER_MAXIMUMPOOLSIZE.toString());
		
		setProperty(QUARTZ_JOBSTORE_USEPROPERTIES, "false"); // workaround
		setProperty("org.quartz.jobStore.driverDelegateClass", "org.quartz.impl.jdbcjobstore.PostgreSQLDelegate" );
		setProperty("org.quartz.jobStore.tablePrefix", "quartz.qrtz_" );
		
		setProperty("org.quartz.jobStore.isClustered", "true");
		
		//CATEGORY SETS:
		
		//Common properties
		setPropertyCategory("org.quartz.threadPool.class", CATEGORY_STANDALONE);setPropertyCategory("org.quartz.threadPool.class", CATEGORY_CLUSTERED);
		setPropertyCategory("org.quartz.threadPool.threadCount", CATEGORY_STANDALONE);setPropertyCategory("org.quartz.threadPool.threadCount", CATEGORY_CLUSTERED);
		setPropertyCategory("org.quartz.threadPool.threadPriority", CATEGORY_STANDALONE);setPropertyCategory("org.quartz.threadPool.threadPriority", CATEGORY_CLUSTERED);
		setPropertyCategory("org.quartz.scheduler.skipUpdateCheck", CATEGORY_STANDALONE);setPropertyCategory("org.quartz.scheduler.skipUpdateCheck", CATEGORY_CLUSTERED);
		setPropertyCategory("org.quartz.scheduler.instanceId", CATEGORY_STANDALONE);setPropertyCategory("org.quartz.scheduler.instanceId", CATEGORY_CLUSTERED);
		setPropertyCategory("org.quartz.scheduler.instanceName", CATEGORY_STANDALONE);setPropertyCategory("org.quartz.scheduler.instanceName", CATEGORY_CLUSTERED);
		
		//Standalone only (none)
		
		//Clustered only
		setPropertyCategory("org.quartz.jobStore.driverDelegateClass", CATEGORY_CLUSTERED);
		setPropertyCategory("org.quartz.jobStore.tablePrefix", CATEGORY_CLUSTERED);
		setPropertyCategory(QUARTZ_JOBSTORE_USEPROPERTIES, CATEGORY_CLUSTERED);
		setPropertyCategory("org.quartz.jobStore.isClustered", CATEGORY_CLUSTERED);
		
		//Depending on mode (none)
				
		
	
	}

	public static SchedulerProperties getInstance() {
		return (SchedulerProperties) Settings.getInstance().getModule(MODULE_NAME);
	}
	
	protected void  setPropertyCategory(String key, String category) {
		
		Set<String> categorySet = categoryMap.get(category);
		if (categorySet == null) {
			categorySet = new HashSet<>();
			categoryMap.put(category, categorySet);
		}
		if (!categorySet.contains(key))
			categorySet.add(key);
	}

	public java.util.Properties getClusteredProperties() {
		Properties clustered = new Properties();
		for (String key : categoryMap.get(CATEGORY_CLUSTERED)) {
			clustered.put(key, getProperty(key));
		}
		
		return clustered;
	}
	
	public java.util.Properties getStandaloneProperties() {
		
		Properties standalone = new Properties();
		for (String key : categoryMap.get(CATEGORY_STANDALONE)) {
			standalone.put(key, getProperty(key));
		}
		
		return standalone;
	}
	

	/**
	 * @return interval between two consecutive checks for updates of synchronous tasks ( milliseconds)
	 */
	public long getObserverCollectorUpdaterFixedDelay() {
		
		try {
			return Long.valueOf(getProperty(OBSERVERCOLLECTORUPDATER_FIXEDDELAY));
		} catch (NumberFormatException e) {
			return DEFAULT_OBSERVERCOLLECTORUPDATER_FIXEDDELAY;
		}
		
		
	}
	
	/**
	 * @return initial delay (seconds) before start polling synchronous tasks for changes
	 */
	public long getObserverCollectorUpdaterInitialDelay() {
		try {
			return Long.valueOf(getProperty(OBSERVERCOLLECTORUPDATER_INITIAL_DELAY));
		} catch (NumberFormatException e) {
			return DEFAULT_OBSERVERCOLLECTORUPDATER_INITIALDELAY;
		}
	}
	
	public int getSpringManagedTaskSchedulerPoolSize() {
		try {
			return Integer.valueOf(getProperty(SPRING_MANAGED_TASKSCHEDULER_POOLSIZE));
		} catch (NumberFormatException e) {
			return DEFAULT_SPRING_MANAGED_TASKSCHEDULER_POOLSIZE;
		}
	}
	
	public int getSpringManagedTaskSchedulerCorePoolSize() {
		try {
			return Integer.valueOf(getProperty(SPRING_MANAGED_TASKSCHEDULER_COREPOOLSIZE));
		} catch (NumberFormatException e) {
			return DEFAULT_SPRING_MANAGED_TASKSCHEDULER_COREPOOLSIZE;
		}
	}
	
	public int getSpringManagedTaskSchedulerMaximumPoolSize() {
		try {
			return Integer.valueOf(getProperty(SPRING_MANAGED_TASKSCHEDULER_MAXIMUMPOOLSIZE));
		} catch (NumberFormatException e) {
			return DEFAULT_SPRING_MANAGED_TASKSCHEDULER_MAXIMUMPOOLSIZE;
		}
	}
	

}

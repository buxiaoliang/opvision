package integration.scheduler.quartz;

import static org.junit.Assert.*;
import static org.hamcrest.Matchers.*;
import static org.cmdbuild.scheduler.Triggers.everySecond;

import java.util.Date;
import java.util.Properties;

//import javax.management.MXBean;
//import javax.sql.DataSource;

//import org.cmdbuild.config.SchedulerProperties;
import org.cmdbuild.scheduler.Job;
import org.cmdbuild.scheduler.OneTimeTrigger;
import org.cmdbuild.scheduler.RecurringTrigger;
import org.cmdbuild.scheduler.SchedulerExeptionFactory;
import org.cmdbuild.scheduler.SchedulerService;
import org.cmdbuild.scheduler.Trigger;
//import org.cmdbuild.scheduler.quartz.CMDBuildQuartzConnectionProvider;
import org.cmdbuild.scheduler.quartz.QuartzSchedulerService;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import support.scheduler.quartz.ExecutionListenerJob;
import support.scheduler.quartz.JobExecutionProbe;
import support.scheduler.quartz.SelfRemovingJob;
import utils.async.Poller;


@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { 
		"file:src/test/resources/META-INF/spring/test-config.xml"
//		"file:src/main/resources/META-INF/spring/application-config.xml",
//		"file:src/main/resources/META-INF/spring/security-config.xml",
//		"file:src/main/resources/META-INF/spring/persistence-config.xml"
	  })


public class QuartzSchedulerServiceTest {
	
	//@Autowired DataSource dataSource;
	//TODO: da definire in XML (META-INF test-config.xml)
	
	private static final long POLLING_TIMEOUT = 1000L;
	private static final long POLLING_INTERVAL = 100L;

	private static final int ONCE = 1;
	private static final int THREE_TIMES = 3;
	private static final long IN_THREE_SECONDS = (3 - 1) * 1000L;

	private SchedulerService scheduler;
	
	private Logger logger = LoggerFactory.getLogger(QuartzSchedulerServiceTest.class);
	
//	@Bean(destroyMethod = "shutdown")
//	public EmbeddedDatabase dataSource() {
//	    return new EmbeddedDatabaseBuilder().
//	            setType(EmbeddedDatabaseType.H2).
//	            addScript("db-schema-quartz.sql").
//	            //addScript("db-test-data.sql").
//	            build();
//	}

// before clustering feature
//	@Before
//	public void initScheduler() {
//		scheduler = new QuartzSchedulerService(new SchedulerExeptionFactory() {
//
//			@Override
//			public RuntimeException internal(final Throwable cause) {
//				return new RuntimeException();
//			}
//
//			@Override
//			public RuntimeException cronExpression(final Throwable cause, final String expression) {
//				return new RuntimeException(expression);
//			}
//
//		});
//	}
	
	@Before
	public void initScheduler() {
		scheduler = new QuartzSchedulerService(new SchedulerExeptionFactory() {

			@Override
			public RuntimeException internal(final Throwable cause) {
				return new RuntimeException();
			}

			@Override
			public RuntimeException cronExpression(final Throwable cause, final String expression) {
				return new RuntimeException(expression);
			}

		},
				false, getDefaultStandAloneConfigurationProperties()/*(new SchedulerProperties()).getStandaloneProperties()*/);
//				true, getDefaultClusteredConfigurationProperties()/*(new SchedulerProperties()).getStandaloneProperties()*/);
		
		
		//scheduler.start();
	}

	@After
	public void cleanScheduler() {
		scheduler.stop();
	}

	@Test(expected = RuntimeException.class)
	public void quartzForbidsAddingTheSameJobTwice() throws InterruptedException {
		final Job nullJob = createNullJob();
		final Trigger trigger = OneTimeTrigger.at(new Date());
		scheduler.add(nullJob, trigger);
		scheduler.add(nullJob, trigger);
	}

	@Test()
	public void quartzAllowsRemovalOfUnexistentJob() throws InterruptedException {
		final Job nullJob = createNullJob();
		scheduler.remove(nullJob);
	}

	@Test
	public void quartzExecutesAnImmediateJob() throws InterruptedException {
		final Job nullJob = createNullJob();
		final Trigger immediately = OneTimeTrigger.at(new Date());
		assertEventually(nullJob, willBeExecuted(immediately));
	}

	@Test
	public void quartzExecutesADeferredJob() throws InterruptedException {
		final Job nullJob = createNullJob();
		final Trigger timeout = OneTimeTrigger.at(afterMillis(POLLING_INTERVAL / 2));
		assertEventually(nullJob, willBeExecutedAfter(timeout));
	}

	@Test
	public void quartzCanHandleMultipleJobs() {
		final Trigger timeout = OneTimeTrigger.at(farFarAway());
		scheduler.add(createNullJob(), timeout);
		scheduler.add(createNullJob(), timeout);
	}

	@Test
	public void quartzExecutesARecurringJob() throws InterruptedException {
		final Job nullJob = createNullJob();
		assertEventually(nullJob, willBeExecutedApproximately(everySecond(), THREE_TIMES), IN_THREE_SECONDS);
	}

	@Test
	public void quartzRemovesARecurringJob() throws InterruptedException {
		final Job nullJob = createSelfRemovingJob();
		assertEventually(nullJob, willBeExecuted(everySecond(), ONCE), IN_THREE_SECONDS);
	}

	@Test
	public void quartzKnowsWhenJobIsAdded() throws InterruptedException {
		// given
		final Job job = createNullJob();
		final Trigger timeout = OneTimeTrigger.at(farFarAway());

		// then
		assertThat(scheduler.isStarted(job), equalTo(false));

		// and when
		scheduler.add(job, timeout);

		// then
		assertThat(scheduler.isStarted(job), equalTo(true));
	}

	/*
	 * Test helpers
	 */

	private ExecutionListenerJob createNullJob() {
		return new ExecutionListenerJob();
	}

	private ExecutionListenerJob createSelfRemovingJob() {
		return new SelfRemovingJob(scheduler);
	}

	public static Date afterMillis(final long millis) {
		final Date now = new Date();
		return new Date(now.getTime() + millis);
	}

	private Date farFarAway() {
		return afterMillis(1000000L);
	}

	private JobExecutionProbe willBeExecuted(final Trigger trigger) {
		return JobExecutionProbe.jobWasExecuted(trigger);
	}

	private JobExecutionProbe willBeExecutedAfter(final Trigger timeout) {
		return JobExecutionProbe.jobWasExecutedAfter((OneTimeTrigger) timeout);
	}

	private JobExecutionProbe willBeExecuted(final Trigger trigger, final int times) {
		return JobExecutionProbe.jobExecutionCounter((RecurringTrigger) trigger, times, times);
	}

	private JobExecutionProbe willBeExecutedApproximately(final Trigger trigger, final int times) {
		return JobExecutionProbe.jobExecutionCounter((RecurringTrigger) trigger, times, times + 1);
	}

	private void assertEventually(final Job job, final JobExecutionProbe probe) throws InterruptedException {
		assertEventually(job, probe, POLLING_TIMEOUT);
	}

	private void assertEventually(final Job job, final JobExecutionProbe probe, final long timeout)
			throws InterruptedException {
		probe.setJob((ExecutionListenerJob) job);
		scheduler.add(job, probe.getTrigger());
		scheduler.start();
		new Poller(timeout, POLLING_INTERVAL).check(probe);
		scheduler.stop();
	}
	
	private Properties getDefaultStandAloneConfigurationProperties() {
		
		Properties p = new Properties();
		p.putAll(getDefaultCommonConfigurationProperties());

		p.setProperty("org.quartz.scheduler.instanceName", "CMDBuildScheduler-RamStore");
		
		return p;
	}
	
	private Properties getDefaultClusteredConfigurationProperties() {
		Properties p = new Properties();
		
		//Common Configuration
		p.putAll(getDefaultCommonConfigurationProperties());
		//Clustered only Configuration
		p.setProperty("org.quartz.jobStore.isClustered", "true");
		p.setProperty("org.quartz.jobStore.useProperties", "true");
		p.setProperty("org.quartz.jobStore.driverDelegateClass", "org.quartz.impl.jdbcjobstore.PostgreSQLDelegate" );
		p.setProperty("org.quartz.jobStore.tablePrefix", "quartz.qrtz_" );
		
		p.setProperty("org.quartz.scheduler.instanceName", "CMDBuildScheduler-JobStoreTX");
		
		return p;
	}
	
	private Properties getDefaultCommonConfigurationProperties() {
		
		Properties p = new Properties();
		
		// Common Configuration
		p.setProperty("org.quartz.threadPool.class", "org.quartz.simpl.SimpleThreadPool");
		p.setProperty("org.quartz.threadPool.threadCount", "2");
		p.setProperty("org.quartz.threadPool.threadPriority", "4");
		p.setProperty("org.quartz.scheduler.skipUpdateCheck", "true");
		p.setProperty("org.quartz.scheduler.instanceId", "AUTO");
		p.setProperty("org.quartz.scheduler.instanceName", "CMDBuildScheduler");
		
		return p;
	}
}

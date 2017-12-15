package org.cmdbuild.scheduler.quartz.db;

import javax.sql.DataSource;

import org.quartz.impl.jdbcjobstore.PostgreSQLDelegate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.SimpleDriverDataSource;

//TODO refactor (move)

@Configuration
@ComponentScan
public class SpringSupport4QuartzSchedulerTest {
	
//	@Bean
//	public DataSource getConfiguredDataSource() {
//		
//		org.apache.tomcat.jdbc.pool.DataSource ds = new org.apache.tomcat.jdbc.pool.DataSource();
//		ds.setDriverClassName("org.postgresql.Driver");
//		ds.setUsername("postgres");
//		ds.setUrl("jdbc:postgresql://localhost:5432/_cmdbuild-tests");
//		ds.setPassword("postgres");
//		ds.setInitialSize(2);
//		return ds;
//		
//	}

}

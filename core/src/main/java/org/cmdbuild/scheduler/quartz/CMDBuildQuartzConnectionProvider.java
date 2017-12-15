package org.cmdbuild.scheduler.quartz;

//import static org.cmdbuild.spring.SpringIntegrationUtils.applicationContext;

import java.sql.Connection;
import java.sql.SQLException;

import javax.sql.DataSource;

//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.annotation.ComponentScan;
//import org.springframework.stereotype.Component;


//@ComponentScan
//@Component
public class CMDBuildQuartzConnectionProvider implements org.quartz.utils.ConnectionProvider  {

	DataSource dataSource;
	
	@Override
	public Connection getConnection() throws SQLException {
		// TODO Auto-generated method stub
		if (dataSource == null) {
//			if (dataSource != null)
//				dataSource = testDataSource;
//			else
			dataSource = SpringIntegrationUtils4Scheduler.applicationContext().getBean(DataSource.class);
		}
		return dataSource.getConnection();
	}

	@Override
	public void shutdown() throws SQLException {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void initialize() throws SQLException {
		// TODO Auto-generated method stub
		
	}
	
	//
//	@Deprecated
//	private static DataSource testDataSource;
//	public static void setDataSource(DataSource ds) {
//		testDataSource = ds;
//	}
	
}

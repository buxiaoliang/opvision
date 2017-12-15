package org.cmdbuild.spring.configuration;

import static org.cmdbuild.spring.util.Constants.PROTOTYPE;

import org.cmdbuild.auth.UserStore;
import org.cmdbuild.auth.acl.PrivilegeContextFactory;
import org.cmdbuild.auth.context.DefaultPrivilegeContextFactory;
import org.cmdbuild.dao.view.user.privileges.PartiallyCachingRowAndColumnPrivilegeFetcherFactory;
import org.cmdbuild.dao.view.user.privileges.RowAndColumnPrivilegeFetcherFactory;
import org.cmdbuild.privileges.fetchers.DataViewRowAndColumnPrivilegeFetcherFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
public class PrivilegeManagement {

	@Autowired
	private Data data;

	@Autowired
	private UserStore userStore;

	@Bean
	public PrivilegeContextFactory privilegeContextFactory() {
		return new DefaultPrivilegeContextFactory();
	}

	@Bean
	@Scope(PROTOTYPE)
	public RowAndColumnPrivilegeFetcherFactory rowAndColumnPrivilegeFetcher() {
		return new PartiallyCachingRowAndColumnPrivilegeFetcherFactory(
				new DataViewRowAndColumnPrivilegeFetcherFactory(data.systemDataView(), userStore));
	}

}

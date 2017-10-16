package org.cmdbuild.service.rest.v1.cxf.configuration;

import org.cmdbuild.auth.UserStore;
import org.cmdbuild.config.CmdbuildConfiguration;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.logic.auth.AuthenticationLogic;
import org.cmdbuild.logic.auth.RestSessionLogic;
import org.cmdbuild.logic.auth.SessionLogic;
import org.cmdbuild.logic.data.access.DataAccessLogic;
import org.cmdbuild.logic.data.access.SystemDataAccessLogic;
import org.cmdbuild.logic.data.access.WebServiceDataAccessLogic;
import org.cmdbuild.logic.data.lookup.LookupLogic;
import org.cmdbuild.logic.dms.DmsLogic;
import org.cmdbuild.logic.dms.PrivilegedDmsLogic;
import org.cmdbuild.logic.menu.MenuLogic;
import org.cmdbuild.logic.privileges.SecurityLogic;
import org.cmdbuild.logic.workflow.WebserviceWorkflowLogicBuilder;
import org.cmdbuild.logic.workflow.WorkflowLogic;
import org.cmdbuild.services.meta.MetadataStoreFactory;
import org.cmdbuild.workflow.LookupHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class ApplicationContextHelperV1 {

	@Autowired
	private ApplicationContext applicationContext;

	public AuthenticationLogic authenticationLogic() {
		return applicationContext.getBean(RestSessionLogic.class);
	}

	public CmdbuildConfiguration cmdbuildConfiguration() {
		return applicationContext.getBean(CmdbuildConfiguration.class);
	}

	public DmsLogic dmsLogic() {
		return applicationContext.getBean(PrivilegedDmsLogic.class);
	}

	public LookupHelper lookupHelper() {
		return applicationContext.getBean(LookupHelper.class);
	}

	public LookupLogic lookupLogic() {
		return applicationContext.getBean(LookupLogic.class);
	}

	public MenuLogic menuLogic() {
		return applicationContext.getBean(MenuLogic.class);
	}

	public MetadataStoreFactory metadataStoreFactory() {
		return applicationContext.getBean(MetadataStoreFactory.class);
	}

	public SecurityLogic securityLogic() {
		return applicationContext.getBean(SecurityLogic.class);
	}

	public SessionLogic sessionLogic() {
		return applicationContext.getBean(RestSessionLogic.class);
	}

	public DataAccessLogic systemDataAccessLogic() {
		return applicationContext.getBean(SystemDataAccessLogic.BEAN, DataAccessLogic.class);
	}

	public CMDataView systemDataView() {
		return applicationContext.getBean("systemDataView", CMDataView.class);
	}

	public DataAccessLogic userDataAccessLogic() {
		return applicationContext.getBean(WebServiceDataAccessLogic.BEAN, DataAccessLogic.class);
	}

	public CMDataView userDataView() {
		return applicationContext.getBean("UserDataView", CMDataView.class);
	}

	public UserStore userStore() {
		return applicationContext.getBean(UserStore.class);
	}

	public WorkflowLogic userWorkflowLogic() {
		return applicationContext.getBean(WebserviceWorkflowLogicBuilder.class).build();
	}

}

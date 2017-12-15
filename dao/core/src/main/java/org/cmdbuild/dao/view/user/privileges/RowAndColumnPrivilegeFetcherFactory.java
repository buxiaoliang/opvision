package org.cmdbuild.dao.view.user.privileges;

import org.cmdbuild.auth.acl.PrivilegeContext;

public interface RowAndColumnPrivilegeFetcherFactory {

	RowAndColumnPrivilegeFetcher create(PrivilegeContext privilegeContext);

}

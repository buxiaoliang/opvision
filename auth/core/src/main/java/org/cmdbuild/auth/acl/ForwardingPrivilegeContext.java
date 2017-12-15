package org.cmdbuild.auth.acl;

import com.google.common.collect.ForwardingObject;
import java.util.List;

public abstract class ForwardingPrivilegeContext extends ForwardingObject implements PrivilegeContext {

	/**
	 * Usable by subclasses only.
	 */
	protected ForwardingPrivilegeContext() {
	}

	@Override
	protected abstract PrivilegeContext delegate();

	@Override
	public boolean hasPrivilege(final CMPrivilege privilege) {
		return delegate().hasPrivilege(privilege);
	}

	@Override
	public boolean hasAdministratorPrivileges() {
		return delegate().hasAdministratorPrivileges();
	}

	@Override
	public boolean hasDatabaseDesignerPrivileges() {
		return delegate().hasDatabaseDesignerPrivileges();
	}

	@Override
	public boolean hasPrivilege(final CMPrivilege requested, final CMPrivilegedObject privilegedObject) {
		return delegate().hasPrivilege(requested, privilegedObject);
	}

	@Override
	public boolean hasReadAccess(final CMPrivilegedObject privilegedObject) {
		return delegate().hasReadAccess(privilegedObject);
	}

	@Override
	public boolean hasWriteAccess(final CMPrivilegedObject privilegedObject) {
		return delegate().hasWriteAccess(privilegedObject);
	}

	@Override
	public PrivilegedObjectMetadata getMetadata(final CMPrivilegedObject privilegedObject) {
		return delegate().getMetadata(privilegedObject);
	}

	@Override
	public Iterable<PrivilegesContainer> getAllPrivilegesContainers(CMPrivilegedObject privilegedObject){
		return delegate().getAllPrivilegesContainers(privilegedObject);
	}

//	@Override
//	public Iterable<PrivilegeContext> getPrivilegeContextList(CMPrivilegedObject privilegedObject){
//		return delegate().getPrivilegeContextList(privilegedObject);
//	}

	@Override
	public List<PrivilegeContext> getPrivilegeContextList(){
		return delegate().getPrivilegeContextList();
	}

}

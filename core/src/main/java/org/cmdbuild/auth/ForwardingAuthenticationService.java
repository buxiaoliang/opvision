package org.cmdbuild.auth;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.cmdbuild.auth.ClientRequestAuthenticator.ClientRequest;
import org.cmdbuild.auth.acl.CMGroup;
import org.cmdbuild.auth.user.AuthenticatedUser;
import org.cmdbuild.auth.user.CMUser;
import org.cmdbuild.common.utils.PagedElements;
import org.cmdbuild.logic.auth.GroupDTO;
import org.cmdbuild.logic.auth.UserDTO;

import com.google.common.collect.ForwardingObject;

public abstract class ForwardingAuthenticationService extends ForwardingObject implements AuthenticationService {

	/**
	 * Usable by subclasses only.
	 */
	protected ForwardingAuthenticationService() {
	}

	@Override
	protected abstract AuthenticationService delegate();

	@Override
	public void setPasswordAuthenticators(final PasswordAuthenticator... passwordAuthenticators) {
		delegate().setPasswordAuthenticators(passwordAuthenticators);
	}

	@Override
	public void setClientRequestAuthenticators(final ClientRequestAuthenticator... clientRequestAuthenticators) {
		delegate().setClientRequestAuthenticators(clientRequestAuthenticators);
	}

	@Override
	public void setUserFetchers(final UserFetcher... userFetchers) {
		delegate().setUserFetchers(userFetchers);
	}

	@Override
	public void setGroupFetcher(final GroupFetcher groupFetcher) {
		delegate().setGroupFetcher(groupFetcher);
	}

	@Override
	public AuthenticatedUser authenticate(final Login login, final String password) {
		return delegate().authenticate(login, password);
	}

	@Override
	public AuthenticatedUser authenticate(final Login login, final PasswordCallback passwordCallback) {
		return delegate().authenticate(login, passwordCallback);
	}

	@Override
	public ClientAuthenticatorResponse authenticate(final ClientRequest request) {
		return delegate().authenticate(request);
	}

	@Override
	public List<CMUser> fetchUsersByGroupId(final Long groupId) {
		return delegate().fetchUsersByGroupId(groupId);
	}

	@Override
	public List<Long> fetchUserIdsByGroupId(final Long groupId) {
		return delegate().fetchUserIdsByGroupId(groupId);
	}

	@Override
	public CMUser fetchUserById(final Long userId) {
		return delegate().fetchUserById(userId);
	}

	@Override
	public CMUser fetchUserByUsername(final String username) {
		return delegate().fetchUserByUsername(username);
	}

	@Override
	public Optional<Long> fetchUserPosition(final Long id) {
		return delegate().fetchUserPosition(id);
	}

	@Override
	public CMUser createUser(final UserDTO userDTO) {
		return delegate().createUser(userDTO);
	}

	@Override
	public CMUser updateUser(final UserDTO userDTO) {
		return delegate().updateUser(userDTO);
	}

	@Override
	public CMGroup createGroup(final GroupDTO groupDTO) {
		return delegate().createGroup(groupDTO);
	}

	@Override
	public CMGroup updateGroup(final GroupDTO groupDTO) {
		return delegate().updateGroup(groupDTO);
	}

	@Override
	public CMGroup setGroupActive(final Long groupId, final boolean active) {
		return delegate().setGroupActive(groupId, active);
	}

	@Override
	public Iterable<CMGroup> fetchAllGroups() {
		return delegate().fetchAllGroups();
	}

	@Override
	public PagedElements<CMUser> fetchAllUsers(final int offset, final int limit, final Map<String, Boolean> sort,
			final Iterable<Long> exclude, final String query, final boolean activeOnly) {
		return delegate().fetchAllUsers(offset, limit, sort, exclude, query, activeOnly);
	}

	@Override
	public Iterable<CMUser> fetchServiceOrPrivilegedUsers() {
		return delegate().fetchServiceOrPrivilegedUsers();
	}

	@Override
	public CMGroup fetchGroupWithId(final Long groupId) {
		return delegate().fetchGroupWithId(groupId);
	}

	@Override
	public CMGroup fetchGroupWithName(final String groupName) {
		return delegate().fetchGroupWithName(groupName);
	}

	@Override
	public CMUser enableUserWithId(final Long userId) {
		return delegate().enableUserWithId(userId);
	}

	@Override
	public CMUser disableUserWithId(final Long userId) {
		return delegate().disableUserWithId(userId);
	}

	@Override
	public CMGroup changeGroupStatusTo(final Long groupId, final boolean isActive) {
		return delegate().changeGroupStatusTo(groupId, isActive);
	}

}

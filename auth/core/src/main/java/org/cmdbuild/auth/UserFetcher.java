package org.cmdbuild.auth;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.cmdbuild.auth.user.CMUser;
import org.cmdbuild.common.utils.PagedElements;

public interface UserFetcher {

	CMUser fetchUser(Login login);

	List<CMUser> fetchUsersFromGroupId(Long groupId);

	List<Long> fetchUserIdsFromGroupId(Long groupId);

	CMUser fetchUserById(Long userId);

	Optional<Long> fetchUserPosition(long userId);

	PagedElements<CMUser> fetchAllUsers(int offset, int limit, Map<String, Boolean> sort, Iterable<Long> exclude,
			String query, boolean activeOnly);

	Iterable<CMUser> fetchServiceOrPrivilegedUsers();

}

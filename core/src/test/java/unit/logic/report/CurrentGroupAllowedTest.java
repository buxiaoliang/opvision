package unit.logic.report;

import static com.google.common.base.Suppliers.ofInstance;
import static com.google.common.reflect.Reflection.newProxy;
import static java.util.Arrays.asList;
import static org.cmdbuild.common.utils.Reflection.unsupported;
import static org.cmdbuild.logic.report.Predicates.currentGroupAllowed;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import org.cmdbuild.auth.acl.CMGroup;
import org.cmdbuild.auth.acl.PrivilegeContext;
import org.cmdbuild.auth.user.AuthenticatedUser;
import org.cmdbuild.auth.user.OperationUser;
import org.cmdbuild.services.store.report.Report;
import org.junit.Test;

public class CurrentGroupAllowedTest {

	@Test
	public void alwaysAllowedForAdministrators() throws Exception {
		// given
		final AuthenticatedUser authUser = newProxy(AuthenticatedUser.class, unsupported("should not be used"));
		final PrivilegeContext privilegeCtx = mock(PrivilegeContext.class);
		doReturn(true) //
				.when(privilegeCtx).hasAdministratorPrivileges();
		final CMGroup selectedGroup = newProxy(CMGroup.class, unsupported("should not be used"));
		final OperationUser user = new OperationUser(authUser, privilegeCtx, selectedGroup);
		final Report input = newProxy(Report.class, unsupported("should not be used"));

		// when
		assertThat(currentGroupAllowed(ofInstance(user)).apply(input), equalTo(true));

		// then
		verify(privilegeCtx).hasAdministratorPrivileges();
		verifyNoMoreInteractions(privilegeCtx);
	}

	@Test
	public void whenDefaultGroupIsSelectedAllGroupsAreConsideredButNoOneIsFound() throws Exception {
		// given
		final AuthenticatedUser authUser = mock(AuthenticatedUser.class);
		doReturn("foo") //
				.when(authUser).getDefaultGroupName();
		doReturn(asList("foo", "FOO")) //
				.when(authUser).getGroupNames();
		final PrivilegeContext privilegeCtx = mock(PrivilegeContext.class);
		doReturn(false) //
				.when(privilegeCtx).hasAdministratorPrivileges();
		final CMGroup selectedGroup = newProxy(CMGroup.class, unsupported("should not be used"));
		final OperationUser user = new OperationUser(authUser, privilegeCtx, selectedGroup);
		final Report input = mock(Report.class);
		doReturn(new String[] { "bar", "baz" }) //
				.when(input).getGroups();

		// when
		assertThat(currentGroupAllowed(ofInstance(user)).apply(input), equalTo(false));

		// then
		verify(privilegeCtx).hasAdministratorPrivileges();
		verify(authUser).getDefaultGroupName();
		verify(authUser).getGroupNames();
		verifyNoMoreInteractions(authUser, privilegeCtx);
	}

	@Test
	public void whenDefaultGroupIsSelectedAllGroupsAreConsideredAndOneIsFound() throws Exception {
		// given
		final AuthenticatedUser authUser = mock(AuthenticatedUser.class);
		doReturn("foo") //
				.when(authUser).getDefaultGroupName();
		doReturn(asList("foo", "bar")) //
				.when(authUser).getGroupNames();
		final PrivilegeContext privilegeCtx = mock(PrivilegeContext.class);
		doReturn(false) //
				.when(privilegeCtx).hasAdministratorPrivileges();
		final CMGroup selectedGroup = newProxy(CMGroup.class, unsupported("should not be used"));
		final OperationUser user = new OperationUser(authUser, privilegeCtx, selectedGroup);
		final Report input = mock(Report.class);
		doReturn(new String[] { "bar", "baz" }) //
				.when(input).getGroups();

		// when
		assertThat(currentGroupAllowed(ofInstance(user)).apply(input), equalTo(true));

		// then
		verify(privilegeCtx).hasAdministratorPrivileges();
		verify(authUser).getDefaultGroupName();
		verify(authUser).getGroupNames();
		verifyNoMoreInteractions(authUser, privilegeCtx);
	}

	@Test
	public void whenDefaultGroupIsNotSelectedOnlyActualOneIsConsideredButItIsNotFound() throws Exception {
		// given
		final AuthenticatedUser authUser = mock(AuthenticatedUser.class);
		doReturn(null) //
				.when(authUser).getDefaultGroupName();
		final PrivilegeContext privilegeCtx = mock(PrivilegeContext.class);
		doReturn(false) //
				.when(privilegeCtx).hasAdministratorPrivileges();
		final CMGroup selectedGroup = mock(CMGroup.class);
		doReturn("foo") //
				.when(selectedGroup).getName();
		final OperationUser user = new OperationUser(authUser, privilegeCtx, selectedGroup);
		final Report input = mock(Report.class);
		doReturn(new String[] { "bar", "baz" }) //
				.when(input).getGroups();

		// when
		assertThat(currentGroupAllowed(ofInstance(user)).apply(input), equalTo(false));

		// then
		verify(privilegeCtx).hasAdministratorPrivileges();
		verify(authUser).getDefaultGroupName();
		verify(selectedGroup).getName();
		verifyNoMoreInteractions(authUser, privilegeCtx, selectedGroup);
	}

	@Test
	public void whenDefaultGroupIsNotSelectedOnlyActualOneIsConsideredAndItIsFound() throws Exception {
		// given
		final AuthenticatedUser authUser = mock(AuthenticatedUser.class);
		doReturn(null) //
				.when(authUser).getDefaultGroupName();
		final PrivilegeContext privilegeCtx = mock(PrivilegeContext.class);
		doReturn(false) //
				.when(privilegeCtx).hasAdministratorPrivileges();
		final CMGroup selectedGroup = mock(CMGroup.class);
		doReturn("bar") //
				.when(selectedGroup).getName();
		final OperationUser user = new OperationUser(authUser, privilegeCtx, selectedGroup);
		final Report input = mock(Report.class);
		doReturn(new String[] { "bar", "baz" }) //
				.when(input).getGroups();

		// when
		assertThat(currentGroupAllowed(ofInstance(user)).apply(input), equalTo(true));

		// then
		verify(privilegeCtx).hasAdministratorPrivileges();
		verify(authUser).getDefaultGroupName();
		verify(selectedGroup).getName();
		verifyNoMoreInteractions(authUser, privilegeCtx, selectedGroup);
	}

}

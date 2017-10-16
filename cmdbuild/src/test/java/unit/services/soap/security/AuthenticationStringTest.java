package unit.services.soap.security;

import static org.cmdbuild.auth.Login.LoginType.EMAIL;
import static org.cmdbuild.services.soap.security.LoginAndGroup.loginAndGroup;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;

import org.cmdbuild.auth.Login;
import org.cmdbuild.auth.Login.LoginType;
import org.cmdbuild.services.soap.security.PasswordHandler.AuthenticationString;
import org.junit.Test;

public class AuthenticationStringTest {

	private static Login login(final String value) {
		return Login.newInstance() //
				.withValue(value) //
				.build();
	}

	private Login login(final String value, final LoginType type) {
		return Login.newInstance() //
				.withValue(value) //
				.withType(type) //
				.build();
	}

	@Test
	public void usernameWithNoImpersonate() {
		// when
		final AuthenticationString output = new AuthenticationString("foo");

		// then
		assertThat(output.getAuthenticationLogin(), equalTo(loginAndGroup(login("foo"))));
		assertThat(output.getImpersonationLogin(), equalTo(null));
		assertThat(output.shouldImpersonate(), equalTo(false));
		assertThat(output.impersonateForcibly(), equalTo(false));
	}

	@Test
	public void usernameAndGroupWithNoImpersonate() {
		// when
		final AuthenticationString output = new AuthenticationString("foo@bar");

		// then
		assertThat(output.getAuthenticationLogin(), equalTo(loginAndGroup(login("foo"), "bar")));
		assertThat(output.getImpersonationLogin(), equalTo(null));
		assertThat(output.shouldImpersonate(), equalTo(false));
		assertThat(output.impersonateForcibly(), equalTo(false));
	}

	@Test
	public void usernameWithUsernameImpersonate() {
		// when
		final AuthenticationString output = new AuthenticationString("foo#bar");

		// then
		assertThat(output.getAuthenticationLogin(), equalTo(loginAndGroup(login("foo"))));
		assertThat(output.getImpersonationLogin(), equalTo(loginAndGroup(login("bar"))));
		assertThat(output.shouldImpersonate(), equalTo(true));
		assertThat(output.impersonateForcibly(), equalTo(false));
	}

	@Test
	public void usernameWithUsernameImpersonateAndGroup() {
		// when
		final AuthenticationString output = new AuthenticationString("foo#bar@baz");

		// then
		assertThat(output.getAuthenticationLogin(), equalTo(loginAndGroup(login("foo"), "baz")));
		assertThat(output.getImpersonationLogin(), equalTo(loginAndGroup(login("bar"), "baz")));
		assertThat(output.shouldImpersonate(), equalTo(true));
		assertThat(output.impersonateForcibly(), equalTo(false));
	}

	@Test
	public void usernameWithEmailImpersonate() {
		// when
		final AuthenticationString output = new AuthenticationString("foo#bar@example.com");

		// then
		assertThat(output.getAuthenticationLogin(), equalTo(loginAndGroup(login("foo"))));
		assertThat(output.getImpersonationLogin(), equalTo(loginAndGroup(login("bar@example.com", EMAIL))));
		assertThat(output.shouldImpersonate(), equalTo(true));
		assertThat(output.impersonateForcibly(), equalTo(false));
	}

	@Test
	public void usernameWithEmailImpersonateAndGroup() {
		// when
		final AuthenticationString output = new AuthenticationString("foo#bar@example.com@baz");

		// then
		assertThat(output.getAuthenticationLogin(), equalTo(loginAndGroup(login("foo"), "baz")));
		assertThat(output.getImpersonationLogin(), equalTo(loginAndGroup(login("bar@example.com", EMAIL), "baz")));
		assertThat(output.shouldImpersonate(), equalTo(true));
		assertThat(output.impersonateForcibly(), equalTo(false));
	}

	@Test
	public void usernameWithUsernameImpersonateForcibly() {
		// when
		final AuthenticationString output = new AuthenticationString("foo!bar");

		// then
		assertThat(output.getAuthenticationLogin(), equalTo(loginAndGroup(login("foo"))));
		assertThat(output.getImpersonationLogin(), equalTo(loginAndGroup(login("bar"))));
		assertThat(output.shouldImpersonate(), equalTo(true));
		assertThat(output.impersonateForcibly(), equalTo(true));
	}

	@Test
	public void usernameWithUsernameImpersonateAndGroupForcibly() {
		// when
		final AuthenticationString output = new AuthenticationString("foo!bar@baz");

		// then
		assertThat(output.getAuthenticationLogin(), equalTo(loginAndGroup(login("foo"), "baz")));
		assertThat(output.getImpersonationLogin(), equalTo(loginAndGroup(login("bar"), "baz")));
		assertThat(output.shouldImpersonate(), equalTo(true));
		assertThat(output.impersonateForcibly(), equalTo(true));
	}

	@Test
	public void usernameWithEmailImpersonateForcibly() {
		// when
		final AuthenticationString output = new AuthenticationString("foo!bar@example.com");

		// then
		assertThat(output.getAuthenticationLogin(), equalTo(loginAndGroup(login("foo"))));
		assertThat(output.getImpersonationLogin(), equalTo(loginAndGroup(login("bar@example.com", EMAIL))));
		assertThat(output.shouldImpersonate(), equalTo(true));
		assertThat(output.impersonateForcibly(), equalTo(true));
	}

	@Test
	public void usernameWithEmailImpersonateAndGroupForcibly() {
		// when
		final AuthenticationString output = new AuthenticationString("foo!bar@example.com@baz");

		// then
		assertThat(output.getAuthenticationLogin(), equalTo(loginAndGroup(login("foo"), "baz")));
		assertThat(output.getImpersonationLogin(), equalTo(loginAndGroup(login("bar@example.com", EMAIL), "baz")));
		assertThat(output.shouldImpersonate(), equalTo(true));
		assertThat(output.impersonateForcibly(), equalTo(true));
	}

}

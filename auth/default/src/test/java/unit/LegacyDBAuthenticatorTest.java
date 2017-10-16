package unit;

import static org.mockito.Mockito.mock;

import org.cmdbuild.auth.LegacyDBAuthenticator;
import org.cmdbuild.auth.LegacyDBAuthenticator.Configuration;
import org.cmdbuild.dao.view.CMDataView;
import org.junit.Test;

public class LegacyDBAuthenticatorTest {

	@Test(expected = NullPointerException.class)
	public void configurationCannotBeNull() {
		// given
		final CMDataView view = mock(CMDataView.class);

		// when
		new LegacyDBAuthenticator(null, view);
	}

	@Test(expected = NullPointerException.class)
	public void viewCannotBeNull() {
		// given
		final Configuration configuration = mock(Configuration.class);

		// when
		new LegacyDBAuthenticator(configuration, null);
	}

}

package unit.dao.view.user.privileges;

import static org.hamcrest.Matchers.instanceOf;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import org.cmdbuild.auth.acl.PrivilegeContext;
import org.cmdbuild.dao.view.user.privileges.PartiallyCachingRowAndColumnPrivilegeFetcher;
import org.cmdbuild.dao.view.user.privileges.PartiallyCachingRowAndColumnPrivilegeFetcherFactory;
import org.cmdbuild.dao.view.user.privileges.RowAndColumnPrivilegeFetcher;
import org.cmdbuild.dao.view.user.privileges.RowAndColumnPrivilegeFetcherFactory;
import org.junit.Test;
import static org.mockito.Mockito.when;

public class PartiallyCachingRowAndColumnPrivilegeFetcherFactoryTest {

	@Test
	public void returnsAnInstanceOfPartiallyCachingRowAndColumnPrivilegeFetcher() throws Exception {
		// given
		final RowAndColumnPrivilegeFetcherFactory delegate = mock(RowAndColumnPrivilegeFetcherFactory.class);
		final PartiallyCachingRowAndColumnPrivilegeFetcherFactory underTest = new PartiallyCachingRowAndColumnPrivilegeFetcherFactory(delegate);
		final PrivilegeContext privilegeContext = mock(PrivilegeContext.class);
		when(delegate.create(privilegeContext)).thenReturn(mock(RowAndColumnPrivilegeFetcher.class));

		// when
		final RowAndColumnPrivilegeFetcher outout = underTest.create(privilegeContext);

		// then
		verify(delegate).create(eq(privilegeContext));

		assertThat(outout, instanceOf(PartiallyCachingRowAndColumnPrivilegeFetcher.class));
	}

}

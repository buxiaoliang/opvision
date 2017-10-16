package unit.cxf;

import static org.cmdbuild.service.rest.v2.model.Models.newFilter;
import static org.cmdbuild.service.rest.v2.model.Models.newResponseMultiple;
import static org.cmdbuild.service.rest.v2.model.Models.newResponseSingle;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyInt;
import static org.mockito.Matchers.anyLong;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import org.cmdbuild.service.rest.v2.cxf.CxfProcessTemporaryFilters;
import org.cmdbuild.service.rest.v2.cxf.FiltersHelper;
import org.cmdbuild.service.rest.v2.model.Filter;
import org.cmdbuild.service.rest.v2.model.ResponseMultiple;
import org.cmdbuild.service.rest.v2.model.ResponseSingle;
import org.junit.Before;
import org.junit.Test;

public class CxfProcessTemporaryFiltersTest {

	private static class DummyException extends RuntimeException {

		private static final long serialVersionUID = 1L;

	}

	private FiltersHelper delegate;
	private CxfProcessTemporaryFilters underTest;

	@Before
	public void setUp() throws Exception {
		delegate = mock(FiltersHelper.class);
		underTest = new CxfProcessTemporaryFilters(delegate);
	}

	@Test(expected = DummyException.class)
	public void createWhenDelegateThrowsException() throws Exception {
		// given
		doThrow(DummyException.class) //
				.when(delegate).create(anyString(), any(Filter.class));
		final Filter filter = newFilter().build();

		// when
		try {
			underTest.create("foo", filter);
		} catch (final DummyException e) {
			// then
			verify(delegate).create(eq("foo"), eq(filter));
			verifyNoMoreInteractions(delegate);
			throw e;
		}
	}

	@Test
	public void create() throws Exception {
		// given
		final ResponseSingle<Filter> expected = newResponseSingle(Filter.class).build();
		doReturn(expected) //
				.when(delegate).create(anyString(), any(Filter.class));
		final Filter filter = newFilter().build();

		// when
		final ResponseSingle<Filter> response = underTest.create("foo", filter);

		// then
		verify(delegate).create(eq("foo"), eq(filter));
		verifyNoMoreInteractions(delegate);

		assertThat(response, equalTo(expected));
	}

	@Test(expected = DummyException.class)
	public void readAllWhenDelegateThrowsException() throws Exception {
		// given
		doThrow(DummyException.class) //
				.when(delegate).readAll(anyString(), anyInt(), anyInt());

		// when
		try {
			underTest.readAll("foo", 1, 2);
		} catch (final DummyException e) {
			// then
			verify(delegate).readAll(eq("foo"), eq(1), eq(2));
			verifyNoMoreInteractions(delegate);
			throw e;
		}
	}

	@Test
	public void readAll() throws Exception {
		// given
		final ResponseMultiple<Filter> expected = newResponseMultiple(Filter.class).build();
		doReturn(expected) //
				.when(delegate).readAll(anyString(), anyInt(), anyInt());

		// when
		final ResponseMultiple<Filter> response = underTest.readAll("foo", 1, 2);

		// then
		verify(delegate).readAll(eq("foo"), eq(1), eq(2));
		verifyNoMoreInteractions(delegate);

		assertThat(response, equalTo(expected));
	}

	@Test(expected = DummyException.class)
	public void readWhenDelegateThrowsException() throws Exception {
		// given
		doThrow(DummyException.class) //
				.when(delegate).read(anyString(), anyLong());

		// when
		try {
			underTest.read("foo", 42L);
		} catch (final DummyException e) {
			// then
			verify(delegate).read(eq("foo"), eq(42L));
			verifyNoMoreInteractions(delegate);
			throw e;
		}
	}

	@Test
	public void read() throws Exception {
		// given
		// given
		final ResponseSingle<Filter> expected = newResponseSingle(Filter.class).build();
		doReturn(expected) //
				.when(delegate).read(anyString(), anyLong());

		// when
		final ResponseSingle<Filter> response = underTest.read("foo", 42L);

		// then
		verify(delegate).read(eq("foo"), eq(42L));
		verifyNoMoreInteractions(delegate);

		assertThat(response, equalTo(expected));
	}

	@Test(expected = DummyException.class)
	public void updateWhenDelegateThrowsException() throws Exception {
		// given
		doThrow(DummyException.class) //
				.when(delegate).update(anyString(), anyLong(), any(Filter.class));
		final Filter filter = newFilter().build();

		// when
		try {
			underTest.update("foo", 42L, filter);
		} catch (final DummyException e) {
			// then
			verify(delegate).update(eq("foo"), eq(42L), eq(filter));
			verifyNoMoreInteractions(delegate);
			throw e;
		}
	}

	@Test
	public void update() throws Exception {
		// given
		final Filter filter = newFilter().build();

		// when
		underTest.update("foo", 42L, filter);

		// then
		verify(delegate).update(eq("foo"), eq(42L), eq(filter));
		verifyNoMoreInteractions(delegate);
	}

	@Test(expected = DummyException.class)
	public void deleteWhenDelegateThrowsException() throws Exception {
		// given
		doThrow(DummyException.class) //
				.when(delegate).delete(anyString(), anyLong());

		// when
		try {
			underTest.delete("foo", 42L);
		} catch (final DummyException e) {
			// then
			verify(delegate).delete(eq("foo"), eq(42L));
			verifyNoMoreInteractions(delegate);
			throw e;
		}
	}

	@Test
	public void delete() throws Exception {
		// when
		underTest.delete("foo", 42L);

		// then
		verify(delegate).delete(eq("foo"), eq(42L));
		verifyNoMoreInteractions(delegate);
	}

}

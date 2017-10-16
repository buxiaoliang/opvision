package unit.cxf;

import static com.google.common.reflect.Reflection.newProxy;
import static java.util.Arrays.asList;
import static java.util.Optional.empty;
import static java.util.Optional.of;
import static org.cmdbuild.common.utils.Reflection.unsupported;
import static org.cmdbuild.service.rest.v2.model.Models.newFilter;
import static org.cmdbuild.service.rest.v2.model.Models.newMetadata;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyLong;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import org.cmdbuild.common.utils.PagedElements;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.logic.data.access.DataAccessLogic;
import org.cmdbuild.logic.filter.FilterLogic;
import org.cmdbuild.service.rest.v2.cxf.ErrorHandler;
import org.cmdbuild.service.rest.v2.cxf.DefaultFiltersHelper;
import org.cmdbuild.service.rest.v2.model.Filter;
import org.cmdbuild.service.rest.v2.model.ResponseMultiple;
import org.cmdbuild.service.rest.v2.model.ResponseSingle;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;

public class DefaultFiltersHelperTest {

	private static class DummyException extends RuntimeException {

		private static final long serialVersionUID = 1L;

	}

	private static FilterLogic.Filter simpleFilter(final Long id, final String description) {
		return new FilterLogic.ForwardingFilter() {

			@Override
			protected FilterLogic.Filter delegate() {
				return newProxy(FilterLogic.Filter.class, unsupported("method should not be used"));
			}

			@Override
			public Long getId() {
				return id;
			}

			@Override
			public String getDescription() {
				return description;
			}

		};
	}

	private ErrorHandler errorHandler;
	private FilterLogic filterLogic;
	private DataAccessLogic dataAccessLogic;
	private DefaultFiltersHelper underTest;

	@Before
	public void setUp() throws Exception {
		errorHandler = mock(ErrorHandler.class);
		filterLogic = mock(FilterLogic.class);
		dataAccessLogic = mock(DataAccessLogic.class);
		underTest = new DefaultFiltersHelper(errorHandler, filterLogic, dataAccessLogic);
	}

	@Test(expected = DummyException.class)
	public void createWhenClassNotFound() throws Exception {
		// given
		doReturn(null) //
				.when(dataAccessLogic).findClass(anyString());
		doThrow(DummyException.class) //
				.when(errorHandler).classNotFound(anyString());

		// when
		try {
			underTest.create("foo", newFilter() //
					.build());
		} catch (final DummyException e) {
			// then
			verify(dataAccessLogic).findClass(eq("foo"));
			verify(errorHandler).classNotFound(eq("foo"));
			verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);
			throw e;
		}
	}

	@Test(expected = DummyException.class)
	public void createWhenLogicThrowsException() throws Exception {
		// given
		final CMClass targetClass = mock(CMClass.class);
		doReturn(targetClass) //
				.when(dataAccessLogic).findClass(anyString());
		doThrow(DummyException.class) //
				.when(filterLogic).create(any(FilterLogic.Filter.class));

		// when
		try {
			underTest.create("foo", newFilter() //
					.build());
		} catch (final DummyException e) {
			// then
			verify(dataAccessLogic).findClass(eq("foo"));
			verify(filterLogic).create(any(FilterLogic.Filter.class));
			verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);
			throw e;
		}
	}

	@Test
	public void create() throws Exception {
		// given
		final CMClass targetClass = mock(CMClass.class);
		doReturn(targetClass) //
				.when(dataAccessLogic).findClass(anyString());
		final FilterLogic.Filter created = simpleFilter(42L, "THE DESCRIPTION");
		doReturn(created) //
				.when(filterLogic).create(any(FilterLogic.Filter.class));

		// when
		final ResponseSingle<Filter> response = underTest.create("foo",
				newFilter() //
						.withName("the name") //
						.withDescription("the description") //
						.withTarget("the target (not considered)") //
						.withConfiguration("the configuration") //
						.withShared(true) //
						.build());

		// then
		verify(dataAccessLogic).findClass(eq("foo"));
		verify(filterLogic).create(any(FilterLogic.Filter.class));
		verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);

		assertThat(response.getElement(),
				equalTo(newFilter() //
						.withId(42L) //
						.withDescription("THE DESCRIPTION") //
						.build()));
	}

	@Test(expected = DummyException.class)
	public void readAllWhenClassNotFound() throws Exception {
		// given
		doReturn(null) //
				.when(dataAccessLogic).findClass(anyString());
		doThrow(DummyException.class) //
				.when(errorHandler).classNotFound(anyString());

		// when
		try {
			underTest.readAll("foo", 1, 2);
		} catch (final DummyException e) {
			// then
			verify(dataAccessLogic).findClass(eq("foo"));
			verify(errorHandler).classNotFound(eq("foo"));
			verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);
			throw e;
		}
	}

	@Test(expected = DummyException.class)
	public void readAllWhenLogicThrowsException() throws Exception {
		// given
		final CMClass targetClass = mock(CMClass.class);
		doReturn(targetClass) //
				.when(dataAccessLogic).findClass(anyString());
		doThrow(DummyException.class) //
				.when(filterLogic).readForCurrentUser(anyString());

		// when
		try {
			underTest.readAll("foo", 1, 2);
		} catch (final DummyException e) {
			// then
			verify(dataAccessLogic).findClass(eq("foo"));
			verify(filterLogic).readForCurrentUser(eq("foo"));
			verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);
			throw e;
		}
	}

	@Test
	public void readAll() throws Exception {
		// given
		final CMClass targetClass = mock(CMClass.class);
		doReturn(targetClass) //
				.when(dataAccessLogic).findClass(anyString());
		final FilterLogic.Filter first = simpleFilter(1L, "first");
		final FilterLogic.Filter second = simpleFilter(2L, "second");
		final FilterLogic.Filter third = simpleFilter(3L, "third");
		final FilterLogic.Filter fourth = simpleFilter(4L, "fourth");
		final PagedElements<FilterLogic.Filter> filtersFromLogic =
				new PagedElements<>(asList(first, second, third, fourth), 4);
		doReturn(filtersFromLogic) //
				.when(filterLogic).readForCurrentUser(anyString());

		// when
		final ResponseMultiple<Filter> response = underTest.readAll("foo", 2, 1);

		// then
		verify(dataAccessLogic).findClass(eq("foo"));
		verify(filterLogic).readForCurrentUser(eq("foo"));
		verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);

		assertThat(response.getElements(),
				contains(
						newFilter() //
								.withId(2L) //
								.withDescription("second") //
								.build(),
						newFilter() //
								.withId(3L) //
								.withDescription("third") //
								.build()));
		assertThat(response.getMetadata(),
				equalTo(newMetadata() //
						.withTotal(4L) //
						.build()));
	}

	@Test(expected = DummyException.class)
	public void readWhenClassNotFound() throws Exception {
		// given
		doReturn(null) //
				.when(dataAccessLogic).findClass(anyString());
		doThrow(DummyException.class) //
				.when(errorHandler).classNotFound(anyString());

		// when
		try {
			underTest.read("foo", 42L);
		} catch (final DummyException e) {
			// then
			verify(dataAccessLogic).findClass(eq("foo"));
			verify(errorHandler).classNotFound(eq("foo"));
			verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);
			throw e;
		}
	}

	@Test(expected = DummyException.class)
	public void readWhenFilterNotFound() throws Exception {
		// given
		final CMClass targetClass = mock(CMClass.class);
		doReturn(targetClass) //
				.when(dataAccessLogic).findClass(anyString());
		doReturn(empty()) //
				.when(filterLogic).read(any(FilterLogic.Filter.class));
		doThrow(DummyException.class) //
				.when(errorHandler).filterNotFound(anyLong());

		// when
		try {
			underTest.read("foo", 42L);
		} catch (final DummyException e) {
			// then
			final ArgumentCaptor<FilterLogic.Filter> captor = ArgumentCaptor.forClass(FilterLogic.Filter.class);
			verify(dataAccessLogic).findClass(eq("foo"));
			verify(filterLogic).read(captor.capture());
			verify(errorHandler).filterNotFound(eq(42L));
			verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);
			assertThat(captor.getValue().getId(), equalTo(42L));
			throw e;
		}
	}

	@Test(expected = DummyException.class)
	public void readWhenLogicThrowsException() throws Exception {
		// given
		final CMClass targetClass = mock(CMClass.class);
		doReturn(targetClass) //
				.when(dataAccessLogic).findClass(anyString());
		doReturn(of(simpleFilter(1L, "the description"))).doThrow(DummyException.class) //
				.when(filterLogic).read(any(FilterLogic.Filter.class));

		// when
		try {
			underTest.read("foo", 42L);
		} catch (final DummyException e) {
			// then
			final ArgumentCaptor<FilterLogic.Filter> captor = ArgumentCaptor.forClass(FilterLogic.Filter.class);
			verify(dataAccessLogic).findClass(eq("foo"));
			verify(filterLogic, times(2)).read(captor.capture());
			verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);
			assertThat(captor.getAllValues().get(0).getId(), equalTo(42L));
			assertThat(captor.getAllValues().get(1).getId(), equalTo(42L));
			throw e;
		}
	}

	@Test
	public void read() throws Exception {
		// given
		final CMClass targetClass = mock(CMClass.class);
		doReturn(targetClass) //
				.when(dataAccessLogic).findClass(anyString());
		doReturn(of(new FilterLogic.Filter() {

			@Override
			public Long getId() {
				return 1L;
			}

			@Override
			public String getName() {
				return "the name";
			}

			@Override
			public String getDescription() {
				return "the description";
			}

			@Override
			public String getClassName() {
				return "the target";
			}

			@Override
			public String getConfiguration() {
				return "the configuration";
			}

			@Override
			public boolean isShared() {
				return true;
			}

		})) //
				.when(filterLogic).read(any(FilterLogic.Filter.class));

		// when
		final ResponseSingle<Filter> response = underTest.read("foo", 42L);

		// then
		final ArgumentCaptor<FilterLogic.Filter> captor = ArgumentCaptor.forClass(FilterLogic.Filter.class);
		verify(dataAccessLogic).findClass(eq("foo"));
		verify(filterLogic, times(2)).read(captor.capture());
		verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);
		assertThat(captor.getAllValues().get(0).getId(), equalTo(42L));
		assertThat(captor.getAllValues().get(1).getId(), equalTo(42L));
		assertThat(response.getElement(),
				equalTo(newFilter() //
						.withId(1L) //
						.withName("the name") //
						.withDescription("the description") //
						.withTarget("the target") //
						.withConfiguration("the configuration") //
						.withShared(true) //
						.build()));
		assertThat(response.getMetadata(), nullValue());
	}

	@Test(expected = DummyException.class)
	public void updateWhenClassNotFound() throws Exception {
		// given
		doReturn(null) //
				.when(dataAccessLogic).findClass(anyString());
		doThrow(DummyException.class) //
				.when(errorHandler).classNotFound(anyString());

		// when
		try {
			underTest.update("foo", 42L, newFilter() //
					.build());
		} catch (final DummyException e) {
			// then
			verify(dataAccessLogic).findClass(eq("foo"));
			verify(errorHandler).classNotFound(eq("foo"));
			verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);
			throw e;
		}
	}

	@Test(expected = DummyException.class)
	public void updateWhenFilterNotFound() throws Exception {
		// given
		final CMClass targetClass = mock(CMClass.class);
		doReturn(targetClass) //
				.when(dataAccessLogic).findClass(anyString());
		doReturn(empty()) //
				.when(filterLogic).read(any(FilterLogic.Filter.class));
		doThrow(DummyException.class) //
				.when(errorHandler).filterNotFound(anyLong());

		// when
		try {
			underTest.update("foo", 42L, newFilter() //
					.build());
		} catch (final DummyException e) {
			// then
			final ArgumentCaptor<FilterLogic.Filter> captor = ArgumentCaptor.forClass(FilterLogic.Filter.class);
			verify(dataAccessLogic).findClass(eq("foo"));
			verify(filterLogic).read(captor.capture());
			verify(errorHandler).filterNotFound(eq(42L));
			verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);
			assertThat(captor.getValue().getId(), equalTo(42L));
			throw e;
		}
	}

	@Test(expected = DummyException.class)
	public void updateWhenLogicThrowsException() throws Exception {
		// given
		final CMClass targetClass = mock(CMClass.class);
		doReturn(targetClass) //
				.when(dataAccessLogic).findClass(anyString());
		doReturn(of(simpleFilter(1L, "the description"))) //
				.when(filterLogic).read(any(FilterLogic.Filter.class));
		doThrow(DummyException.class) //
				.when(filterLogic).update(any(FilterLogic.Filter.class));

		// when
		try {
			underTest.update("foo", 42L,
					newFilter() //
							.withId(24L) //
							.withName("the name") //
							.withDescription("the description") //
							.withTarget("the target (not considered)") //
							.withConfiguration("the configuration") //
							.withShared(true) //
							.build());
		} catch (final DummyException e) {
			// then
			final ArgumentCaptor<FilterLogic.Filter> captor = ArgumentCaptor.forClass(FilterLogic.Filter.class);
			verify(dataAccessLogic).findClass(eq("foo"));
			verify(filterLogic).read(captor.capture());
			verify(filterLogic).update(captor.capture());
			verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);
			assertThat(captor.getAllValues().get(0).getId(), equalTo(42L));
			assertThat(captor.getAllValues().get(1).getId(), equalTo(42L));
			throw e;
		}
	}

	@Test
	public void update() throws Exception {
		// given
		final CMClass targetClass = mock(CMClass.class);
		doReturn(targetClass) //
				.when(dataAccessLogic).findClass(anyString());
		doReturn(of(simpleFilter(1L, "the description"))) //
				.when(filterLogic).read(any(FilterLogic.Filter.class));

		// when
		underTest.update("foo", 42L,
				newFilter() //
						.withId(24L) //
						.withName("the name") //
						.withDescription("the description") //
						.withTarget("the target (not considered)") //
						.withConfiguration("the configuration") //
						.withShared(true) //
						.build());

		// then
		final ArgumentCaptor<FilterLogic.Filter> captor = ArgumentCaptor.forClass(FilterLogic.Filter.class);
		verify(dataAccessLogic).findClass(eq("foo"));
		verify(filterLogic).read(captor.capture());
		verify(filterLogic).update(captor.capture());
		verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);
		assertThat(captor.getAllValues().get(0).getId(), equalTo(42L));
		assertThat(captor.getAllValues().get(1).getId(), equalTo(42L));
		assertThat(captor.getAllValues().get(1).getName(), equalTo("the name"));
		assertThat(captor.getAllValues().get(1).getDescription(), equalTo("the description"));
		assertThat(captor.getAllValues().get(1).getClassName(), equalTo("foo"));
		assertThat(captor.getAllValues().get(1).getConfiguration(), equalTo("the configuration"));
		assertThat(captor.getAllValues().get(1).isShared(), equalTo(true));
	}

	@Test(expected = DummyException.class)
	public void deleteWhenClassNotFound() throws Exception {
		// given
		doReturn(null) //
				.when(dataAccessLogic).findClass(anyString());
		doThrow(DummyException.class) //
				.when(errorHandler).classNotFound(anyString());

		// when
		try {
			underTest.delete("foo", 42L);
		} catch (final DummyException e) {
			// then
			verify(dataAccessLogic).findClass(eq("foo"));
			verify(errorHandler).classNotFound(eq("foo"));
			verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);
			throw e;
		}
	}

	@Test(expected = DummyException.class)
	public void deleteWhenFilterNotFound() throws Exception {
		// given
		final CMClass targetClass = mock(CMClass.class);
		doReturn(targetClass) //
				.when(dataAccessLogic).findClass(anyString());
		doReturn(empty()) //
				.when(filterLogic).read(any(FilterLogic.Filter.class));
		doThrow(DummyException.class) //
				.when(errorHandler).filterNotFound(anyLong());

		// when
		try {
			underTest.delete("foo", 42L);
		} catch (final DummyException e) {
			// then
			final ArgumentCaptor<FilterLogic.Filter> captor = ArgumentCaptor.forClass(FilterLogic.Filter.class);
			verify(dataAccessLogic).findClass(eq("foo"));
			verify(filterLogic).read(captor.capture());
			verify(errorHandler).filterNotFound(eq(42L));
			verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);
			assertThat(captor.getValue().getId(), equalTo(42L));
			throw e;
		}
	}

	@Test(expected = DummyException.class)
	public void deleteWhenLogicThrowsException() throws Exception {
		// given
		final CMClass targetClass = mock(CMClass.class);
		doReturn(targetClass) //
				.when(dataAccessLogic).findClass(anyString());
		doReturn(of(simpleFilter(1L, "the description"))) //
				.when(filterLogic).read(any(FilterLogic.Filter.class));
		doThrow(DummyException.class) //
				.when(filterLogic).delete(any(FilterLogic.Filter.class));

		// when
		try {
			underTest.delete("foo", 42L);
		} catch (final DummyException e) {
			// then
			final ArgumentCaptor<FilterLogic.Filter> captor = ArgumentCaptor.forClass(FilterLogic.Filter.class);
			verify(dataAccessLogic).findClass(eq("foo"));
			verify(filterLogic).read(captor.capture());
			verify(filterLogic).delete(captor.capture());
			verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);
			assertThat(captor.getAllValues().get(0).getId(), equalTo(42L));
			assertThat(captor.getAllValues().get(1).getId(), equalTo(42L));
			throw e;
		}
	}

	@Test
	public void delete() throws Exception {
		// given
		final CMClass targetClass = mock(CMClass.class);
		doReturn(targetClass) //
				.when(dataAccessLogic).findClass(anyString());
		doReturn(of(simpleFilter(1L, "the description"))) //
				.when(filterLogic).read(any(FilterLogic.Filter.class));

		// when
		underTest.delete("foo", 42L);

		// then
		final ArgumentCaptor<FilterLogic.Filter> captor = ArgumentCaptor.forClass(FilterLogic.Filter.class);
		verify(dataAccessLogic).findClass(eq("foo"));
		verify(filterLogic).read(captor.capture());
		verify(filterLogic).delete(captor.capture());
		verifyNoMoreInteractions(errorHandler, filterLogic, dataAccessLogic);
		assertThat(captor.getAllValues().get(0).getId(), equalTo(42L));
		assertThat(captor.getAllValues().get(1).getId(), equalTo(42L));
	}

}

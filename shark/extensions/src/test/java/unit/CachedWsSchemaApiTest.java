package unit;

import static java.util.Arrays.asList;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.anyInt;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import org.cmdbuild.services.soap.Lookup;
import org.cmdbuild.services.soap.Private;
import org.cmdbuild.workflow.api.CachedWsSchemaApi;
import org.cmdbuild.workflow.api.SchemaApi;
import org.cmdbuild.workflow.api.SchemaApi.ClassInfo;
import org.cmdbuild.workflow.type.LookupType;
import org.junit.Before;
import org.junit.Test;

public class CachedWsSchemaApiTest {

	private static final String LOOKUP_TYPE = "T1";

	private SchemaApi delegate;
	private Private proxy;
	private CachedWsSchemaApi underTest;

	@Before
	public void setUp() throws Exception {
		delegate = mock(SchemaApi.class);
		proxy = mock(Private.class);
		underTest = new CachedWsSchemaApi(delegate, proxy);
	}

	@Test
	public void classInformationAreRetrievedByNameAndCached() throws Exception {
		// given
		final ClassInfo foo = new ClassInfo("foo", 1L);
		final ClassInfo bar = new ClassInfo("bar", 2L);
		doReturn(foo).doReturn(bar) //
				.when(delegate).findClass(anyString());

		// when
		final ClassInfo firstFoo = underTest.findClass("foo");
		final ClassInfo secondFoo = underTest.findClass("foo");
		final ClassInfo firstBar = underTest.findClass("bar");

		// then
		verify(delegate).findClass(eq("foo"));
		verify(delegate).findClass(eq("bar"));
		verifyNoMoreInteractions(delegate, proxy);

		assertThat(firstFoo, equalTo(foo));
		assertThat(secondFoo, equalTo(foo));
		assertThat(firstBar, equalTo(bar));
	}

	@Test
	public void classInformationAreRetrievedByIdAndCached() throws Exception {
		// given
		final ClassInfo foo = new ClassInfo("foo", 1L);
		final ClassInfo bar = new ClassInfo("bar", 2L);
		doReturn(foo).doReturn(bar) //
				.when(delegate).findClass(anyInt());

		// when
		final ClassInfo firstFoo = underTest.findClass(1);
		final ClassInfo secondFoo = underTest.findClass(1);
		final ClassInfo firstBar = underTest.findClass(2);

		// then
		verify(delegate).findClass(eq(1));
		verify(delegate).findClass(eq(2));
		verifyNoMoreInteractions(delegate, proxy);

		assertThat(firstFoo, equalTo(foo));
		assertThat(secondFoo, equalTo(foo));
		assertThat(firstBar, equalTo(bar));
	}

	@Test
	public void lookupInformationAreRetrievedByTypeAndCached() throws Exception {
		when(proxy.getLookupList(LOOKUP_TYPE, null, false)).thenReturn(asList(wsLookup(LOOKUP_TYPE, 1, "c1", "d1"), //
				wsLookup(LOOKUP_TYPE, 2, "c2", "d2") //
		));

		assertThat(underTest.selectLookupByCode(LOOKUP_TYPE, "c2"), is(lookup(LOOKUP_TYPE, 2, "c2", "d2")));

		verify(proxy, times(1)).getLookupList(LOOKUP_TYPE, null, false);

		assertThat(underTest.selectLookupByCode(LOOKUP_TYPE, "c1"), is(lookup(LOOKUP_TYPE, 1, "c1", "d1")));
		assertThat(underTest.selectLookupByDescription(LOOKUP_TYPE, "d2"), is(lookup(LOOKUP_TYPE, 2, "c2", "d2")));

		verify(proxy, times(1)).getLookupList(LOOKUP_TYPE, null, false);
		verifyNoMoreInteractions(delegate, proxy);
	}

	@Test
	public void lookupInformationByTypeAreRetrievedOnCacheMiss() throws Exception {
		when(proxy.getLookupList(LOOKUP_TYPE, null, false)).thenReturn(asList(wsLookup(LOOKUP_TYPE, 1, "c1", "d1") //
		)).thenReturn(asList(wsLookup(LOOKUP_TYPE, 1, "c1", "d1"), //
				wsLookup(LOOKUP_TYPE, 2, "c2", "d2") //
		));

		assertThat(underTest.selectLookupByCode(LOOKUP_TYPE, "c1"), is(lookup(LOOKUP_TYPE, 1, "c1", "d1")));

		verify(proxy, times(1)).getLookupList(LOOKUP_TYPE, null, false);

		assertThat(underTest.selectLookupByCode(LOOKUP_TYPE, "c2"), is(lookup(LOOKUP_TYPE, 2, "c2", "d2")));

		verify(proxy, times(2)).getLookupList(LOOKUP_TYPE, null, false);
		verifyNoMoreInteractions(delegate, proxy);
	}

	@Test
	public void lookupInformationAreRetrievedByIdAndCached() throws Exception {
		// given
		final LookupType one = lookup("foo", 1, "bar", "baz");
		final LookupType two = lookup("oof", 2, "rab", "zab");
		doReturn(one).doReturn(two) //
				.when(delegate).selectLookupById(anyInt());

		// when
		final LookupType firstOne = underTest.selectLookupById(1);
		final LookupType secondOne = underTest.selectLookupById(1);
		final LookupType firstTwo = underTest.selectLookupById(2);

		// then
		verify(delegate).selectLookupById(eq(1));
		verify(delegate).selectLookupById(eq(2));
		verifyNoMoreInteractions(delegate, proxy);

		assertThat(firstOne, equalTo(one));
		assertThat(secondOne, equalTo(one));
		assertThat(firstTwo, equalTo(two));
	}

	@Test
	public void lookupInformationAreRetrievedByCodeAndThenCached() throws Exception {
		// given
		doReturn(asList(wsLookup("foo", 1, "bar", "baz"), //
				wsLookup("oof", 2, "rab", "zab") //
		)).when(proxy).getLookupList("foo", null, false);

		// when
		final LookupType first = underTest.selectLookupByCode("foo", "bar");
		final LookupType second = underTest.selectLookupByCode("foo", "rab");

		// then
		verify(proxy).getLookupList("foo", null, false);
		verifyNoMoreInteractions(delegate);

		assertThat(first, equalTo(lookup("foo", 1, "bar", "baz")));
		assertThat(second, equalTo(lookup("oof", 2, "rab", "zab")));
	}

	private Lookup wsLookup(final String type, final int id, final String code, final String description) {
		final Lookup lookup = new Lookup();
		lookup.setType(type);
		lookup.setId(id);
		lookup.setCode(code);
		lookup.setDescription(description);
		return lookup;
	}

	private LookupType lookup(final String type, final int id, final String code, final String description) {
		final LookupType lookup = new LookupType();
		lookup.setType(type);
		lookup.setId(id);
		lookup.setCode(code);
		lookup.setDescription(description);
		return lookup;
	}
}

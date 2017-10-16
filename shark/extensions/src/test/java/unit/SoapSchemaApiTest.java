package unit;

import static java.util.Arrays.asList;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.anyBoolean;
import static org.mockito.Matchers.anyInt;
import static org.mockito.Matchers.anyLong;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import org.cmdbuild.services.soap.ClassSchema;
import org.cmdbuild.services.soap.Lookup;
import org.cmdbuild.services.soap.Private;
import org.cmdbuild.workflow.api.SchemaApi.ClassInfo;
import org.cmdbuild.workflow.api.SoapSchemaApi;
import org.cmdbuild.workflow.type.LookupType;
import org.junit.Before;
import org.junit.Test;

public class SoapSchemaApiTest {

	private static final String LOOKUP_TYPE = "T1";

	private Private delegate;
	private SoapSchemaApi underTest;

	@Before
	public void setUp() throws Exception {
		delegate = mock(Private.class);
		underTest = new SoapSchemaApi(delegate);
	}

	@Test
	public void classInformationRetrievedByName() throws Exception {
		// given
		final ClassSchema schema = new ClassSchema();
		schema.setId(42L);
		schema.setName("foo");
		doReturn(schema) //
				.when(delegate).getClassSchemaByName(anyString(), anyBoolean());

		// when
		final ClassInfo output = underTest.findClass("foo");

		// then
		verify(delegate).getClassSchemaByName(eq("foo"), eq(false));
		verifyNoMoreInteractions(delegate);

		assertThat(output, equalTo(new ClassInfo("foo", 42L)));
	}

	@Test
	public void classInformationRetrievedById() throws Exception {
		// given
		final ClassSchema schema = new ClassSchema();
		schema.setId(42L);
		schema.setName("foo");
		doReturn(schema) //
				.when(delegate).getClassSchemaById(anyLong(), anyBoolean());

		// when
		final ClassInfo output = underTest.findClass(42);

		// then
		verify(delegate).getClassSchemaById(eq(42L), eq(false));
		verifyNoMoreInteractions(delegate);

		assertThat(output, equalTo(new ClassInfo("foo", 42L)));
	}

	@Test
	public void lookupInformationAreRetrievedByTypeAndCached() throws Exception {
		when(delegate.getLookupList(LOOKUP_TYPE, null, false)).thenReturn(asList(wsLookup(LOOKUP_TYPE, 1, "c1", "d1"), //
				wsLookup(LOOKUP_TYPE, 2, "c2", "d2") //
		));

		assertThat(underTest.selectLookupByCode(LOOKUP_TYPE, "c2"), is(lookup(LOOKUP_TYPE, 2, "c2", "d2")));

		verify(delegate, times(1)).getLookupList(LOOKUP_TYPE, null, false);

		assertThat(underTest.selectLookupByCode(LOOKUP_TYPE, "c1"), is(lookup(LOOKUP_TYPE, 1, "c1", "d1")));
		assertThat(underTest.selectLookupByDescription(LOOKUP_TYPE, "d2"), is(lookup(LOOKUP_TYPE, 2, "c2", "d2")));

		verify(delegate, times(1)).getLookupList(LOOKUP_TYPE, null, false);
		verifyNoMoreInteractions(delegate);
	}

	@Test
	public void lookupInformationByTypeAreRetrievedOnCacheMiss() throws Exception {
		when(delegate.getLookupList(LOOKUP_TYPE, null, false)).thenReturn(asList(wsLookup(LOOKUP_TYPE, 1, "c1", "d1") //
		)).thenReturn(asList(wsLookup(LOOKUP_TYPE, 1, "c1", "d1"), //
				wsLookup(LOOKUP_TYPE, 2, "c2", "d2") //
		));

		assertThat(underTest.selectLookupByCode(LOOKUP_TYPE, "c1"), is(lookup(LOOKUP_TYPE, 1, "c1", "d1")));

		verify(delegate, times(1)).getLookupList(LOOKUP_TYPE, null, false);

		assertThat(underTest.selectLookupByCode(LOOKUP_TYPE, "c2"), is(lookup(LOOKUP_TYPE, 2, "c2", "d2")));

		verify(delegate, times(2)).getLookupList(LOOKUP_TYPE, null, false);
		verifyNoMoreInteractions(delegate);
	}

	@Test
	public void lookupInformationAreRetrievedById() throws Exception {
		// given
		doReturn(wsLookup("foo", 123, "bar", "baz")) //
				.when(delegate).getLookupById(anyInt());

		// when
		final LookupType output = underTest.selectLookupById(42);

		// then
		verify(delegate).getLookupById(eq(42));
		verifyNoMoreInteractions(delegate);

		assertThat(output, equalTo(lookup("foo", 123, "bar", "baz")));
	}

	@Test
	public void lookupInformationAreRetrievedByCodeAndThenCached() throws Exception {
		// given
		doReturn(asList(wsLookup("foo", 1, "bar", "baz"), //
				wsLookup("oof", 2, "rab", "zab") //
		)).when(delegate).getLookupList("foo", null, false);

		// when
		final LookupType first = underTest.selectLookupByCode("foo", "bar");
		final LookupType second = underTest.selectLookupByCode("foo", "rab");

		// then
		verify(delegate).getLookupList("foo", null, false);
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

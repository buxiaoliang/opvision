package integration.rest;

import static java.util.Arrays.asList;
import static org.cmdbuild.service.rest.test.HttpClientUtils.contentOf;
import static org.cmdbuild.service.rest.test.HttpClientUtils.statusCodeOf;
import static org.cmdbuild.service.rest.test.ServerResource.randomPort;
import static org.cmdbuild.service.rest.v2.constants.Serialization.AREA;
import static org.cmdbuild.service.rest.v2.constants.Serialization.ATTRIBUTE;
import static org.cmdbuild.service.rest.v2.constants.Serialization.DETAILED;
import static org.cmdbuild.service.rest.v2.constants.Serialization.LIMIT;
import static org.cmdbuild.service.rest.v2.constants.Serialization.START;
import static org.cmdbuild.service.rest.v2.model.Models.newAttribute2;
import static org.cmdbuild.service.rest.v2.model.Models.newGeometry;
import static org.cmdbuild.service.rest.v2.model.Models.newMetadata;
import static org.cmdbuild.service.rest.v2.model.Models.newResponseMultiple;
import static org.cmdbuild.service.rest.v2.model.Models.newResponseSingle;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.anyBoolean;
import static org.mockito.Matchers.anyInt;
import static org.mockito.Matchers.anyLong;
import static org.mockito.Matchers.anySetOf;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.HttpClientBuilder;
import org.cmdbuild.common.collect.ChainablePutMap;
import org.cmdbuild.service.rest.test.JsonSupport;
import org.cmdbuild.service.rest.test.ServerResource;
import org.cmdbuild.service.rest.v2.Geometries;
import org.cmdbuild.service.rest.v2.model.Attribute2;
import org.cmdbuild.service.rest.v2.model.Geometry;
import org.cmdbuild.service.rest.v2.model.ResponseMultiple;
import org.cmdbuild.service.rest.v2.model.ResponseSingle;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Test;
import org.mockito.ArgumentCaptor;

public class GeometriesTest {

	@ClassRule
	public static ServerResource<Geometries> server = ServerResource.newInstance(Geometries.class) //
			.withPortRange(randomPort()) //
			.build();

	private static JsonSupport json = new JsonSupport();

	private Geometries service;
	private HttpClient httpclient;

	@Before
	public void setUp() throws Exception {
		server.service(service = mock(Geometries.class));
		httpclient = HttpClientBuilder.create().build();
	}

	@Test
	public void getAllAttributes() throws Exception {
		// given
		final ResponseMultiple<Attribute2> expectedResponse = newResponseMultiple(Attribute2.class) //
				.withElements(asList( //
						newAttribute2() //
								.withId("bar") //
								.withName("Bar") //
								.withDescription("this is Bar") //
								.withType("the type of Bar") //
								.withSubtype("the subtype of Bar") //
								.withIndex(1) //
								.withMetadata(ChainablePutMap.of(new HashMap<String, Object>()) //
										.chainablePut("a", "A") //
										.chainablePut("b", 1)) //
								.build(), //
						newAttribute2() //
								.withId("baz") //
								.withName("Baz") //
								.withDescription("this is Baz") //
								.withType("the type of Baz") //
								.withSubtype("the subtype of Baz") //
								.withIndex(2) //
								.withMetadata(ChainablePutMap.of(new HashMap<String, Object>()) //
										.chainablePut("c", "C") //
										.chainablePut("d", 2)) //
								.build())) //
				.withMetadata(newMetadata() //
						.withTotal(2L) //
						.build()) //
				.build();
		when(service.readAllAttributes(anyString(), anyInt(), anyInt(), anyBoolean())) //
				.thenReturn(expectedResponse);

		// when
		final HttpGet get = new HttpGet(new URIBuilder(server.resource("classes/foo/geoattributes/")) //
				.addParameter(LIMIT, "123") //
				.addParameter(START, "456") //
				.addParameter(DETAILED, "true") //
				.build());
		final HttpResponse response = httpclient.execute(get);

		// then
		assertThat(statusCodeOf(response), equalTo(200));
		assertThat(json.from(contentOf(response)), equalTo(json.from(expectedResponse)));

		verify(service).readAllAttributes(eq("foo"), eq(456), eq(123), eq(true));
	}

	@Test
	public void getAttribute() throws Exception {
		// given
		final ResponseSingle<Attribute2> expectedResponse = newResponseSingle(Attribute2.class) //
				.withElement(newAttribute2() //
						.withId("baz") //
						.withName("Baz") //
						.withDescription("this is Baz") //
						.withType("the type of Baz") //
						.withSubtype("the subtype of Baz") //
						.withIndex(1) //
						.withMetadata(ChainablePutMap.of(new HashMap<String, Object>()) //
								.chainablePut("a", "A") //
								.chainablePut("b", 1)) //
						.build()) //
				.withMetadata(newMetadata() //
						// nothing to add, just needed for simplify assertions
						.build()) //
				.build();
		when(service.readAttribute(anyString(), anyString())) //
				.thenReturn(expectedResponse);

		// when
		final HttpGet get = new HttpGet(new URIBuilder(server.resource("classes/foo/geoattributes/bar/")) //
				.build());
		final HttpResponse response = httpclient.execute(get);

		// then
		assertThat(statusCodeOf(response), equalTo(200));
		assertThat(json.from(contentOf(response)), equalTo(json.from(expectedResponse)));

		verify(service).readAttribute(eq("foo"), eq("bar"));
	}

	@Test
	public void getAllGeometries() throws Exception {
		// given
		final ResponseMultiple<Geometry> expectedResponse = newResponseMultiple(Geometry.class) //
				.withElements(asList( //
						newGeometry() //
								.withId(1L) //
								.build(), //
						newGeometry() //
								.withId(2L) //
								.build())) //
				.withMetadata(newMetadata() //
						.withTotal(2L) //
						.build()) //
				.build();
		when(service.readAllGeometries(anyString(), anySetOf(String.class), anySetOf(String.class), anyInt(), anyInt(),
				anyBoolean())) //
						.thenReturn(expectedResponse);

		// when
		final HttpGet get = new HttpGet(new URIBuilder(server.resource("classes/foo/geocards/")) //
				.addParameter(ATTRIBUTE, "bar") //
				.addParameter(ATTRIBUTE, "BAR") //
				.addParameter(AREA, "baz") //
				.addParameter(AREA, "BAZ") //
				.addParameter(LIMIT, "123") //
				.addParameter(START, "456") //
				.addParameter(DETAILED, "true") //
				.build());
		final HttpResponse response = httpclient.execute(get);

		// then
		assertThat(statusCodeOf(response), equalTo(200));
		assertThat(json.from(contentOf(response)), equalTo(json.from(expectedResponse)));

		final ArgumentCaptor<Set> attributes = ArgumentCaptor.forClass(Set.class);
		final ArgumentCaptor<Set> areas = ArgumentCaptor.forClass(Set.class);
		verify(service).readAllGeometries(eq("foo"), attributes.capture(), areas.capture(), eq(456), eq(123), eq(true));
		assertThat(attributes.getValue(), equalTo(new HashSet(asList("bar", "BAR"))));
		assertThat(areas.getValue(), equalTo(new HashSet(asList("baz", "BAZ"))));
	}

	@Test
	public void getGeometry() throws Exception {
		// given
		final ResponseSingle<Geometry> expectedResponse = newResponseSingle(Geometry.class) //
				.withElement(newGeometry() //
						.withId(1L) //
						.build()) //
				.withMetadata(newMetadata() //
						// nothing to add, just needed for simplify assertions
						.build()) //
				.build();
		when(service.readGeometry(anyString(), anyLong())) //
				.thenReturn(expectedResponse);

		// when
		final HttpGet get = new HttpGet(new URIBuilder(server.resource("classes/foo/geocards/42/")) //
				.build());
		final HttpResponse response = httpclient.execute(get);

		// then
		assertThat(statusCodeOf(response), equalTo(200));
		assertThat(json.from(contentOf(response)), equalTo(json.from(expectedResponse)));

		verify(service).readGeometry(eq("foo"), eq(42L));
	}

}

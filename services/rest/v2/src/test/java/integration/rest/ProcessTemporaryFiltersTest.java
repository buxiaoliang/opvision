package integration.rest;

import static java.util.Arrays.asList;
import static org.apache.http.entity.ContentType.APPLICATION_JSON;
import static org.cmdbuild.service.rest.test.HttpClientUtils.contentOf;
import static org.cmdbuild.service.rest.test.HttpClientUtils.statusCodeOf;
import static org.cmdbuild.service.rest.test.ServerResource.randomPort;
import static org.cmdbuild.service.rest.v2.constants.Serialization.LIMIT;
import static org.cmdbuild.service.rest.v2.constants.Serialization.START;
import static org.cmdbuild.service.rest.v2.model.Models.newFilter;
import static org.cmdbuild.service.rest.v2.model.Models.newMetadata;
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
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClientBuilder;
import org.cmdbuild.service.rest.test.JsonSupport;
import org.cmdbuild.service.rest.test.ServerResource;
import org.cmdbuild.service.rest.v2.ProcessTemporaryFilters;
import org.cmdbuild.service.rest.v2.model.Filter;
import org.cmdbuild.service.rest.v2.model.ResponseMultiple;
import org.cmdbuild.service.rest.v2.model.ResponseSingle;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Test;
import org.mockito.ArgumentCaptor;

public class ProcessTemporaryFiltersTest {

	@ClassRule
	public static ServerResource<ProcessTemporaryFilters> server = ServerResource.newInstance(ProcessTemporaryFilters.class) //
			.withPortRange(randomPort()) //
			.build();

	private static JsonSupport json = new JsonSupport();

	private ProcessTemporaryFilters service;
	private HttpClient httpclient;

	@Before
	public void setUp() throws Exception {
		server.service(service = mock(ProcessTemporaryFilters.class));
		httpclient = HttpClientBuilder.create().build();
	}

	@Test
	public void create() throws Exception {
		// given
		final ResponseSingle<Filter> expectedResponse = newResponseSingle(Filter.class) //
				.withElement(newFilter() //
						// TODO
						.build()) //
				.withMetadata(newMetadata() //
						// nothing to add, just needed for simplify assertions
						.build()) //
				.build();
		doReturn(expectedResponse) //
				.when(service).create(anyString(), any(Filter.class));

		// when
		final HttpPost request = new HttpPost(server.resource("processes/foo/temporary_filters/"));
		request.setEntity(new StringEntity("{}", APPLICATION_JSON));
		final HttpResponse response = httpclient.execute(request);

		// then
		assertThat(statusCodeOf(response), equalTo(200));
		assertThat(json.from(contentOf(response)), equalTo(json.from(expectedResponse)));

		final ArgumentCaptor<Filter> captor = ArgumentCaptor.forClass(Filter.class);
		verify(service).create(eq("foo"), captor.capture());

		assertThat(captor.getValue(),
				equalTo(newFilter() //
						// TODO
						.build()));
	}

	@Test
	public void readAll() throws Exception {
		// given
		final ResponseMultiple<Filter> expectedResponse = newResponseMultiple(Filter.class) //
				.withElements(asList( //
						newFilter() //
								.withId(1L) //
								.build(), //
						newFilter() //
								.withId(2L) //
								.build())) //
				.withMetadata(newMetadata() //
						.withTotal(2L) //
						.build()) //
				.build();
		when(service.readAll(anyString(), anyInt(), anyInt())) //
				.thenReturn(expectedResponse);

		// when
		final HttpGet request = new HttpGet(new URIBuilder(server.resource("processes/foo/temporary_filters/")) //
				.setParameter(LIMIT, "123") //
				.setParameter(START, "456") //
				.build());
		final HttpResponse response = httpclient.execute(request);

		// then
		assertThat(statusCodeOf(response), equalTo(200));
		assertThat(json.from(contentOf(response)), equalTo(json.from(expectedResponse)));

		verify(service).readAll(eq("foo"), eq(123), eq(456));
	}

	@Test
	public void readSingle() throws Exception {
		// given
		final ResponseSingle<Filter> expectedResponse = newResponseSingle(Filter.class) //
				.withElement(newFilter() //
						.withId(1L) //
						.build()) //
				.withMetadata(newMetadata() //
						// nothing to add, just needed for simplify assertions
						.build()) //
				.build();
		when(service.read(anyString(), anyLong())) //
				.thenReturn(expectedResponse);

		// when
		final HttpGet request = new HttpGet(new URIBuilder(server.resource("processes/foo/temporary_filters/42/")) //
				.setParameter(LIMIT, "123") //
				.setParameter(START, "456") //
				.build());
		final HttpResponse response = httpclient.execute(request);

		// then
		assertThat(statusCodeOf(response), equalTo(200));
		assertThat(json.from(contentOf(response)), equalTo(json.from(expectedResponse)));

		verify(service).read(eq("foo"), eq(42L));
	}

	@Test
	public void update() throws Exception {
		// when
		final HttpPut request = new HttpPut(server.resource("processes/foo/temporary_filters/42/"));
		request.setEntity(new StringEntity("{}", APPLICATION_JSON));
		final HttpResponse response = httpclient.execute(request);

		// then
		assertThat(statusCodeOf(response), equalTo(204));

		final ArgumentCaptor<Filter> captor = ArgumentCaptor.forClass(Filter.class);
		verify(service).update(eq("foo"), eq(42L), captor.capture());

		assertThat(captor.getValue(), equalTo(newFilter() //
				.build()));
	}

	@Test
	public void delete() throws Exception {
		// when
		final HttpDelete request = new HttpDelete(server.resource("processes/foo/temporary_filters/42/"));
		final HttpResponse response = httpclient.execute(request);

		// then
		assertThat(statusCodeOf(response), equalTo(204));

		verify(service).delete(eq("foo"), eq(42L));
	}

}

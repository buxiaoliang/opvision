package unit.cxf;

import static com.google.common.collect.Iterables.get;
import static java.util.Arrays.asList;
import static java.util.Collections.emptyMap;
import static org.cmdbuild.service.rest.v2.model.Models.newAttribute;
import static org.cmdbuild.service.rest.v2.model.Models.newFunction;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;

import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.WebApplicationException;

import org.cmdbuild.common.collect.ChainablePutMap;
import org.cmdbuild.dao.entrytype.attributetype.BooleanAttributeType;
import org.cmdbuild.dao.entrytype.attributetype.CMAttributeType;
import org.cmdbuild.dao.entrytype.attributetype.IntegerAttributeType;
import org.cmdbuild.dao.entrytype.attributetype.TextAttributeType;
import org.cmdbuild.dao.function.CMFunction;
import org.cmdbuild.dao.function.CMFunction.CMFunctionParameter;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.service.rest.v2.cxf.CxfFunctions;
import org.cmdbuild.service.rest.v2.cxf.ErrorHandler;
import org.cmdbuild.service.rest.v2.model.Attribute;
import org.cmdbuild.service.rest.v2.model.Function;
import org.cmdbuild.service.rest.v2.model.ResponseMultiple;
import org.cmdbuild.service.rest.v2.model.ResponseSingle;
import org.junit.Before;
import org.junit.Test;

public class CxfFunctionsTest {

	private ErrorHandler errorHandler;
	private CMDataView dataView;
	private CxfFunctions underTest;

	@Before
	public void setUp() throws Exception {
		errorHandler = mock(ErrorHandler.class);
		dataView = mock(CMDataView.class);
		underTest = new CxfFunctions(errorHandler, dataView);
	}

	@Test(expected = RuntimeException.class)
	public void errorWhenGettingAllFunctions() throws Exception {
		// given
		doThrow(new RuntimeException()) //
				.when(dataView).findAllFunctions();

		// when
		underTest.readAll(null, null, null, false);
	}

	@Test
	public void allFunctionsReturned() throws Exception {
		// given
		final CMFunction _1 = function(1L, ChainablePutMap.of(new HashMap<String, Object>()) //
				.chainablePut("foo", "FOO"));
		final CMFunction _2 = function(2L, ChainablePutMap.of(new HashMap<String, Object>()) //
				.chainablePut("bar", "BAR"));
		final CMFunction _3 = function(3L, ChainablePutMap.of(new HashMap<String, Object>()) //
				.chainablePut("baz", "BAZ"));
		doReturn(asList(_1, _2, _3)) //
				.when(dataView).findAllFunctions();
		doReturn(asList(_1, _2, _3)) //
				.when(dataView).findAllFunctions();

		// when
		final ResponseMultiple<Function> responseWithNoDetails = underTest.readAll(null, null, null, false);

		// then
		assertThat(responseWithNoDetails.getMetadata().getTotal(), equalTo(3L));
		assertThat(responseWithNoDetails.getElements(), hasSize(3));
		assertThat(get(responseWithNoDetails.getElements(), 0),
				equalTo(newFunction() //
						.withId(_1.getId()) //
						.withName(_1.getName()) //
						.withDescription(_1.getName()) //
						.build()));
		assertThat(get(responseWithNoDetails.getElements(), 1).getId(), equalTo(_2.getId()));
		assertThat(get(responseWithNoDetails.getElements(), 2).getId(), equalTo(_3.getId()));

		// when
		final ResponseMultiple<Function> responseWithFullDetails = underTest.readAll(null, null, null, true);

		// then
		assertThat(responseWithFullDetails.getMetadata().getTotal(), equalTo(3L));
		assertThat(responseWithFullDetails.getElements(), hasSize(3));
		assertThat(get(responseWithFullDetails.getElements(), 0),
				equalTo(newFunction() //
						.withId(_1.getId()) //
						.withName(_1.getName()) //
						.withDescription(_1.getName()) //
						.withMetadata(ChainablePutMap.of(new HashMap<String, Object>()) //
								.chainablePut("foo", "FOO")) //
						.build()));
		assertThat(get(responseWithFullDetails.getElements(), 1).getId(), equalTo(_2.getId()));
		assertThat(get(responseWithFullDetails.getElements(), 2).getId(), equalTo(_3.getId()));
	}

	@Test
	public void functionsFilteredByNameReturned() throws Exception {
		// given
		final CMFunction _1 = function(1L);
		final CMFunction _2 = function(2L);
		final CMFunction _3 = function(3L);
		doReturn(asList(_1, _2, _3)) //
				.when(dataView).findAllFunctions();

		// when
		final ResponseMultiple<Function> response = underTest.readAll(null, null,
				"" //
						+ "{" //
						+ "	\"attribute\": {" //
						+ "		\"simple\": {" //
						+ "			\"attribute\": \"name\"," //
						+ "			\"operator\": \"equal\"," //
						+ "			\"value\": [\"2\"]" //
						+ "		}" //
						+ "	}" //
						+ "}",
				false);

		// then
		assertThat(response.getMetadata().getTotal(), equalTo(1L));
		assertThat(response.getElements(), hasSize(1));
		assertThat(get(response.getElements(), 0),
				equalTo(newFunction() //
						.withId(_2.getId()) //
						.withName(_2.getName()) //
						.withDescription(_2.getName()) //
						.build()));
	}

	@Test
	public void functionsReturnedPaged() throws Exception {
		// given
		final CMFunction _1 = function(1L);
		final CMFunction _2 = function(2L);
		final CMFunction _3 = function(3L);
		final CMFunction _4 = function(4L);
		final CMFunction _5 = function(5L);
		doReturn(asList(_1, _2, _3, _4, _5)) //
				.when(dataView).findAllFunctions();

		// when
		final ResponseMultiple<Function> response = underTest.readAll(2, 1, null, false);

		// then
		assertThat(response.getMetadata().getTotal(), equalTo(5L));
		assertThat(response.getElements(), hasSize(2));
		assertThat(get(response.getElements(), 0),
				equalTo(newFunction() //
						.withId(_2.getId()) //
						.withName(_2.getName()) //
						.withDescription(_2.getName()) //
						.build()));
		assertThat(get(response.getElements(), 1).getId(), equalTo(_3.getId()));
	}

	@Test(expected = RuntimeException.class)
	public void errorWhenGettingFunctionDetail() throws Exception {
		// given
		doThrow(new RuntimeException()) //
				.when(dataView).findAllFunctions();

		// when
		underTest.read(1L);
	}

	@Test(expected = WebApplicationException.class)
	public void functionNotFoundWhenGettingFunctionDetails() throws Exception {
		// given
		final CMFunction _1 = function(1L);
		final CMFunction _2 = function(2L);
		final CMFunction _4 = function(4L);
		final CMFunction _5 = function(5L);
		doReturn(asList(_1, _2, _4, _5)) //
				.when(dataView).findAllFunctions();
		doThrow(WebApplicationException.class) //
				.when(errorHandler).functionNotFound(3L);

		// when
		underTest.read(3L);
	}

	@Test
	public void functionDetailsReturned() throws Exception {
		// given
		final CMFunction _1 = function(1L);
		final CMFunction _2 = function(2L,
				ChainablePutMap.of(new HashMap<String, Object>()) //
						.chainablePut("foo", "bar") //
						.chainablePut("bar", "baz"));
		final CMFunction _3 = function(3L);
		doReturn(asList(_1, _2, _3)) //
				.when(dataView).findAllFunctions();

		// when
		final ResponseSingle<Function> response = underTest.read(2L);

		// then
		assertThat(response.getElement(),
				equalTo(newFunction() //
						.withId(_2.getId()) //
						.withName(_2.getName()) //
						.withDescription(_2.getName()) //
						.withMetadata(ChainablePutMap.of(new HashMap<String, Object>()) //
								.chainablePut("foo", "bar") //
								.chainablePut("bar", "baz")) //
						.build()));
	}

	@Test(expected = RuntimeException.class)
	public void errorWhenGettingInputParameters() throws Exception {
		// given
		doThrow(new RuntimeException()) //
				.when(dataView).findAllFunctions();

		// when
		underTest.readInputParameters(1L, 2, 3);
	}

	@Test(expected = WebApplicationException.class)
	public void functionNotFoundWhenGettingInputParameters() throws Exception {
		// given
		final CMFunction _1 = function(1L);
		final CMFunction _2 = function(2L);
		final CMFunction _4 = function(4L);
		final CMFunction _5 = function(5L);
		doReturn(asList(_1, _2, _4, _5)) //
				.when(dataView).findAllFunctions();
		doThrow(WebApplicationException.class) //
				.when(errorHandler).functionNotFound(3L);

		// when
		underTest.readInputParameters(3L, 123, 456);
	}

	@Test
	public void allInputParametersReturned() throws Exception {
		// given
		final CMFunction _1 = function(1L);
		final CMFunction _2 = function(2L);
		final CMFunction _3 = function(3L);
		doReturn(asList(_1, _2, _3)) //
				.when(dataView).findAllFunctions();
		final CMFunctionParameter foo = parameter("foo", new TextAttributeType());
		final CMFunctionParameter bar = parameter("bar", new IntegerAttributeType());
		final CMFunctionParameter baz = parameter("baz", new BooleanAttributeType());
		doReturn(asList(foo, bar, baz)) //
				.when(_2).getInputParameters();

		// when
		final ResponseMultiple<Attribute> response = underTest.readInputParameters(2L, null, null);

		// then
		assertThat(response.getMetadata().getTotal(), equalTo(3L));
		assertThat(response.getElements(), hasSize(3));
		assertThat(get(response.getElements(), 0),
				equalTo(newAttribute() //
						.withId(foo.getName()) //
						.withName(foo.getName()) //
						.withDescription(foo.getName()) //
						.withType("text") //
						.thatIsActive(true) //
						.withIndex(0L) //
						.build()));
		assertThat(get(response.getElements(), 1).getId(), equalTo("bar"));
		assertThat(get(response.getElements(), 2).getId(), equalTo("baz"));
	}

	@Test
	public void inputParametersReturnedPaged() throws Exception {
		// given
		final CMFunction _1 = function(1L);
		final CMFunction _2 = function(2L);
		final CMFunction _3 = function(3L);
		doReturn(asList(_1, _2, _3)) //
				.when(dataView).findAllFunctions();
		final CMFunctionParameter foo = parameter("foo", new TextAttributeType());
		final CMFunctionParameter bar = parameter("bar", new IntegerAttributeType());
		final CMFunctionParameter baz = parameter("baz", new BooleanAttributeType());
		doReturn(asList(foo, bar, baz)) //
				.when(_2).getInputParameters();

		// when
		final ResponseMultiple<Attribute> response = underTest.readInputParameters(2L, 1, 2);

		// then
		assertThat(response.getMetadata().getTotal(), equalTo(3L));
		assertThat(response.getElements(), hasSize(1));
		assertThat(get(response.getElements(), 0),
				equalTo(newAttribute() //
						.withId(baz.getName()) //
						.withName(baz.getName()) //
						.withDescription(baz.getName()) //
						.withType("boolean") //
						.thatIsActive(true) //
						.withIndex(0L) //
						.build()));
	}

	@Test(expected = RuntimeException.class)
	public void errorWhenGettingOutputParameters() throws Exception {
		// given
		doThrow(new RuntimeException()) //
				.when(dataView).findAllFunctions();

		// when
		underTest.readOutputParameters(1L, 2, 3);
	}

	@Test(expected = WebApplicationException.class)
	public void functionNotFoundWhenGettingOutputParameters() throws Exception {
		// given
		final CMFunction _1 = function(1L);
		final CMFunction _2 = function(2L);
		final CMFunction _4 = function(4L);
		final CMFunction _5 = function(5L);
		doReturn(asList(_1, _2, _4, _5)) //
				.when(dataView).findAllFunctions();
		doThrow(WebApplicationException.class) //
				.when(errorHandler).functionNotFound(3L);

		// when
		underTest.readOutputParameters(3L, 123, 456);
	}

	@Test
	public void allOutputParametersReturned() throws Exception {
		// given
		final CMFunction _1 = function(1L);
		final CMFunction _2 = function(2L);
		final CMFunction _3 = function(3L);
		doReturn(asList(_1, _2, _3)) //
				.when(dataView).findAllFunctions();
		final CMFunctionParameter foo = parameter("foo", new TextAttributeType());
		final CMFunctionParameter bar = parameter("bar", new IntegerAttributeType());
		final CMFunctionParameter baz = parameter("baz", new BooleanAttributeType());
		doReturn(asList(foo, bar, baz)) //
				.when(_2).getOutputParameters();

		// when
		final ResponseMultiple<Attribute> response = underTest.readOutputParameters(2L, null, null);

		// then
		assertThat(response.getMetadata().getTotal(), equalTo(3L));
		assertThat(response.getElements(), hasSize(3));
		assertThat(get(response.getElements(), 0),
				equalTo(newAttribute() //
						.withId(foo.getName()) //
						.withName(foo.getName()) //
						.withDescription(foo.getName()) //
						.withType("text") //
						.thatIsActive(true) //
						.withIndex(0L) //
						.build()));
		assertThat(get(response.getElements(), 1).getId(), equalTo("bar"));
		assertThat(get(response.getElements(), 2).getId(), equalTo("baz"));
	}

	@Test
	public void outputParametersReturnedPaged() throws Exception {
		// given
		final CMFunction _1 = function(1L);
		final CMFunction _2 = function(2L);
		final CMFunction _3 = function(3L);
		doReturn(asList(_1, _2, _3)) //
				.when(dataView).findAllFunctions();
		final CMFunctionParameter foo = parameter("foo", new TextAttributeType());
		final CMFunctionParameter bar = parameter("bar", new IntegerAttributeType());
		final CMFunctionParameter baz = parameter("baz", new BooleanAttributeType());
		doReturn(asList(foo, bar, baz)) //
				.when(_2).getOutputParameters();

		// when
		final ResponseMultiple<Attribute> response = underTest.readOutputParameters(2L, 1, 2);

		// then
		assertThat(response.getMetadata().getTotal(), equalTo(3L));
		assertThat(response.getElements(), hasSize(1));
		assertThat(get(response.getElements(), 0),
				equalTo(newAttribute() //
						.withId(baz.getName()) //
						.withName(baz.getName()) //
						.withDescription(baz.getName()) //
						.withType("boolean") //
						.thatIsActive(true) //
						.withIndex(0L) //
						.build()));
	}

	/*
	 * Utilities
	 */

	private CMFunction function(final Long id) {
		return function(id, emptyMap());
	}

	private CMFunction function(final Long id, final Map<String, Object> metadata) {
		final CMFunction output = mock(CMFunction.class, id.toString());
		doReturn(id) //
				.when(output).getId();
		doReturn(id.toString()) //
				.when(output).getName();
		doReturn(metadata) //
				.when(output).getMetadata();
		return output;
	}

	private CMFunctionParameter parameter(final String name, final CMAttributeType<?> type) {
		final CMFunctionParameter output = mock(CMFunctionParameter.class, name);
		doReturn(name) //
				.when(output).getName();
		doReturn(type) //
				.when(output).getType();
		return output;
	}

}

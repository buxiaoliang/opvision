package unit.services.template.engine;

import static java.util.Arrays.asList;
import static java.util.Collections.emptyList;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.cmdbuild.common.Constants.DATETIME_PRINTING_PATTERN;
import static org.hamcrest.Matchers.equalTo;
import static org.joda.time.DateTime.now;
import static org.joda.time.format.DateTimeFormat.forPattern;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import java.util.HashMap;
import java.util.List;

import org.cmdbuild.common.collect.ChainablePutMap;
import org.cmdbuild.common.utils.PagedElements;
import org.cmdbuild.dao.function.CMFunction;
import org.cmdbuild.dao.function.CMFunction.CMFunctionParameter;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.logic.data.QueryOptions;
import org.cmdbuild.logic.data.access.DataAccessLogic;
import org.cmdbuild.model.data.Card;
import org.cmdbuild.services.template.engine.FunctionEngine;
import org.joda.time.DateTime;
import org.junit.Before;
import org.junit.Test;
import org.mockito.internal.stubbing.answers.ThrowsException;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;

import com.google.common.base.Function;

public class FunctionEngineTest {

	private static CMFunctionParameter parameter(final String name) {
		final CMFunctionParameter output = mock(CMFunctionParameter.class,
				new ThrowsException(new UnsupportedOperationException()));
		doReturn(name) //
				.when(output).getName();
		return output;
	}

	private static final List<CMFunctionParameter> NO_PARAMETERS = emptyList();

	private CMDataView dataView;
	private DataAccessLogic dataAccessLogic;
	private Function<Object, Object> converter;
	private FunctionEngine underTest;

	@Before
	public void setUp() throws Exception {
		dataView = mock(CMDataView.class);
		dataAccessLogic = mock(DataAccessLogic.class);
		converter = mock(Function.class);
		doAnswer(new Answer<Object>() {

			@Override
			public Object answer(final InvocationOnMock invocation) throws Throwable {
				return invocation.getArguments()[0];
			}

		}).when(converter).apply(any());
		underTest = FunctionEngine.newInstance() //
				.withDataView(dataView) //
				.withDataAccessLogic(dataAccessLogic) //
				.withConverter(converter) //
				.build();
	}

	@Test(expected = NullPointerException.class)
	public void missingDataViewThrowsException() throws Exception {
		// when
		FunctionEngine.newInstance() //
				.withDataAccessLogic(dataAccessLogic) //
				.build();
	}

	@Test(expected = NullPointerException.class)
	public void missingDataAccessLogicThrowsException() throws Exception {
		// when
		FunctionEngine.newInstance() //
				.withDataView(dataView) //
				.build();
	}

	@Test
	public void converterIsNotMandatory() throws Exception {
		// when
		FunctionEngine.newInstance() //
				.withDataView(dataView) //
				.withDataAccessLogic(dataAccessLogic) //
				.build();
	}

	@Test(expected = NullPointerException.class)
	public void nullExpressionThrowsException() throws Exception {
		try {
			// when
			underTest.eval(null);
		} finally {
			verifyNoMoreInteractions(dataView);
		}
	}

	@Test(expected = IllegalArgumentException.class)
	public void emptyExpressionThrowsException() throws Exception {
		try {
			// when
			underTest.eval(EMPTY);
		} finally {
			verifyNoMoreInteractions(dataView);
		}
	}

	@Test(expected = IllegalArgumentException.class)
	public void blankExpressionThrowsException() throws Exception {
		try {
			// when
			underTest.eval(" \t");
		} finally {
			verifyNoMoreInteractions(dataView);
		}
	}

	@Test(expected = NullPointerException.class)
	public void functionNotFoundThrowsException() throws Exception {
		// given
		doReturn(null) //
				.when(dataView).findFunctionByName(anyString());

		try {
			// when
			underTest.eval("foo()");
		} finally {
			verify(dataView).findFunctionByName(eq("foo"));
			verifyNoMoreInteractions(dataView);
		}
	}

	@Test(expected = IllegalArgumentException.class)
	public void lessInputParametersThrowsException() throws Exception {
		// given
		final CMFunction function = mock(CMFunction.class);
		doReturn(function) //
				.when(dataView).findFunctionByName(anyString());
		doReturn(asList(parameter("input1"), parameter("input2"))) //
				.when(function).getInputParameters();

		// when
		try {
			underTest.eval("foo(bar)");
		} finally {
			// then
			verify(dataView).findFunctionByName(eq("foo"));
			verify(function).getInputParameters();
			verifyNoMoreInteractions(dataView, dataAccessLogic, converter, function);
		}
	}

	@Test(expected = IllegalArgumentException.class)
	public void moreInputParametersThrowsException() throws Exception {
		// given
		final CMFunction function = mock(CMFunction.class);
		doReturn(function) //
				.when(dataView).findFunctionByName(anyString());
		doReturn(asList(parameter("input1"))) //
				.when(function).getInputParameters();

		// when
		try {
			underTest.eval("foo(bar,baz)");
		} finally {
			// then
			verify(dataView).findFunctionByName(eq("foo"));
			verify(function).getInputParameters();
			verifyNoMoreInteractions(dataView, dataAccessLogic, converter, function);
		}
	}

	@Test(expected = IllegalArgumentException.class)
	public void lessThanOneOutputParameterThrowsException() throws Exception {
		// given
		final CMFunction function = mock(CMFunction.class);
		doReturn(function) //
				.when(dataView).findFunctionByName(anyString());
		doReturn(NO_PARAMETERS) //
				.when(function).getInputParameters();
		doReturn(emptyList()) //
				.when(function).getOutputParameters();

		try {
			// when
			underTest.eval("foo()");
		} finally {
			verify(dataView).findFunctionByName(eq("foo"));
			verify(function).getInputParameters();
			verify(function).getOutputParameters();
			verifyNoMoreInteractions(dataView, dataAccessLogic, converter, function);
		}
	}

	@Test(expected = IllegalArgumentException.class)
	public void moreThanOneOutputParameterThrowsException() throws Exception {
		// given
		final CMFunction function = mock(CMFunction.class);
		doReturn(function) //
				.when(dataView).findFunctionByName(anyString());
		doReturn(NO_PARAMETERS) //
				.when(function).getInputParameters();
		doReturn(asList(parameter("input1"), parameter("input2"))) //
				.when(function).getOutputParameters();

		try {
			// when
			underTest.eval("foo()");
		} finally {
			verify(dataView).findFunctionByName(eq("foo"));
			verify(function).getInputParameters();
			verify(function).getOutputParameters();
			verifyNoMoreInteractions(dataView, dataAccessLogic, converter, function);
		}
	}

	@Test
	public void functionWithNoInputParametersCalled() throws Exception {
		// given
		final CMFunction function = mock(CMFunction.class);
		doReturn(function) //
				.when(dataView).findFunctionByName(anyString());
		doReturn(NO_PARAMETERS) //
				.when(function).getInputParameters();
		doReturn(asList(parameter("output"))) //
				.when(function).getOutputParameters();
		doReturn(new PagedElements<>(asList(Card.newInstance() //
				.withClassName("dummy") //
				.withAttribute("output", "this is the output") //
				.build()), 42)) //
						.when(dataAccessLogic).fetchSQLCards(anyString(), any(QueryOptions.class));

		// when
		final Object result = underTest.eval("foo()");

		// then
		verify(dataView).findFunctionByName(eq("foo"));
		verify(function).getInputParameters();
		verify(function).getOutputParameters();
		verify(dataAccessLogic).fetchSQLCards(eq("foo"),
				eq(QueryOptions.newQueryOption() //
						.limit(1) //
						.build()));
		verify(converter).apply(eq("this is the output"));
		verifyNoMoreInteractions(dataView, dataAccessLogic, converter, function);

		assertThat(result, equalTo(Object.class.cast("this is the output")));
	}

	@Test
	public void functionWithInputParametersCalled() throws Exception {
		// given
		final CMFunction function = mock(CMFunction.class);
		doReturn(function) //
				.when(dataView).findFunctionByName(anyString());
		doReturn(asList(parameter("input1"), parameter("input2"))) //
				.when(function).getInputParameters();
		doReturn(asList(parameter("output"))) //
				.when(function).getOutputParameters();
		doReturn(new PagedElements<>(asList(Card.newInstance() //
				.withClassName("dummy") //
				.withAttribute("output", "this is the output") //
				.build()), 42)) //
						.when(dataAccessLogic).fetchSQLCards(anyString(), any(QueryOptions.class));

		// when
		final Object result = underTest.eval("foo(bar,baz)");

		// then
		verify(dataView).findFunctionByName(eq("foo"));
		verify(function).getInputParameters();
		verify(function).getOutputParameters();
		verify(dataAccessLogic).fetchSQLCards(eq("foo"),
				eq(QueryOptions.newQueryOption() //
						.parameters(ChainablePutMap.of(new HashMap<String, Object>()) //
								.chainablePut("input1", "bar") //
								.chainablePut("input2", "baz"))
						.limit(1) //
						.build()));
		verify(converter).apply(eq("this is the output"));
		verifyNoMoreInteractions(dataView, dataAccessLogic, converter, function);

		assertThat(result, equalTo(Object.class.cast("this is the output")));
	}

	@Test
	public void defaultConverterConvertsDateTimeOnly() throws Exception {
		// given
		final Function<Object, Object> underTest = FunctionEngine.DEFAULT_CONVERTER;
		final DateTime dateTime = now();

		// when/then
		assertThat(underTest.apply("dummy"), equalTo("dummy"));
		assertThat(underTest.apply(1), equalTo(1));
		assertThat(underTest.apply(2L), equalTo(2L));
		assertThat(underTest.apply(true), equalTo(true));
		assertThat(underTest.apply(dateTime), equalTo(forPattern(DATETIME_PRINTING_PATTERN).print(dateTime)));
	}

}

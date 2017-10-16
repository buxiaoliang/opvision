package unit.workflow.widget;

import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import org.cmdbuild.dao.entry.CMValueSet;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.exception.CMDBWorkflowException;
import org.cmdbuild.model.widget.CreateModifyCard;
import org.cmdbuild.notification.Notifier;
import org.cmdbuild.services.template.store.TemplateRepository;
import org.cmdbuild.workflow.widget.CreateModifyCardWidgetFactory;
import org.junit.Test;

public class CreateModifyCardWidgetFactoryTest {

	@Test
	public void refernenceIsNullAndClassNameIsMissing() throws Exception {
		// given
		final TemplateRepository templateRepository = mock(TemplateRepository.class);
		final Notifier notifier = mock(Notifier.class);
		final CMDataView dataView = mock(CMDataView.class);
		final CreateModifyCardWidgetFactory factory =
				new CreateModifyCardWidgetFactory(templateRepository, notifier, dataView);
		final String configuration = EMPTY //
				+ "Reference=null\n";
		final CMValueSet values = mock(CMValueSet.class);

		// when
		final CreateModifyCard output = (CreateModifyCard) factory.createWidget(configuration, values);

		// then
		verify(values).get(eq("null"));
		verify(notifier).warn(any(CMDBWorkflowException.class));
		verifyNoMoreInteractions(templateRepository, notifier, dataView, values);

		assertThat(output, nullValue());
	}

	@Test
	public void refernenceIsNullAndClassNameIsEmpty() throws Exception {
		// given
		final TemplateRepository templateRepository = mock(TemplateRepository.class);
		final Notifier notifier = mock(Notifier.class);
		final CMDataView dataView = mock(CMDataView.class);
		final CreateModifyCardWidgetFactory factory =
				new CreateModifyCardWidgetFactory(templateRepository, notifier, dataView);
		final String configuration = EMPTY //
				+ "Reference=null\n" //
				+ "ClassName=null";
		final CMValueSet values = mock(CMValueSet.class);

		// when
		final CreateModifyCard output = (CreateModifyCard) factory.createWidget(configuration //
				, values);

		// then
		verify(values, times(2)).get(eq("null"));
		verify(notifier).warn(any(CMDBWorkflowException.class));
		verifyNoMoreInteractions(templateRepository, notifier, dataView, values);

		assertThat(output, nullValue());
	}

	@Test
	public void refernenceIsNullAndClassNameIsBlank() throws Exception {
		// given
		final TemplateRepository templateRepository = mock(TemplateRepository.class);
		final Notifier notifier = mock(Notifier.class);
		final CMDataView dataView = mock(CMDataView.class);
		final CreateModifyCardWidgetFactory factory =
				new CreateModifyCardWidgetFactory(templateRepository, notifier, dataView);
		final String configuration = EMPTY //
				+ "Reference=null\n" //
				+ "ClassName= \t";
		final CMValueSet values = mock(CMValueSet.class);

		// when
		final CreateModifyCard output = (CreateModifyCard) factory.createWidget(configuration, values);

		// then
		verify(values).get(eq("ClassName"));
		verify(values).get(eq("null"));
		verify(notifier).warn(any(CMDBWorkflowException.class));
		verifyNoMoreInteractions(templateRepository, notifier, dataView, values);

		assertThat(output, nullValue());
	}

	@Test
	public void refernenceIsNullAndClassNameIsValid() throws Exception {
		// given
		final TemplateRepository templateRepository = mock(TemplateRepository.class);
		final Notifier notifier = mock(Notifier.class);
		final CMDataView dataView = mock(CMDataView.class);
		final CreateModifyCardWidgetFactory factory =
				new CreateModifyCardWidgetFactory(templateRepository, notifier, dataView);
		final String configuration = EMPTY //
				+ "Reference=null\n" //
				+ "ClassName='Test'";
		final CMValueSet values = mock(CMValueSet.class);

		// when
		final CreateModifyCard output = (CreateModifyCard) factory.createWidget(configuration, values);

		// then
		verify(values).get(eq("null"));
		verifyNoMoreInteractions(templateRepository, notifier, dataView, values);

		assertThat(output.getTargetClass(), equalTo("Test"));
		assertThat(output.getIdcardcqlselector(), nullValue());
	}

	@Test
	public void modelReturnedAsIs() throws Exception {
		// given
		final TemplateRepository templateRepository = mock(TemplateRepository.class);
		final Notifier notifier = mock(Notifier.class);
		final CMDataView dataView = mock(CMDataView.class);
		final CreateModifyCardWidgetFactory factory =
				new CreateModifyCardWidgetFactory(templateRepository, notifier, dataView);
		final String configuration = EMPTY //
				+ "ClassName='Test'\n" //
				+ "Model='foo bar baz'";
		final CMValueSet values = mock(CMValueSet.class);

		// when
		final CreateModifyCard output = (CreateModifyCard) factory.createWidget(configuration, values);

		// then
		verifyNoMoreInteractions(templateRepository, notifier, dataView, values);

		assertThat(output.getTargetClass(), equalTo("Test"));
		assertThat(output.getIdcardcqlselector(), nullValue());
		assertThat(output.getModel(), equalTo("foo bar baz"));
	}

}

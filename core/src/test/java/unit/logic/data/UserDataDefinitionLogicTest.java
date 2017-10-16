package unit.logic.data;

import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMEntryType;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.exception.AuthException;
import org.cmdbuild.logic.data.DataDefinitionLogic;
import org.cmdbuild.logic.data.UserDataDefinitionLogic;
import org.cmdbuild.model.data.Attribute;
import org.cmdbuild.model.data.EntryType;
import org.junit.Test;

public class UserDataDefinitionLogicTest {

	@Test
	public void userCanCreateNonSystemClasses() throws Exception {
		// given
		final DataDefinitionLogic delegate = mock(DataDefinitionLogic.class);
		final CMDataView dataView = mock(CMDataView.class);
		final EntryType foo = EntryType.newClass() //
				.withName("foo") //
				.build();

		// when
		new UserDataDefinitionLogic(delegate, dataView).createOrUpdate(foo, true);

		// then
		verify(delegate).createOrUpdate(eq(foo), eq(true));
		verifyNoMoreInteractions(delegate, dataView);
	}

	@Test(expected = AuthException.class)
	public void userCanNotCreateSystemClasses() throws Exception {
		// given
		final DataDefinitionLogic delegate = mock(DataDefinitionLogic.class);
		final CMDataView dataView = mock(CMDataView.class);
		final EntryType foo = EntryType.newClass() //
				.withName("foo") //
				.thatIsSystem(true) //
				.build();

		// when
		try {
			new UserDataDefinitionLogic(delegate, dataView).createOrUpdate(foo, true);
		} finally {
			// then
			verifyNoMoreInteractions(delegate, dataView);
		}
	}

	@Test
	public void userCanModifyNonSystemClasses() throws Exception {
		// given
		final DataDefinitionLogic delegate = mock(DataDefinitionLogic.class);
		final CMDataView dataView = mock(CMDataView.class);
		final CMClass found = mock(CMClass.class);
		doReturn(false) //
				.when(found).isSystem();
		doReturn(found) //
				.when(dataView).findClass(anyString());
		final EntryType foo = EntryType.newClass() //
				.withName("foo") //
				.build();

		// when
		new UserDataDefinitionLogic(delegate, dataView).createOrUpdate(foo, false);

		// then
		verify(dataView).findClass(eq("foo"));
		verify(found).isSystem();
		verify(delegate).createOrUpdate(eq(foo), eq(false));
		verifyNoMoreInteractions(delegate, dataView, found);
	}

	@Test(expected = AuthException.class)
	public void userCanNotModifySystemClasses() throws Exception {
		// given
		final DataDefinitionLogic delegate = mock(DataDefinitionLogic.class);
		final CMDataView dataView = mock(CMDataView.class);
		final CMClass found = mock(CMClass.class);
		doReturn(true) //
				.when(found).isSystem();
		doReturn(found) //
				.when(dataView).findClass(anyString());
		final EntryType foo = EntryType.newClass() //
				.withName("foo") //
				.build();

		// when
		try {
			new UserDataDefinitionLogic(delegate, dataView).createOrUpdate(foo, false);
		} finally {
			// then
			verify(dataView).findClass(eq("foo"));
			verify(found).isSystem();
			verifyNoMoreInteractions(delegate, dataView, found);
		}
	}

	@Test
	public void userCanDeleteOrDeactivateNonSystemClasses() throws Exception {
		// given
		final DataDefinitionLogic delegate = mock(DataDefinitionLogic.class);
		final CMDataView dataView = mock(CMDataView.class);
		final CMClass found = mock(CMClass.class);
		doReturn(false) //
				.when(found).isSystem();
		doReturn(found) //
				.when(dataView).findClass(anyString());

		// when
		new UserDataDefinitionLogic(delegate, dataView).deleteOrDeactivate("foo");

		// then
		verify(dataView).findClass(eq("foo"));
		verify(found).isSystem();
		verify(delegate).deleteOrDeactivate(eq("foo"));
		verifyNoMoreInteractions(delegate, dataView, found);
	}

	@Test(expected = AuthException.class)
	public void userCanNotDeleteOrDeactivateNonSystemClasses() throws Exception {
		// given
		final DataDefinitionLogic delegate = mock(DataDefinitionLogic.class);
		final CMDataView dataView = mock(CMDataView.class);
		final CMClass found = mock(CMClass.class);
		doReturn(true) //
				.when(found).isSystem();
		doReturn(found) //
				.when(dataView).findClass(anyString());

		try {
			// when
			new UserDataDefinitionLogic(delegate, dataView).deleteOrDeactivate("foo");
		} finally {
			// then
			verify(dataView).findClass(eq("foo"));
			verify(found).isSystem();
			verifyNoMoreInteractions(delegate, dataView, found);
		}
	}

	@Test
	public void userCanCreateOrUpdateAttributesOfNonSystemClasses() throws Exception {
		// given
		final DataDefinitionLogic delegate = mock(DataDefinitionLogic.class);
		final CMEntryType found = mock(CMEntryType.class);
		doReturn(false) //
				.when(found).isSystem();
		doReturn(found) //
				.when(delegate).findOwnerOf(any(Attribute.class));
		final CMDataView dataView = mock(CMDataView.class);
		final Attribute foo = Attribute.newAttribute() //
				.withName("foo") //
				.withOwnerName("the owner") //
				.build();

		// when
		new UserDataDefinitionLogic(delegate, dataView).createOrUpdate(foo);

		// then
		verify(delegate).findOwnerOf(eq(foo));
		verify(found).isSystem();
		verify(delegate).createOrUpdate(eq(foo));
		verifyNoMoreInteractions(delegate, dataView, found);
	}

	@Test(expected = AuthException.class)
	public void userCanNotCreateOrUpdateAttributesOfSystemClasses() throws Exception {
		// given
		final DataDefinitionLogic delegate = mock(DataDefinitionLogic.class);
		final CMEntryType found = mock(CMEntryType.class);
		doReturn(true) //
				.when(found).isSystem();
		doReturn(found) //
				.when(delegate).findOwnerOf(any(Attribute.class));
		final CMDataView dataView = mock(CMDataView.class);
		final Attribute foo = Attribute.newAttribute() //
				.withName("foo") //
				.withOwnerName("the owner") //
				.build();

		try {
			// when
			new UserDataDefinitionLogic(delegate, dataView).createOrUpdate(foo);
		} finally {
			// then
			verify(delegate).findOwnerOf(eq(foo));
			verify(found).isSystem();
			verifyNoMoreInteractions(delegate, dataView, found);
		}
	}

	@Test
	public void userCanDeleteOrDeactivateAttributesOfNonSystemClasses() throws Exception {
		// given
		final DataDefinitionLogic delegate = mock(DataDefinitionLogic.class);
		final CMEntryType found = mock(CMEntryType.class);
		doReturn(false) //
				.when(found).isSystem();
		doReturn(found) //
				.when(delegate).findOwnerOf(any(Attribute.class));
		final CMDataView dataView = mock(CMDataView.class);
		final Attribute foo = Attribute.newAttribute() //
				.withName("foo") //
				.withOwnerName("the owner") //
				.build();

		// when
		new UserDataDefinitionLogic(delegate, dataView).deleteOrDeactivate(foo);

		// then
		verify(delegate).findOwnerOf(eq(foo));
		verify(found).isSystem();
		verify(delegate).deleteOrDeactivate(eq(foo));
		verifyNoMoreInteractions(delegate, dataView, found);
	}

	@Test(expected = AuthException.class)
	public void userCanNotDeleteOrDeactivateOrUpdateAttributesOfSystemClasses() throws Exception {
		// given
		final DataDefinitionLogic delegate = mock(DataDefinitionLogic.class);
		final CMEntryType found = mock(CMEntryType.class);
		doReturn(true) //
				.when(found).isSystem();
		doReturn(found) //
				.when(delegate).findOwnerOf(any(Attribute.class));
		final CMDataView dataView = mock(CMDataView.class);
		final Attribute foo = Attribute.newAttribute() //
				.withName("foo") //
				.withOwnerName("the owner") //
				.build();

		try {
			// when
			new UserDataDefinitionLogic(delegate, dataView).deleteOrDeactivate(foo);
		} finally {
			// then
			verify(delegate).findOwnerOf(eq(foo));
			verify(found).isSystem();
			verifyNoMoreInteractions(delegate, dataView, found);
		}
	}

}

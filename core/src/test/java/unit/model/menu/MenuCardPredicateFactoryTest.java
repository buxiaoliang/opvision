package unit.model.menu;

import static com.google.common.reflect.Reflection.newProxy;
import static org.cmdbuild.common.utils.Reflection.unsupported;
import static org.cmdbuild.services.store.menu.MenuConstants.ELEMENT_CLASS_ATTRIBUTE;
import static org.cmdbuild.services.store.menu.MenuConstants.MENU_CLASS_NAME;
import static org.cmdbuild.services.store.menu.MenuConstants.TYPE_ATTRIBUTE;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.cmdbuild.auth.UserStore;
import org.cmdbuild.auth.acl.CMGroup;
import org.cmdbuild.auth.acl.PrivilegeContext;
import org.cmdbuild.auth.context.SystemPrivilegeContext;
import org.cmdbuild.auth.user.AuthenticatedUser;
import org.cmdbuild.auth.user.OperationUser;
import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.logic.custompages.CustomPagesLogic;
import org.cmdbuild.model.view.ViewConverter;
import org.cmdbuild.privileges.predicates.IsAlwaysReadable;
import org.cmdbuild.privileges.predicates.IsReadableClass;
import org.cmdbuild.services.store.menu.MenuCardPredicateFactory;
import org.cmdbuild.services.store.menu.MenuItemType;
import org.junit.Before;
import org.junit.Test;

import com.google.common.base.Predicate;
import com.google.common.base.Supplier;

public class MenuCardPredicateFactoryTest {

	private static final String MOCK_GROUP_NAME = "mock_group";
	private static final Long referencedClassId = 10L;
	private CMDataView view;
	private Supplier<PrivilegeContext> privilegeContext;
	private UserStore userStore;
	private CustomPagesLogic customPagesLogic;

	@Before
	public void setUp() {
		this.view = getDataView();
		this.privilegeContext = mock(Supplier.class);
		this.userStore = mock(UserStore.class);
		this.customPagesLogic = mock(CustomPagesLogic.class);
	}

	private MenuCardPredicateFactory menuCardPredicateFactory(final CMGroup mockGroup) {
		return new MenuCardPredicateFactory(view, mockGroup, privilegeContext, new ViewConverter(view), userStore,
				customPagesLogic);
	}

	@Test
	public void shouldReturnTheCorrectPredicate() {
		// given
		final CMCard classMockMenuCard = getMockMenuCard(MenuItemType.CLASS);
		final CMCard folderMockMenuCard = getMockMenuCard(MenuItemType.FOLDER);
		final CMCard rootMockMenuCard = getMockMenuCard(MenuItemType.ROOT);

		final CMGroup mockGroup = mock(CMGroup.class);
		final MenuCardPredicateFactory factory = menuCardPredicateFactory(mockGroup);

		// when
		final Predicate<?> classPredicate = factory.getPredicate(classMockMenuCard);
		final Predicate<?> folderPredicate = factory.getPredicate(folderMockMenuCard);
		final Predicate<?> rootPredicate = factory.getPredicate(rootMockMenuCard);

		// then
		assertTrue(classPredicate instanceof IsReadableClass);
		assertTrue(folderPredicate instanceof IsAlwaysReadable);
		assertTrue(rootPredicate instanceof IsAlwaysReadable);
	}

	@Test(expected = IllegalArgumentException.class)
	public void shouldThrowExceptionIfCardIsNotAMenuCard() {
		// given
		final CMCard mockMenuCard = mock(CMCard.class);
		when(mockMenuCard.get(TYPE_ATTRIBUTE)).thenReturn(MenuItemType.CLASS);
		final CMClass mockMenuClass = mock(CMClass.class);
		when(mockMenuClass.getName()).thenReturn("Not_Menu_Class_Name");
		when(mockMenuCard.getType()).thenReturn(mockMenuClass);
		final CMGroup mockGroup = mock(CMGroup.class);
		final MenuCardPredicateFactory factory = menuCardPredicateFactory(mockGroup);

		// when
		factory.getPredicate(mockMenuCard);
	}

	@Test(expected = IllegalArgumentException.class)
	public void shouldThrowExceptionIfNotValidMenuCardType() {
		// given
		final CMCard mockMenuCard = mock(CMCard.class);
		when(mockMenuCard.get(TYPE_ATTRIBUTE)).thenReturn("not_valid_type");
		final CMClass mockMenuClass = mock(CMClass.class);
		when(mockMenuClass.getName()).thenReturn(MENU_CLASS_NAME);
		when(mockMenuCard.getType()).thenReturn(mockMenuClass);

		final CMGroup mockGroup = mock(CMGroup.class);
		final MenuCardPredicateFactory factory = menuCardPredicateFactory(mockGroup);

		// when
		factory.getPredicate(mockMenuCard);
	}

	@Test
	public void shouldAcceptEveryDashdashboardWhenUserHasAdministrationPrivileges() {
		// given
		final AuthenticatedUser user = newProxy(AuthenticatedUser.class, unsupported("should not be used"));
		final CMGroup group = newProxy(CMGroup.class, unsupported("should not be used"));
		final OperationUser operationUser = new OperationUser(user, new SystemPrivilegeContext(), group);
		doReturn(operationUser) //
				.when(userStore).getUser();
		final CMCard mockMenuCard = getMockMenuCard(MenuItemType.DASHBOARD);
		doReturn(null) //
				.when(mockMenuCard).get("Definition");
		final CMGroup mockGroup = mock(CMGroup.class);
		doReturn(MOCK_GROUP_NAME) //
				.when(mockGroup).getName();
		final MenuCardPredicateFactory factory = menuCardPredicateFactory(mockGroup);

		// when
		final Predicate<CMCard> predicate = factory.getPredicate(mockMenuCard);

		// then
		assertThat(predicate.apply(mockMenuCard), equalTo(true));
	}

	@Test
	public void shouldReturnFalseIfNullDashboardDefinition() {
		// given
		final AuthenticatedUser user = newProxy(AuthenticatedUser.class, unsupported("should not be used"));
		final PrivilegeContext privilegeContext = mock(PrivilegeContext.class);
		doReturn(false) //
				.when(privilegeContext).hasAdministratorPrivileges();
		final CMGroup group = newProxy(CMGroup.class, unsupported("should not be used"));
		final OperationUser operationUser = new OperationUser(user, privilegeContext, group);
		doReturn(operationUser) //
				.when(userStore).getUser();
		final CMCard mockMenuCard = getMockMenuCard(MenuItemType.DASHBOARD);
		when(mockMenuCard.get("Definition")).thenReturn(null);
		final CMGroup mockGroup = mock(CMGroup.class);
		when(mockGroup.getName()).thenReturn(MOCK_GROUP_NAME);
		final MenuCardPredicateFactory factory = menuCardPredicateFactory(mockGroup);

		// when
		final Predicate<CMCard> predicate = factory.getPredicate(mockMenuCard);

		// then
		assertThat(predicate.apply(mockMenuCard), equalTo(false));
	}

	@Test
	public void shouldReturnFalseIfGroupCannotReadTheDashboard() {
		// given
		final AuthenticatedUser user = newProxy(AuthenticatedUser.class, unsupported("should not be used"));
		final PrivilegeContext privilegeContext = mock(PrivilegeContext.class);
		doReturn(false) //
				.when(privilegeContext).hasAdministratorPrivileges();
		final CMGroup group = newProxy(CMGroup.class, unsupported("should not be used"));
		final OperationUser operationUser = new OperationUser(user, privilegeContext, group);
		doReturn(operationUser) //
				.when(userStore).getUser();
		final CMCard mockMenuCard = getMockMenuCard(MenuItemType.DASHBOARD);
		when(mockMenuCard.get("Definition")).thenReturn("{groups:[group1, group2]}");
		final CMGroup mockGroup = mock(CMGroup.class);
		when(mockGroup.getName()).thenReturn(MOCK_GROUP_NAME);
		final MenuCardPredicateFactory factory = menuCardPredicateFactory(mockGroup);

		// when
		final Predicate<CMCard> predicate = factory.getPredicate(mockMenuCard);

		// then
		assertThat(predicate.apply(mockMenuCard), equalTo(false));
	}

	@Test
	public void shouldReturnFalseIfMalformedDashboardDefinition() {
		// given
		final AuthenticatedUser user = newProxy(AuthenticatedUser.class, unsupported("should not be used"));
		final PrivilegeContext privilegeContext = mock(PrivilegeContext.class);
		doReturn(false) //
				.when(privilegeContext).hasAdministratorPrivileges();
		final CMGroup group = newProxy(CMGroup.class, unsupported("should not be used"));
		final OperationUser operationUser = new OperationUser(user, privilegeContext, group);
		doReturn(operationUser) //
				.when(userStore).getUser();
		final CMCard mockMenuCard = getMockMenuCard(MenuItemType.DASHBOARD);
		when(mockMenuCard.get("Definition"))
				.thenReturn("{malformed, json, groups:[group1, group2, " + MOCK_GROUP_NAME + "]}");
		final CMGroup mockGroup = mock(CMGroup.class);
		when(mockGroup.getName()).thenReturn(MOCK_GROUP_NAME);
		final MenuCardPredicateFactory factory = menuCardPredicateFactory(mockGroup);

		// when
		final Predicate<CMCard> predicate = factory.getPredicate(mockMenuCard);

		// then
		assertThat(predicate.apply(mockMenuCard), equalTo(false));
	}

	private CMCard getMockMenuCard(final MenuItemType type) {
		final CMCard mockMenuCard = mock(CMCard.class);
		when(mockMenuCard.get(TYPE_ATTRIBUTE)).thenReturn(type.getValue());
		if (type.getValue().equals(MenuItemType.CLASS.getValue())) {
			when(mockMenuCard.get(ELEMENT_CLASS_ATTRIBUTE)).thenReturn(referencedClassId);
		}
		final CMClass mockMenuClass = mock(CMClass.class);
		when(mockMenuClass.getName()).thenReturn(MENU_CLASS_NAME);
		when(mockMenuCard.getType()).thenReturn(mockMenuClass);
		when(mockMenuClass.getId()).thenReturn(referencedClassId);
		return mockMenuCard;
	}

	private CMDataView getDataView() {
		final CMDataView mockView = mock(CMDataView.class);
		return mockView;
	}

}

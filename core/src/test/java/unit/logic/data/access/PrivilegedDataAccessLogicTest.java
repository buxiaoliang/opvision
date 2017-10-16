package unit.logic.data.access;

import static java.util.Arrays.asList;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.cmdbuild.auth.acl.CMPrivilegedObject;
import org.cmdbuild.auth.acl.PrivilegeContext;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.exception.AuthException;
import org.cmdbuild.logic.data.access.DataAccessLogic;
import org.cmdbuild.logic.data.access.DataAccessLogic.CreateCard;
import org.cmdbuild.logic.data.access.PrivilegedDataAccessLogic;
import org.cmdbuild.model.data.Card;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestRule;
import org.junit.runner.Description;
import org.junit.runners.model.Statement;
import org.mockito.Mockito;

public class PrivilegedDataAccessLogicTest {

	private static class MockitoRule implements TestRule {

		private Collection<Object> mocks;

		public <T> T mock(final Class<T> type) {
			final T mock = Mockito.mock(type);
			mocks.add(mock);
			return mock;
		}

		@Override
		public Statement apply(final Statement base, final Description description) {
			return new Statement() {

				@Override
				public void evaluate() throws Throwable {
					mocks = new ArrayList<>();
					try {
						base.evaluate();
					} finally {
						verifyNoMoreInteractions(mocks.toArray());
					}
				}

			};
		}

	}

	@Rule
	public MockitoRule mockito = new MockitoRule();

	@Test
	public void classHasWriteAccessOnCardCreation() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final CMClass foo = mockito.mock(CMClass.class);
		doReturn(foo) //
				.when(delegate).findClass(anyString());
		doReturn(true) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();
		final CreateCard value = mockito.mock(CreateCard.class);
		doReturn(card) //
				.when(value).card();

		// when
		underTest.createCard(value);

		// then
		verify(value).card();
		verify(delegate).findClass(eq("foo"));
		verify(foo).isSuperclass();
		verify(privilegeContext).hasWriteAccess(eq(foo));
		verify(delegate).createCard(eq(value));
	}

	@Test(expected = AuthException.class)
	public void classIsSuperclassOnCardCreation() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final CMClass foo = mockito.mock(CMClass.class);
		doReturn(true) //
				.when(foo).isSuperclass();
		doReturn(foo) //
				.when(delegate).findClass(anyString());
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();
		final CreateCard value = mockito.mock(CreateCard.class);
		doReturn(card) //
				.when(value).card();

		// when
		try {
			underTest.createCard(value);
		} finally {
			// then
			verify(value).card();
			verify(delegate).findClass(eq("foo"));
			verify(foo).isSuperclass();
		}
	}

	@Test(expected = AuthException.class)
	public void classHasNoWriteAccessOnCardCreation() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final CMClass foo = mockito.mock(CMClass.class);
		doReturn(foo) //
				.when(delegate).findClass(anyString());
		doReturn(false) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();
		final CreateCard value = mockito.mock(CreateCard.class);
		doReturn(card) //
				.when(value).card();

		// when
		try {
			underTest.createCard(value);
		} finally {
			// then
			verify(value).card();
			verify(delegate).findClass(eq("foo"));
			verify(foo).isSuperclass();
			verify(privilegeContext).hasWriteAccess(eq(foo));
		}
	}

	@Test(expected = AuthException.class)
	public void classNotFoundOnCardCreation() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		doReturn(null) //
				.when(delegate).findClass(anyString());
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();
		final CreateCard value = mockito.mock(CreateCard.class);
		doReturn(card) //
				.when(value).card();

		// when
		try {
			underTest.createCard(value);
		} finally {
			// then
			verify(value).card();
			verify(delegate).findClass(eq("foo"));
		}
	}

	@Test
	public void classesHasWriteAccessOnCardsCreation() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final CMClass fooClass = mockito.mock(CMClass.class);
		final CMClass barClass = mockito.mock(CMClass.class);
		doReturn(fooClass).doReturn(barClass) //
				.when(delegate).findClass(anyString());
		doReturn(true) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));
		final Card fooCard = Card.newInstance() //
				.withClassName("foo") //
				.build();
		final CreateCard fooCreateCard = mockito.mock(CreateCard.class);
		doReturn(fooCard) //
				.when(fooCreateCard).card();
		final Card barCard = Card.newInstance() //
				.withClassName("bar") //
				.build();
		final CreateCard barCreateCard = mockito.mock(CreateCard.class);
		doReturn(barCard) //
				.when(barCreateCard).card();
		final Iterable<CreateCard> values = asList(fooCreateCard, barCreateCard);

		// when
		underTest.createCards(values);

		// then
		verify(fooCreateCard).card();
		verify(delegate).findClass(eq("foo"));
		verify(fooClass).isSuperclass();
		verify(privilegeContext).hasWriteAccess(eq(fooClass));
		verify(barCreateCard).card();
		verify(delegate).findClass(eq("bar"));
		verify(barClass).isSuperclass();
		verify(privilegeContext).hasWriteAccess(eq(barClass));
		verify(delegate).createCards(eq(values));
	}

	@Test(expected = AuthException.class)
	public void classIsSuperclassOnCardsCreation() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final CMClass fooClass = mockito.mock(CMClass.class);
		final CMClass barClass = mockito.mock(CMClass.class);
		doReturn(true) //
				.when(barClass).isSuperclass();
		doReturn(fooClass).doReturn(barClass) //
				.when(delegate).findClass(anyString());
		doReturn(true) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));
		final Card fooCard = Card.newInstance() //
				.withClassName("foo") //
				.build();
		final CreateCard fooCreateCard = mockito.mock(CreateCard.class);
		doReturn(fooCard) //
				.when(fooCreateCard).card();
		final Card barCard = Card.newInstance() //
				.withClassName("bar") //
				.build();
		final CreateCard barCreateCard = mockito.mock(CreateCard.class);
		doReturn(barCard) //
				.when(barCreateCard).card();
		final CreateCard bazCreateCard = mockito.mock(CreateCard.class);
		final Iterable<CreateCard> values = asList(fooCreateCard, barCreateCard, bazCreateCard);

		try {
			// when
			underTest.createCards(values);
		} finally {
			// then
			verify(fooCreateCard).card();
			verify(delegate).findClass(eq("foo"));
			verify(fooClass).isSuperclass();
			verify(privilegeContext).hasWriteAccess(eq(fooClass));
			verify(barCreateCard).card();
			verify(delegate).findClass(eq("bar"));
			verify(barClass).isSuperclass();
		}
	}

	@Test(expected = AuthException.class)
	public void classHasNoWriteAccessOnCardsCreation() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final CMClass fooClass = mockito.mock(CMClass.class);
		final CMClass barClass = mockito.mock(CMClass.class);
		doReturn(fooClass).doReturn(barClass) //
				.when(delegate).findClass(anyString());
		doReturn(true).doReturn(false) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));
		final Card fooCard = Card.newInstance() //
				.withClassName("foo") //
				.build();
		final CreateCard fooCreateCard = mockito.mock(CreateCard.class);
		doReturn(fooCard) //
				.when(fooCreateCard).card();
		final Card barCard = Card.newInstance() //
				.withClassName("bar") //
				.build();
		final CreateCard barCreateCard = mockito.mock(CreateCard.class);
		doReturn(barCard) //
				.when(barCreateCard).card();
		final CreateCard bazCreateCard = mockito.mock(CreateCard.class);
		final Iterable<CreateCard> values = asList(fooCreateCard, barCreateCard, bazCreateCard);

		try {
			// when
			underTest.createCards(values);
		} finally {
			// then
			verify(fooCreateCard).card();
			verify(delegate).findClass(eq("foo"));
			verify(fooClass).isSuperclass();
			verify(privilegeContext).hasWriteAccess(eq(fooClass));
			verify(barCreateCard).card();
			verify(delegate).findClass(eq("bar"));
			verify(barClass).isSuperclass();
			verify(privilegeContext).hasWriteAccess(eq(barClass));
		}
	}

	@Test(expected = AuthException.class)
	public void classNotFoundOnCardsCreation() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final CMClass fooClass = mockito.mock(CMClass.class);
		mockito.mock(CMClass.class);
		doReturn(fooClass).doReturn(null) //
				.when(delegate).findClass(anyString());
		doReturn(true) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));
		final Card fooCard = Card.newInstance() //
				.withClassName("foo") //
				.build();
		final CreateCard fooCreateCard = mockito.mock(CreateCard.class);
		doReturn(fooCard) //
				.when(fooCreateCard).card();
		final Card barCard = Card.newInstance() //
				.withClassName("bar") //
				.build();
		final CreateCard barCreateCard = mockito.mock(CreateCard.class);
		doReturn(barCard) //
				.when(barCreateCard).card();
		final CreateCard bazCreateCard = mockito.mock(CreateCard.class);
		final Iterable<CreateCard> values = asList(fooCreateCard, barCreateCard, bazCreateCard);

		try {
			// when
			underTest.createCards(values);
		} finally {
			// then
			verify(fooCreateCard).card();
			verify(delegate).findClass(eq("foo"));
			verify(fooClass).isSuperclass();
			verify(privilegeContext).hasWriteAccess(eq(fooClass));
			verify(barCreateCard).card();
			verify(delegate).findClass(eq("bar"));
		}
	}

	@Test
	public void cardIsVerifiedBeforeCreation() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final CMClass foo = mockito.mock(CMClass.class);
		doReturn(foo) //
				.when(delegate).findClass(anyString());
		doReturn(true) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();

		// when
		underTest.createCard(card);

		// then
		verify(delegate).findClass(eq("foo"));
		verify(foo).isSuperclass();
		verify(privilegeContext).hasWriteAccess(eq(foo));
		verify(delegate).createCard(eq(card));
	}

	@Test(expected = AuthException.class)
	public void cardClassIsSuperclassOnCreation() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final CMClass foo = mockito.mock(CMClass.class);
		doReturn(true) //
				.when(foo).isSuperclass();
		doReturn(foo) //
				.when(delegate).findClass(anyString());
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();

		// when
		try {
			underTest.createCard(card);
		} finally {
			// then
			verify(delegate).findClass(eq("foo"));
			verify(foo).isSuperclass();
		}
	}

	@Test(expected = AuthException.class)
	public void cardClassHasNoWritePrivilegesOnCreation() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final CMClass foo = mockito.mock(CMClass.class);
		doReturn(foo) //
				.when(delegate).findClass(anyString());
		doReturn(false) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();

		// when
		try {
			underTest.createCard(card);
		} finally {
			// then
			verify(delegate).findClass(eq("foo"));
			verify(foo).isSuperclass();
			verify(privilegeContext).hasWriteAccess(eq(foo));
		}
	}

	@Test(expected = AuthException.class)
	public void cardClassNotFoundCreation() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		doReturn(null) //
				.when(delegate).findClass(anyString());
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();

		// when
		try {
			underTest.createCard(card);
		} finally {
			// then
			verify(delegate).findClass(eq("foo"));
		}
	}

	@Test
	public void cardIsVerifiedBeforeCreationWithDomainAttributesManagement() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final CMClass foo = mockito.mock(CMClass.class);
		doReturn(foo) //
				.when(delegate).findClass(anyString());
		doReturn(true) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();

		// when
		underTest.createCard(card, true);

		// then
		verify(delegate).findClass(eq("foo"));
		verify(foo).isSuperclass();
		verify(privilegeContext).hasWriteAccess(eq(foo));
		verify(delegate).createCard(eq(card), eq(true));
	}

	@Test(expected = AuthException.class)
	public void cardClassIsSuperclassOnCreationWithDomainAttributesManagement() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final CMClass foo = mockito.mock(CMClass.class);
		doReturn(true) //
				.when(foo).isSuperclass();
		doReturn(foo) //
				.when(delegate).findClass(anyString());
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();

		// when
		try {
			underTest.createCard(card, true);
		} finally {
			// then
			verify(delegate).findClass(eq("foo"));
			verify(foo).isSuperclass();
		}
	}

	@Test(expected = AuthException.class)
	public void cardClassHasNoWritePrivilegesOnCreationWithDomainAttributesManagement() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final CMClass foo = mockito.mock(CMClass.class);
		doReturn(foo) //
				.when(delegate).findClass(anyString());
		doReturn(false) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();

		// when
		try {
			underTest.createCard(card, true);
		} finally {
			// then
			verify(delegate).findClass(eq("foo"));
			verify(foo).isSuperclass();
			verify(privilegeContext).hasWriteAccess(eq(foo));
		}
	}

	@Test(expected = AuthException.class)
	public void cardClassNotFoundOnCreationWithDomainAttributesManagement() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		doReturn(null) //
				.when(delegate).findClass(anyString());
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();

		// when
		try {
			underTest.createCard(card, true);
		} finally {
			// then
			verify(delegate).findClass(eq("foo"));
		}
	}

	@Test
	public void eachCardIsVerifiedBeforeMassiveUpdate() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final Collection<Card> cards = new ArrayList<>();
		cards.add(Card.newInstance() //
				.withClassName("foo") //
				.build());
		cards.add(Card.newInstance() //
				.withClassName("bar") //
				.build());
		final CMClass foo = mockito.mock(CMClass.class);
		final CMClass bar = mockito.mock(CMClass.class);
		doReturn(foo).doReturn(bar) //
				.when(delegate).findClass(anyString());
		doReturn(true) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));

		// when
		underTest.updateCards(cards);

		// then
		verify(delegate).findClass(eq("foo"));
		verify(foo).isSuperclass();
		verify(privilegeContext).hasWriteAccess(eq(foo));
		verify(delegate).findClass(eq("bar"));
		verify(bar).isSuperclass();
		verify(privilegeContext).hasWriteAccess(eq(bar));
		verify(delegate).updateCards(eq(cards));
	}

	@Test(expected = AuthException.class)
	public void classIsSuperclassOnMassiveUpdate() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final Collection<Card> cards = new ArrayList<>();
		cards.add(Card.newInstance() //
				.withClassName("foo") //
				.build());
		final CMClass foo = mockito.mock(CMClass.class);
		doReturn(true) //
				.when(foo).isSuperclass();
		doReturn(foo) //
				.when(delegate).findClass(anyString());

		try {
			// when
			underTest.updateCards(cards);
		} finally {
			// then
			verify(delegate).findClass(eq("foo"));
			verify(foo).isSuperclass();
		}
	}

	@Test(expected = AuthException.class)
	public void classHasNoWritePrivilegesOnMassiveUpdate() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final Collection<Card> cards = new ArrayList<>();
		cards.add(Card.newInstance() //
				.withClassName("foo") //
				.build());
		final CMClass foo = mockito.mock(CMClass.class);
		doReturn(foo) //
				.when(delegate).findClass(anyString());
		doReturn(false) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));

		try {
			// when
			underTest.updateCards(cards);
		} finally {
			// then
			verify(delegate).findClass(eq("foo"));
			verify(foo).isSuperclass();
			verify(privilegeContext).hasWriteAccess(eq(foo));
		}
	}

	@Test(expected = AuthException.class)
	public void classNotFoundOnMassiveUpdate() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final Collection<Card> cards = new ArrayList<>();
		cards.add(Card.newInstance() //
				.withClassName("foo") //
				.build());
		doReturn(null) //
				.when(delegate).findClass(anyString());

		try {
			// when
			underTest.updateCards(cards);
		} finally {
			// then
			verify(delegate).findClass(eq("foo"));
		}
	}

	@Test
	public void fetchedCardIsVerifiedBeforeUpdate() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();
		final Map<String, Object> attributes = new HashMap<>();
		final CMClass foo = mockito.mock(CMClass.class);
		doReturn(foo) //
				.when(delegate).findClass(anyString());
		doReturn(true) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));

		// when
		underTest.updateFetchedCard(card, attributes);

		// then
		verify(delegate).findClass(eq("foo"));
		verify(foo).isSuperclass();
		verify(privilegeContext).hasWriteAccess(eq(foo));
		verify(delegate).updateFetchedCard(card, attributes);
	}

	@Test(expected = AuthException.class)
	public void fetchedCardClassIsSuperclassOnUpdate() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();
		final Map<String, Object> attributes = new HashMap<>();
		final CMClass foo = mockito.mock(CMClass.class);
		doReturn(true) //
				.when(foo).isSuperclass();
		doReturn(foo) //
				.when(delegate).findClass(anyString());
		doReturn(false) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));

		try {
			// when
			underTest.updateFetchedCard(card, attributes);
		} finally {
			// then
			verify(delegate).findClass(eq("foo"));
			verify(foo).isSuperclass();
		}
	}

	@Test(expected = AuthException.class)
	public void fetchedCardClassHasNoWritePrivilegesOnUpdate() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();
		final Map<String, Object> attributes = new HashMap<>();
		final CMClass foo = mockito.mock(CMClass.class);
		doReturn(foo) //
				.when(delegate).findClass(anyString());
		doReturn(false) //
				.when(privilegeContext).hasWriteAccess(any(CMPrivilegedObject.class));

		try {
			// when
			underTest.updateFetchedCard(card, attributes);
		} finally {
			// then
			verify(delegate).findClass(eq("foo"));
			verify(foo).isSuperclass();
			verify(privilegeContext).hasWriteAccess(eq(foo));
		}
	}

	@Test(expected = AuthException.class)
	public void fetchedCardClassNotFoundOnUpdate() throws Exception {
		// given
		final DataAccessLogic delegate = mockito.mock(DataAccessLogic.class);
		final PrivilegeContext privilegeContext = mockito.mock(PrivilegeContext.class);
		final PrivilegedDataAccessLogic underTest = new PrivilegedDataAccessLogic(delegate, privilegeContext);
		final Card card = Card.newInstance() //
				.withClassName("foo") //
				.build();
		final Map<String, Object> attributes = new HashMap<>();
		doReturn(null) //
				.when(delegate).findClass(anyString());

		try {
			// when
			underTest.updateFetchedCard(card, attributes);
		} finally {
			// then
			verify(delegate).findClass(eq("foo"));
		}
	}

}

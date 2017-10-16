package integration.logic.data.filter;

import static com.google.common.collect.Iterables.get;
import static com.google.common.collect.Iterables.size;
import static org.cmdbuild.logic.mapping.json.Constants.Filters.CLASSNAME_KEY;
import static org.cmdbuild.logic.mapping.json.Constants.Filters._TYPE;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;
import static utils.IntegrationTestUtils.newClass;
import static utils.IntegrationTestUtils.newSuperClass;
import static utils.IntegrationTestUtils.newTextAttribute;

import java.util.Comparator;

import org.cmdbuild.dao.entrytype.DBClass;
import org.cmdbuild.logic.data.QueryOptions;
import org.cmdbuild.logic.mapping.json.Constants.FilterOperator;
import org.cmdbuild.model.data.Card;
import org.json.JSONObject;
import org.junit.After;
import org.junit.Test;

import com.google.common.collect.Ordering;

public class SubclassFilterTest extends FilteredCardsFixture {

	private DBClass A;
	private DBClass C;
	private DBClass D;
	private DBClass B;
	private DBClass E;

	@Override
	protected void initializeDatabaseData() {
		A = dbDataView().create(newSuperClass("A"));
		B = dbDataView().create(newClass("B", A));
		C = dbDataView().create(newSuperClass("C", A));
		D = dbDataView().create(newClass("D", C));
		E = dbDataView().create(newClass("E", A));

		dbDataView().createAttribute(newTextAttribute("foo", B));
		dbDataView().createAttribute(newTextAttribute("foo", D));
	}

	@Override
	@After
	public void tearDown() {
		dbDataView().clear(E);
		dbDataView().delete(E);

		dbDataView().clear(B);
		dbDataView().delete(B);

		dbDataView().clear(D);
		dbDataView().delete(D);

		dbDataView().clear(C);
		dbDataView().delete(C);

		dbDataView().clear(A);
		dbDataView().delete(A);
	}

	@Test
	public void cardsFilteredUsingSpecificSubclassAttribute() throws Exception {
		// given
		dbDataView().createCardFor(B) //
				.set("foo", B.getName()) //
				.save() //
				.getId();
		final Long id = dbDataView().createCardFor(D) //
				.set("foo", D.getName()) //
				.save() //
				.getId();
		dbDataView().createCardFor(E) //
				.save() //
				.getId();
		final JSONObject filterObject = new JSONObject("" //
				+ "{" //
				+ "	attribute: {" //
				+ "		simple: {" //
				+ "			" + CLASSNAME_KEY + ": " + D.getName() + "," //
				+ "			attribute: " + "foo" + "," //
				+ "			operator: " + FilterOperator.EQUAL.toString() + "," //
				+ "			value:[" + D.getName() + "]" //
				+ "		}" //
				+ "	}" //
				+ "}");
		final QueryOptions queryOptions = createQueryOptions(10, 0, null, filterObject);

		// when
		final Iterable<Card> cards = dataAccessLogic.fetchCards(A.getName(), queryOptions).elements();

		// then
		assertThat(size(cards), equalTo(1));
		assertThat(get(cards, 0).getId(), equalTo(id));
	}

	@Test
	public void cardsFilteredUsingSpecificSubclassType() throws Exception {
		// given
		final Long cardOfB = dbDataView().createCardFor(B) //
				.save() //
				.getId();
		final Long cardOfD = dbDataView().createCardFor(D) //
				.save() //
				.getId();
		dbDataView().createCardFor(E) //
				.save() //
				.getId();
		final JSONObject filterObject = new JSONObject("" //
				+ "{" //
				+ "	attribute: {" //
				+ "		simple: {" //
				+ "			attribute: " + _TYPE + "," //
				+ "			operator: " + FilterOperator.IN.toString() + "," //
				+ "			value:[" + B.getName() + "," + D.getName() + "]" //
				+ "		}" //
				+ "	}" //
				+ "}");
		final QueryOptions queryOptions = createQueryOptions(10, 0, null, filterObject);

		// when
		final Iterable<Card> cards = dataAccessLogic.fetchCards(A.getName(), queryOptions).elements();

		// then
		final Iterable<Card> ordered = Ordering.from(new Comparator<Card>() {

			@Override
			public int compare(final Card o1, final Card o2) {
				return Long.compare(o1.getId(), o2.getId());
			}

		}).immutableSortedCopy(cards);
		assertThat(size(ordered), equalTo(2));
		assertThat(get(ordered, 0).getId(), equalTo(cardOfB));
		assertThat(get(ordered, 1).getId(), equalTo(cardOfD));
	}

}

package unit.cxf;

import static com.google.common.collect.Maps.immutableEntry;
import static com.google.common.collect.Sets.newHashSet;
import static java.lang.String.format;
import static java.util.Arrays.asList;
import static java.util.Collections.emptyList;
import static org.cmdbuild.service.rest.v2.constants.Serialization.MAP_STYLE;
import static org.cmdbuild.service.rest.v2.constants.Serialization.ZOOM_MAX;
import static org.cmdbuild.service.rest.v2.constants.Serialization.ZOOM_MIN;
import static org.cmdbuild.service.rest.v2.model.Models.newAttribute2;
import static org.cmdbuild.service.rest.v2.model.Models.newGeometry;
import static org.cmdbuild.service.rest.v2.model.Models.newMetadata;
import static org.cmdbuild.service.rest.v2.model.Models.newPoint;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import java.util.HashMap;

import javax.ws.rs.WebApplicationException;

import org.cmdbuild.common.collect.ChainablePutMap;
import org.cmdbuild.logic.GISLogic;
import org.cmdbuild.model.data.Card;
import org.cmdbuild.model.gis.LayerMetadata;
import org.cmdbuild.service.rest.v2.cxf.CxfGeometries;
import org.cmdbuild.service.rest.v2.cxf.ErrorHandlerFacade;
import org.cmdbuild.service.rest.v2.model.Attribute2;
import org.cmdbuild.service.rest.v2.model.Geometry;
import org.cmdbuild.service.rest.v2.model.ResponseMultiple;
import org.cmdbuild.service.rest.v2.model.ResponseSingle;
import org.cmdbuild.services.gis.GeoFeature;
import org.junit.Before;
import org.junit.Test;
import org.postgis.LineString;
import org.postgis.LinearRing;
import org.postgis.Point;
import org.postgis.Polygon;

public class CxfGeometriesTest {

	private static class DummyException extends Exception {

		private static final long serialVersionUID = 1L;

	}

	private ErrorHandlerFacade errorHandlerFacade;
	private GISLogic gisLogic;
	private CxfGeometries underTest;

	@Before
	public void setUp() throws Exception {
		errorHandlerFacade = mock(ErrorHandlerFacade.class);
		gisLogic = mock(GISLogic.class);
		underTest = new CxfGeometries(errorHandlerFacade, gisLogic);
	}

	@Test(expected = WebApplicationException.class)
	public void errorWhenGettingAllAttributesBecauseClassIsNotFound() throws Exception {
		// given
		doThrow(WebApplicationException.class) //
				.when(errorHandlerFacade).checkClass(anyString());

		// when
		try {
			underTest.readAllAttributes("foo", 2, 1, true);
		} catch (final Exception e) {
			// then
			verify(errorHandlerFacade).checkClass(eq("foo"));
			verifyNoMoreInteractions(errorHandlerFacade, gisLogic);
			throw e;
		}

	}

	@Test(expected = WebApplicationException.class)
	public void errorWhenGettingAllAttributes() throws Exception {
		// given
		doThrow(DummyException.class) //
				.when(gisLogic).list();
		doThrow(WebApplicationException.class) //
				.when(errorHandlerFacade).propagate(any(Throwable.class));

		// when
		try {
			underTest.readAllAttributes("foo", 2, 1, true);
		} catch (final Exception e) {
			// then
			verify(errorHandlerFacade).checkClass(eq("foo"));
			verify(gisLogic).list();
			verify(errorHandlerFacade).propagate(any(DummyException.class));
			verifyNoMoreInteractions(errorHandlerFacade, gisLogic);
			throw e;
		}

	}

	@Test
	public void gettingAllAttributes() throws Exception {
		// given
		doReturn(asList( //
				layerMetadata("foo", "1"), //
				layerMetadata("bar", "not important"), //
				layerMetadata("baz", "not important"), //
				layerMetadata("foo", "2"), //
				layerMetadata("foo", "3"), //
				layerMetadata("foo", "4")) //
		).when(gisLogic).list();

		// when
		final ResponseMultiple<Attribute2> response = underTest.readAllAttributes("foo", 1, 2, false);

		// then
		verify(errorHandlerFacade).checkClass(eq("foo"));
		verify(gisLogic).list();
		verifyNoMoreInteractions(errorHandlerFacade, gisLogic);

		assertThat(response.getElements(),
				contains(
						newAttribute2() //
								.withId("2") //
								.withIndex(0) //
								.build(),
						newAttribute2() //
								.withId("3") //
								.withIndex(0) //
								.build()));
		assertThat(response.getMetadata(),
				equalTo(newMetadata() //
						.withTotal(4) //
						.build()));
	}

	@Test(expected = WebApplicationException.class)
	public void errorWhenGettingAttributeDetailBecauseClassIsNotFound() throws Exception {
		// given
		doThrow(WebApplicationException.class) //
				.when(errorHandlerFacade).checkClass(anyString());

		// when
		try {
			underTest.readAttribute("foo", "bar");
		} catch (final Exception e) {
			// then
			verify(errorHandlerFacade).checkClass(eq("foo"));
			verifyNoMoreInteractions(errorHandlerFacade, gisLogic);
			throw e;
		}

	}

	@Test(expected = WebApplicationException.class)
	public void errorWhenGettingAttributeDetail() throws Exception {
		// given
		doThrow(DummyException.class) //
				.when(gisLogic).list();
		doThrow(WebApplicationException.class) //
				.when(errorHandlerFacade).propagate(any(Throwable.class));

		// when
		try {
			underTest.readAttribute("foo", "bar");
		} catch (final Exception e) {
			// then
			verify(errorHandlerFacade).checkClass(eq("foo"));
			verify(gisLogic).list();
			verify(errorHandlerFacade).propagate(any(DummyException.class));
			verifyNoMoreInteractions(errorHandlerFacade, gisLogic);
			throw e;
		}

	}

	@Test
	public void gettingAttributeDetail() throws Exception {
		// given
		doReturn(asList( //
				layerMetadata("foo", "1"), //
				layerMetadata("foo", "2", "this is 2", 1, 2, 3, "{\"a\": \"A\", \"b\": 42}"), //
				layerMetadata("bar", "3"), //
				layerMetadata("baz", "4")) //
		).when(gisLogic).list();

		// when
		final ResponseSingle<Attribute2> response = underTest.readAttribute("foo", "2");

		// then
		verify(errorHandlerFacade).checkClass(eq("foo"));
		verify(gisLogic).list();
		verifyNoMoreInteractions(errorHandlerFacade, gisLogic);

		assertThat(response.getElement(),
				equalTo(newAttribute2() //
						.withId("2") //
						.withName("2") //
						.withDescription("this is 2") //
						.withType("geometry") //
						.withSubtype("point") //
						.withIndex(1) //
						.withMetadata(ChainablePutMap.of(new HashMap<String, Object>()) //
								.chainablePut(ZOOM_MIN, 2) //
								.chainablePut(ZOOM_MAX, 3) //
								.chainablePut(MAP_STYLE,
										ChainablePutMap.of(new HashMap<String, Object>()) //
												.chainablePut("a", "A") //
												.chainablePut("b", 42))) //
						.build()));
	}

	@Test(expected = WebApplicationException.class)
	public void errorWhenGettingAllGeometriesBecauseClassIsNotFound() throws Exception {
		// given
		doThrow(WebApplicationException.class) //
				.when(errorHandlerFacade).checkClass(anyString());

		// when
		try {
			underTest.readAllGeometries("foo", newHashSet("bar"), newHashSet("baz"), 456, 123, true);
		} catch (final Exception e) {
			// then
			verify(errorHandlerFacade).checkClass(eq("foo"));
			verifyNoMoreInteractions(errorHandlerFacade, gisLogic);
			throw e;
		}

	}

	@Test
	public void gettingAllGeometriesWithBlankAttributeReturnsNoElements() throws Exception {
		// when
		final ResponseMultiple<Geometry> response =
				underTest.readAllGeometries("foo", newHashSet(" "), newHashSet("baz"), 456, 123, true);

		// then
		verify(errorHandlerFacade).checkClass(eq("foo"));
		verifyNoMoreInteractions(errorHandlerFacade, gisLogic);

		assertThat(response.getElements(), hasSize(0));
		assertThat(response.getMetadata(),
				equalTo(newMetadata() //
						.withTotal(0) //
						.build()));
	}

	@Test(expected = WebApplicationException.class)
	public void errorWhenGettingAllGeometriesBecauseAttributeIsNotFound() throws Exception {
		// given
		doReturn(emptyList()) //
				.when(gisLogic).list();
		doThrow(WebApplicationException.class) //
				.when(errorHandlerFacade).attributeNotFound(anyString());

		// when
		try {
			underTest.readAllGeometries("foo", newHashSet("bar"), newHashSet("baz"), 456, 123, true);
		} catch (final Exception e) {
			// then
			verify(errorHandlerFacade).checkClass(eq("foo"));
			verify(gisLogic).list();
			verify(errorHandlerFacade).attributeNotFound(eq("bar"));
			verifyNoMoreInteractions(errorHandlerFacade, gisLogic);
			throw e;
		}

	}

	@Test
	public void gettingAllGeometriesWithBlankAreaReturnsNoElements() throws Exception {
		// when
		final ResponseMultiple<Geometry> response =
				underTest.readAllGeometries("foo", newHashSet("bar"), newHashSet(" "), 456, 123, true);

		// then
		verify(errorHandlerFacade).checkClass(eq("foo"));
		verifyNoMoreInteractions(errorHandlerFacade, gisLogic);

		assertThat(response.getElements(), hasSize(0));
		assertThat(response.getMetadata(),
				equalTo(newMetadata() //
						.withTotal(0) //
						.build()));
	}

	@Test(expected = WebApplicationException.class)
	public void errorWhenGettingAllGeometries() throws Exception {
		// given
		doReturn(asList(layerMetadata("foo", "bar"))) //
				.when(gisLogic).list();
		doThrow(DummyException.class) //
				.when(gisLogic).getFeatures(anyString(), anyString(), anyString());
		doThrow(WebApplicationException.class) //
				.when(errorHandlerFacade).propagate(any(Throwable.class));

		// when
		try {
			underTest.readAllGeometries("foo", newHashSet("bar"), newHashSet("baz"), 456, 123, true);
		} catch (final Exception e) {
			// then
			verify(errorHandlerFacade).checkClass(eq("foo"));
			verify(gisLogic).list();
			verify(gisLogic).getFeatures(eq("foo"), eq("bar"), eq("baz"));
			verify(errorHandlerFacade).propagate(any(DummyException.class));
			verifyNoMoreInteractions(errorHandlerFacade, gisLogic);
			throw e;
		}

	}

	@Test
	public void gettingAllGeometries() throws Exception {
		// given
		doReturn(asList(layerMetadata("foo", "bar"))) //
				.when(gisLogic).list();
		doReturn(asList( //
				geoFeature(1L), //
				geoFeature(2L), //
				geoFeature(3L), //
				geoFeature(4L) //
		)).when(gisLogic).getFeatures(anyString(), anyString(), anyString());

		// when
		final ResponseMultiple<Geometry> response =
				underTest.readAllGeometries("foo", newHashSet("bar"), newHashSet("baz"), 1, 2, false);

		// then
		verify(errorHandlerFacade).checkClass(eq("foo"));
		verify(gisLogic).list();
		verify(gisLogic).getFeatures(eq("foo"), eq("bar"), eq("baz"));
		verifyNoMoreInteractions(errorHandlerFacade, gisLogic);

		assertThat(response.getElements(),
				contains(
						newGeometry() //
								.withId(2L) //
								.build(),
						newGeometry() //
								.withId(3L) //
								.build()));
		assertThat(response.getMetadata(),
				equalTo(newMetadata() //
						.withTotal(4) //
						.build()));
	}

	@Test(expected = WebApplicationException.class)
	public void errorWhenGettingGeometryDetailBecauseClassIsNotFound() throws Exception {
		// given
		doThrow(WebApplicationException.class) //
				.when(errorHandlerFacade).checkClass(anyString());

		// when
		try {
			underTest.readGeometry("foo", 42L);
		} catch (final Exception e) {
			// then
			verify(errorHandlerFacade).checkClass(eq("foo"));
			verifyNoMoreInteractions(errorHandlerFacade, gisLogic);
			throw e;
		}

	}

	@Test(expected = WebApplicationException.class)
	public void errorWhenGettingGeometryDetail() throws Exception {
		// given
		doThrow(DummyException.class) //
				.when(gisLogic).getFeature(any(Card.class));
		doThrow(WebApplicationException.class) //
				.when(errorHandlerFacade).propagate(any(Throwable.class));

		// when
		try {
			underTest.readGeometry("foo", 42L);
		} catch (final Exception e) {
			// then
			verify(errorHandlerFacade).checkClass(eq("foo"));
			verify(gisLogic).getFeature(eq(Card.newInstance() //
					.withClassName("foo") //
					.withId(42L) //
					.build()));
			verify(errorHandlerFacade).propagate(any(DummyException.class));
			verifyNoMoreInteractions(errorHandlerFacade, gisLogic);
			throw e;
		}

	}

	@Test
	public void gettingGeometryDetailForPoint() throws Exception {
		// given
		final Point geometry = new Point(1.23, 4.56);
		doReturn(immutableEntry("bar", geoFeature(1L, geometry))) //
				.when(gisLogic).getFeature(any(Card.class));

		// when
		final ResponseSingle<Geometry> response = underTest.readGeometry("foo", 42L);

		// then
		verify(errorHandlerFacade).checkClass(eq("foo"));
		verify(gisLogic).getFeature(eq(Card.newInstance() //
				.withClassName("foo") //
				.withId(42L) //
				.build()));
		verifyNoMoreInteractions(errorHandlerFacade, gisLogic);

		assertThat(response.getElement(),
				equalTo(newGeometry() //
						.withId(1L) //
						.withValues(ChainablePutMap.of(new HashMap<String, Object>()) //
								.chainablePut("bar",
										newPoint() //
												.withX(1.23) //
												.withY(4.56) //
												.build())) //
						.build()));
	}

	@Test
	public void gettingGeometryDetailForLine() throws Exception {
		// given
		final LineString geometry = new LineString(new Point[] { new Point(1, 2), new Point(3, 4) });
		doReturn(immutableEntry("bar", geoFeature(1L, geometry))) //
				.when(gisLogic).getFeature(any(Card.class));

		// when
		final ResponseSingle<Geometry> response = underTest.readGeometry("foo", 42L);

		// then
		verify(errorHandlerFacade).checkClass(eq("foo"));
		verify(gisLogic).getFeature(eq(Card.newInstance() //
				.withClassName("foo") //
				.withId(42L) //
				.build()));
		verifyNoMoreInteractions(errorHandlerFacade, gisLogic);

		assertThat(response.getElement(),
				equalTo(newGeometry() //
						.withId(1L) //
						.withValues(ChainablePutMap.of(new HashMap<String, Object>()) //
								.chainablePut("bar",
										asList( //
												newPoint() //
														.withX(1) //
														.withY(2) //
														.build(),
												newPoint() //
														.withX(3) //
														.withY(4) //
														.build()))) //
						.build()));
	}

	@Test
	public void gettingGeometryDetailForPolygon() throws Exception {
		// given
		final Polygon geometry =
				new Polygon(new LinearRing[] { new LinearRing(new Point[] { new Point(1, 2), new Point(3, 4) }),
						new LinearRing(new Point[] { new Point(5, 6) }),
						new LinearRing(new Point[] { new Point(7, 8), new Point(9, 0) }) });
		doReturn(immutableEntry("bar", geoFeature(1L, geometry))) //
				.when(gisLogic).getFeature(any(Card.class));

		// when
		final ResponseSingle<Geometry> response = underTest.readGeometry("foo", 42L);

		// then
		verify(errorHandlerFacade).checkClass(eq("foo"));
		verify(gisLogic).getFeature(eq(Card.newInstance() //
				.withClassName("foo") //
				.withId(42L) //
				.build()));
		verifyNoMoreInteractions(errorHandlerFacade, gisLogic);

		assertThat(response.getElement(),
				equalTo(newGeometry() //
						.withId(1L) //
						.withValues(ChainablePutMap.of(new HashMap<String, Object>()) //
								.chainablePut("bar",
										asList( //
												newPoint() //
														.withX(1) //
														.withY(2) //
														.build(),
												newPoint() //
														.withX(3) //
														.withY(4) //
														.build(),
												newPoint() //
														.withX(5) //
														.withY(6) //
														.build(),
												newPoint() //
														.withX(7) //
														.withY(8) //
														.build(),
												newPoint() //
														.withX(9) //
														.withY(0) //
														.build()))) //
						.build()));
	}

	/*
	 * Utilities
	 */

	private static LayerMetadata layerMetadata(final String clazz, final String attribute) {
		return layerMetadata(clazz, attribute, null, 0, 0, 0, null);
	}

	private static LayerMetadata layerMetadata(final String clazz, final String attribute, final String description,
			final int index, final int minZoom, final int maxZoom, final String style) {
		return new LayerMetadata() {
			{
				setFullName(format(TARGET_TABLE_FORMAT + "_%s", clazz, attribute));
				setName(attribute);
				setDescription(description);
				setType("POINT");
				setIndex(index);
				setMinimumZoom(minZoom);
				setMaximumzoom(maxZoom);
				setMapStyle(style);
			}
		};
	}

	private static GeoFeature geoFeature(final Long id) {
		return geoFeature(id, null);
	}

	private static GeoFeature geoFeature(final Long id, final org.postgis.Geometry geoFeature) {
		final GeoFeature output = mock(GeoFeature.class);
		doReturn(id) //
				.when(output).getOwnerCardId();
		doReturn(geoFeature) //
				.when(output).getGeometry();
		return output;
	}

}

package org.cmdbuild.service.rest.v2.cxf;

import static com.google.common.base.Predicates.and;
import static com.google.common.base.Predicates.compose;
import static com.google.common.base.Predicates.equalTo;
import static com.google.common.collect.FluentIterable.from;
import static com.google.common.collect.Iterables.size;
import static com.google.common.reflect.Reflection.newProxy;
import static java.lang.Integer.MAX_VALUE;
import static java.lang.String.format;
import static java.util.Arrays.asList;
import static java.util.Arrays.stream;
import static java.util.Collections.emptyList;
import static org.apache.commons.lang3.ObjectUtils.defaultIfNull;
import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.cmdbuild.common.utils.Reflection.unsupported;
import static org.cmdbuild.model.gis.Functions.masterTableName;
import static org.cmdbuild.model.gis.Functions.name;
import static org.cmdbuild.service.rest.v2.constants.Serialization.MAP_STYLE;
import static org.cmdbuild.service.rest.v2.constants.Serialization.ZOOM_MAX;
import static org.cmdbuild.service.rest.v2.constants.Serialization.ZOOM_MIN;
import static org.cmdbuild.service.rest.v2.model.Models.newAttribute2;
import static org.cmdbuild.service.rest.v2.model.Models.newGeometry;
import static org.cmdbuild.service.rest.v2.model.Models.newMetadata;
import static org.cmdbuild.service.rest.v2.model.Models.newPoint;
import static org.cmdbuild.service.rest.v2.model.Models.newResponseMultiple;
import static org.cmdbuild.service.rest.v2.model.Models.newResponseSingle;
import static org.postgis.Geometry.LINESTRING;
import static org.postgis.Geometry.POINT;
import static org.postgis.Geometry.POLYGON;
import static org.postgis.Geometry.getTypeString;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.cmdbuild.common.collect.ChainablePutMap;
import org.cmdbuild.logic.ForwardingGisLogic;
import org.cmdbuild.logic.GISLogic;
import org.cmdbuild.model.data.Card;
import org.cmdbuild.model.gis.LayerMetadata;
import org.cmdbuild.service.rest.v2.Geometries;
import org.cmdbuild.service.rest.v2.model.Attribute2;
import org.cmdbuild.service.rest.v2.model.Geometry;
import org.cmdbuild.service.rest.v2.model.ResponseMultiple;
import org.cmdbuild.service.rest.v2.model.ResponseSingle;
import org.cmdbuild.services.gis.ForwardingGeoFeature;
import org.cmdbuild.services.gis.GeoFeature;
import org.codehaus.jackson.map.ObjectMapper;
import org.postgis.LineString;
import org.postgis.LinearRing;
import org.postgis.Point;
import org.postgis.Polygon;

import com.google.common.base.Function;
import com.google.common.base.Supplier;

public class CxfGeometries implements Geometries {

	/**
	 * It's not the right moment for review {@link GISLogic} definition, so that
	 * this class is used for removing some annoying exceptions.
	 */
	private static final class GisLogicWithLessExceptions extends ForwardingGisLogic {

		private static final GISLogic UNSUPPORTED = newProxy(GISLogic.class, unsupported("should not be used"));

		private final GISLogic delegate;
		private final ErrorHandlerFacade errorHandlerFacade;

		public GisLogicWithLessExceptions(final GISLogic logic, final ErrorHandlerFacade errorHandler) {
			this.errorHandlerFacade = errorHandler;
			this.delegate = logic;
		}

		@Override
		protected GISLogic delegate() {
			return UNSUPPORTED;
		}

		@Override
		public List<LayerMetadata> list() {
			try {
				return delegate.list();
			} catch (final Exception e) {
				errorHandlerFacade.propagate(e);
				throw new AssertionError("should not come here", e);
			}
		}

		@Override
		public List<GeoFeature> getFeatures(final String masterClassName, final String layerName, final String bbox) {
			try {
				return delegate.getFeatures(masterClassName, layerName, bbox);
			} catch (final Exception e) {
				errorHandlerFacade.propagate(e);
				throw new AssertionError("should not come here", e);
			}
		}

		@Override
		public Entry<String, GeoFeature> getFeature(final Card card) {
			try {
				return delegate.getFeature(card);
			} catch (final Exception e) {
				errorHandlerFacade.propagate(e);
				throw new AssertionError("should not come here", e);
			}
		}

	}

	private static class GeoFeatureWithAttribute extends ForwardingGeoFeature {

		private final GeoFeature delegate;
		private final String attribute;

		private GeoFeatureWithAttribute(final GeoFeature delegate, final String attribute) {
			this.delegate = delegate;
			this.attribute = attribute;
		}

		@Override
		protected GeoFeature delegate() {
			return delegate;
		}

		public String getAttribute() {
			return attribute;
		}

	}

	private static enum AttributeSerialization implements Function<LayerMetadata, Attribute2> {

		SIMPLE {

			@Override
			public Attribute2 apply(final LayerMetadata input) {
				return newAttribute2() //
						.withId(input.getName()) //
						.withDescription(input.getDescription()) //
						.withIndex(input.getIndex()) //
						.build();
			}

		}, //
		DETAILED {

			private static final String TYPE_GEOMETRY = "geometry";
			private final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

			@Override
			public Attribute2 apply(final LayerMetadata input) {
				return newAttribute2() //
						.withId(input.getName()) //
						.withName(input.getName()) //
						.withDescription(input.getDescription()) //
						.withType(typeOf(input)) //
						.withSubtype(subtypeOf(input)) //
						.withIndex(input.getIndex()) //
						.withMetadata(metadataOf(input)) //
						.build();
			}

			private String typeOf(final LayerMetadata input) {
				return TYPE_GEOMETRY;
			}

			private String subtypeOf(final LayerMetadata input) {
				return Subtype.of(input.getType()).id();
			}

			private Map<String, Object> metadataOf(final LayerMetadata input) {
				return ChainablePutMap.of(new HashMap<String, Object>()) //
						.chainablePut(ZOOM_MIN, input.getMinimumZoom()) //
						.chainablePut(ZOOM_MAX, input.getMaximumzoom()) //
						.chainablePut(MAP_STYLE, mapStyle(input.getMapStyle()));
			}

			@SuppressWarnings("unchecked")
			private Map<String, Object> mapStyle(final String value) {
				try {
					return OBJECT_MAPPER.readValue(value, Map.class);
				} catch (final Exception e) {
					throw new RuntimeException(e);
				}
			}

		}, //
		;

	}

	private static enum Subtype {

		LINESTRING("line"), //
		POINT("point"), //
		POLYGON("polygon"), //
		UNKNOWN(null), //
		;

		private final String id;

		private Subtype(final String id) {
			this.id = id;
		}

		public String id() {
			return id;
		};

		public static Subtype of(final String type) {
			return stream(values()) //
					.filter(input -> input.name().equalsIgnoreCase(type)) //
					.findFirst() //
					.orElse(UNKNOWN);
		}

	}

	private static enum GeometrySerialization implements Function<GeoFeatureWithAttribute, Geometry> {

		SIMPLE {

			@Override
			public Geometry apply(final GeoFeatureWithAttribute input) {
				return newGeometry() //
						.withId(input.getOwnerCardId()) //
						.build();
			}

		}, //
		DETAILED {

			@Override
			public Geometry apply(final GeoFeatureWithAttribute input) {
				return newGeometry() //
						.withId(input.getOwnerCardId()) //
						.withValues(ChainablePutMap.of(new HashMap<String, Object>()) //
								.chainablePut(input.getAttribute(), valueOf(input))) //
						.build();
			}

			private Object valueOf(final GeoFeature input) {
				final org.postgis.Geometry geometry = input.getGeometry();
				final Object output;
				switch (geometry.getType()) {
				case LINESTRING: {
					final LineString _geometry = LineString.class.cast(geometry);
					final Collection<Geometry.Point> points = new ArrayList<>();
					for (final Point point : _geometry.getPoints()) {
						points.add(newPoint() //
								.withX(point.getX()) //
								.withY(point.getY()) //
								.build());
					}
					output = points;
					break;
				}

				case POINT: {
					final Point _geometry = Point.class.cast(geometry);
					output = newPoint() //
							.withX(_geometry.getX()) //
							.withY(_geometry.getY()) //
							.build();
					break;
				}

				case POLYGON: {
					final Polygon _geometry = Polygon.class.cast(geometry);
					final Collection<Geometry.Point> points = new ArrayList<>();
					int i;
					LinearRing ring;
					for (i = 0, ring = _geometry.getRing(i); ring != null; ring = _geometry.getRing(++i)) {
						for (final Point point : ring.getPoints()) {
							points.add(newPoint() //
									.withX(point.getX()) //
									.withY(point.getY()) //
									.build());
						}
					}
					output = points;
					break;
				}

				default: {
					// TODO do it better
					throw new RuntimeException(format("Type '%s' not supported", getTypeString(geometry.getType())));
				}
				}
				return output;
			}

		}, //
		;

	}

	private final ErrorHandlerFacade errorHandlerFacade;
	private final GisLogicWithLessExceptions logic;

	public CxfGeometries(final ErrorHandlerFacade errorHandlerFacade, final GISLogic logic) {
		this.errorHandlerFacade = errorHandlerFacade;
		this.logic = new GisLogicWithLessExceptions(logic, errorHandlerFacade);
	}

	@Override
	public ResponseMultiple<Attribute2> readAllAttributes(final String classId, final Integer offset,
			final Integer limit, final boolean detailed) {
		errorHandlerFacade.checkClass(classId);
		final Iterable<LayerMetadata> elements = from(logic.list()) //
				.filter(compose(equalTo(classId), masterTableName()));
		return newResponseMultiple(Attribute2.class) //
				.withElements(from(elements) //
						.skip(defaultIfNull(offset, 0)) //
						.limit(defaultIfNull(limit, MAX_VALUE)) //
						.transform(detailed ? AttributeSerialization.DETAILED : AttributeSerialization.SIMPLE)) //
				.withMetadata(newMetadata() //
						.withTotal(size(elements)) //
						.build())
				.build();
	}

	@Override
	public ResponseSingle<Attribute2> readAttribute(final String classId, final String attributeId) {
		errorHandlerFacade.checkClass(classId);
		return newResponseSingle(Attribute2.class) //
				.withElement(from(logic.list()) //
						.filter(and(compose(equalTo(classId), masterTableName()),
								compose(equalTo(attributeId), name())))
						.transform(AttributeSerialization.DETAILED) //
						.first() //
						.or(throwAttributeNotFound(attributeId))) //
				.build();
	}

	@Override
	public ResponseMultiple<Geometry> readAllGeometries(final String classId, final Set<? extends String> attributeIds,
			final Set<? extends String> areas, final Integer offset, final Integer limit, final boolean detailed) {
		errorHandlerFacade.checkClass(classId);
		// *** TEMPORARY IMPLEMENTATION ***
		final String attributeId = from(attributeIds).first().orNull();
		final String area = from(areas).first().orNull();
		//
		final Iterable<GeoFeature> elements;
		if (isBlank(area)) {
			elements = emptyList();
		} else if (isBlank(attributeId)) {
			elements = emptyList();
		} else {
			from(logic.list()) //
					.filter(and(compose(equalTo(classId), masterTableName()), compose(equalTo(attributeId), name())))
					.transform(AttributeSerialization.SIMPLE) //
					.first() //
					.or(throwAttributeNotFound(attributeId));
			elements = logic.getFeatures(classId, attributeId, area);
		}
		return newResponseMultiple(Geometry.class) //
				.withElements(from(elements) //
						.skip(defaultIfNull(offset, 0)) //
						.limit(defaultIfNull(limit, MAX_VALUE)) //
						.transform(new Function<GeoFeature, GeoFeatureWithAttribute>() {

							@Override
							public GeoFeatureWithAttribute apply(final GeoFeature input) {
								return new GeoFeatureWithAttribute(input, attributeId);
							}

						}) //
						.transform(detailed ? GeometrySerialization.DETAILED : GeometrySerialization.SIMPLE)) //
				.withMetadata(newMetadata() //
						.withTotal(size(elements)) //
						.build())
				.build();
	}

	@Override
	public ResponseSingle<Geometry> readGeometry(final String classId, final Long cardId) {
		errorHandlerFacade.checkClass(classId);
		return newResponseSingle(Geometry.class) //
				.withElement(from(asList(logic.getFeature(Card.newInstance() //
						.withClassName(classId) //
						.withId(cardId) //
						.build()))) //
								.transform(new Function<Entry<String, GeoFeature>, GeoFeatureWithAttribute>() {

									@Override
									public GeoFeatureWithAttribute apply(final Entry<String, GeoFeature> input) {
										return new GeoFeatureWithAttribute(input.getValue(), input.getKey());
									}

								}) //
								.transform(GeometrySerialization.DETAILED).first() //
								.get()) //
				.build();
	}

	private Supplier<Attribute2> throwAttributeNotFound(final String attributeId) {
		return new Supplier<Attribute2>() {

			@Override
			public Attribute2 get() {
				errorHandlerFacade.attributeNotFound(attributeId);
				throw new AssertionError("should not come here");
			}

		};
	}

}

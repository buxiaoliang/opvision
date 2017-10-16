package org.cmdbuild.service.rest.v2.model;

import static org.cmdbuild.service.rest.v2.constants.Serialization.GEOMETRY;
import static org.cmdbuild.service.rest.v2.constants.Serialization.POINT;
import static org.cmdbuild.service.rest.v2.constants.Serialization.VALUES;
import static org.cmdbuild.service.rest.v2.constants.Serialization.X;
import static org.cmdbuild.service.rest.v2.constants.Serialization.Y;

import java.util.Map;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

@XmlRootElement(name = GEOMETRY)
public class Geometry extends ModelWithLongId {

	@XmlRootElement(name = POINT)
	public static class Point extends AbstractModel {

		private double x;
		private double y;

		Point() {
			// package visibility
		}

		@XmlAttribute(name = X)
		public double getX() {
			return x;
		}

		void setX(final double x) {
			this.x = x;
		}

		@XmlAttribute(name = Y)
		public double getY() {
			return y;
		}

		void setY(final double y) {
			this.y = y;
		}

		@Override
		protected boolean doEquals(final Object obj) {
			if (this == obj) {
				return true;
			}

			if (!(obj instanceof Point)) {
				return false;
			}

			final Point other = Point.class.cast(obj);
			return new EqualsBuilder() //
					.append(this.x, other.x) //
					.append(this.y, other.y) //
					.isEquals();
		}

		@Override
		protected int doHashCode() {
			return new HashCodeBuilder() //
					.append(x) //
					.append(y) //
					.toHashCode();
		}

	}

	private Map<String, Object> values;

	Geometry() {
		// package visibility
	}

	@XmlElementWrapper(name = VALUES, nillable = true)
	public Map<String, Object> getValues() {
		return values;
	}

	void setValues(final Map<String, Object> values) {
		this.values = values;
	}

	@Override
	protected boolean doEquals(final Object obj) {
		if (this == obj) {
			return true;
		}

		if (!(obj instanceof Geometry)) {
			return false;
		}

		final Geometry other = Geometry.class.cast(obj);
		return new EqualsBuilder() //
				.append(this.getId(), other.getId()) //
				.append(this.values, other.values) //
				.isEquals();
	}

	@Override
	protected int doHashCode() {
		return new HashCodeBuilder() //
				.append(getId()) //
				.append(values) //
				.toHashCode();
	}

}

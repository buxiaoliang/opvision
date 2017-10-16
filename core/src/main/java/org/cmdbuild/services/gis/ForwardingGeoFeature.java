package org.cmdbuild.services.gis;

import org.postgis.Geometry;

import com.google.common.collect.ForwardingObject;

public abstract class ForwardingGeoFeature extends ForwardingObject implements GeoFeature {

	/**
	 * Usable by subclasses only.
	 */
	protected ForwardingGeoFeature() {
	}

	@Override
	protected abstract GeoFeature delegate();

	@Override
	public Geometry getGeometry() {
		return delegate().getGeometry();
	}

	@Override
	public Long getOwnerCardId() {
		return delegate().getOwnerCardId();
	}

	@Override
	public Long getClassIdOfOwnerCard() {
		return delegate().getClassIdOfOwnerCard();
	}

	@Override
	public String getClassNameOfOwnerCard() {
		return delegate().getClassNameOfOwnerCard();
	}

}

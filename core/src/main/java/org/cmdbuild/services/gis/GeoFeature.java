package org.cmdbuild.services.gis;

import org.postgis.Geometry;

public interface GeoFeature {

	Geometry getGeometry();

	Long getOwnerCardId();

	Long getClassIdOfOwnerCard();

	String getClassNameOfOwnerCard();

}

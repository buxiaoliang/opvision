package org.cmdbuild.bim.utils;

import org.apache.commons.lang3.StringUtils;

public class BimConstants {

	// IFC constants
	public static final String IFC_GLOBALID = "GlobalId";
	public static final String GLOBALID_ATTRIBUTE = IFC_GLOBALID;
	public static final String FK_COLUMN_NAME = "Master";

	// BimServer constants
	public static final String INVALID_ID = "-1";

	public static boolean isValidId(final String stringId) {
		return !StringUtils.isEmpty(stringId) && !stringId.equals(INVALID_ID);
	}

	private BimConstants() {
		throw new AssertionError();
	}
}

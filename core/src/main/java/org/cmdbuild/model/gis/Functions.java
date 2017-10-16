package org.cmdbuild.model.gis;

import com.google.common.base.Function;

public class Functions {

	private static enum TO_STRING implements Function<LayerMetadata, String> {

		MasterTableName {

			@Override
			public String apply(final LayerMetadata input) {
				return input.getMasterTableName();
			}

		}, //
		Name {

			@Override
			public String apply(final LayerMetadata input) {
				return input.getName();
			}

		}, //
		;

	}

	public static Function<LayerMetadata, String> masterTableName() {
		return TO_STRING.MasterTableName;
	}

	public static Function<LayerMetadata, String> name() {
		return TO_STRING.Name;
	}

	private Functions() {
		// prevents instantiation
	}

}

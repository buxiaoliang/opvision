package org.cmdbuild.config;

import static com.google.common.base.Preconditions.checkNotNull;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import static org.apache.commons.lang3.ObjectUtils.firstNonNull;

public class DefaultProperties {

	private final PropertyContainer propertyContainer;

	public DefaultProperties(PropertyContainer propertyContainer) {
		checkNotNull(propertyContainer);
		this.propertyContainer = propertyContainer;
	}

	public PropertyContainer getPropertyContainer() {
		return propertyContainer;
	}

	public void store() throws IOException {
		propertyContainer.store();
	}

	@Deprecated
	public File getPath() {
		return propertyContainer.getFile().getParentFile();
	}

	public String setProperty(final String key, final String value) {
		return propertyContainer.setProperty(key, value);
	}

	public String getProperty(String key) {
		return propertyContainer.getProperty(key);
	}

	public String getProperty(String key, String defaultValue) {
		return firstNonNull(propertyContainer.getProperty(key), defaultValue);
	}

	/**
	 * return read only map view of content
	 *
	 * @return
	 */
	public Map<String, String> asMap() {
		return propertyContainer.getPropertiesAsMap();
	}

	public interface PropertyContainer {

		public void store() throws IOException;

		@Deprecated
		public File getFile();

		public String setProperty(String key, String value);

		public String getProperty(String key);

		/**
		 * return read only map view of content
		 *
		 * @return
		 */
		public Map<String, String> getPropertiesAsMap();
	}

}

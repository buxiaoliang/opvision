package org.cmdbuild.services.setup;

import static org.apache.commons.lang3.StringUtils.defaultString;

import java.util.Map;

import org.cmdbuild.config.DefaultProperties;
import org.cmdbuild.logic.setup.SetupLogic.Module;
import org.cmdbuild.logic.setup.SetupLogic.ModulesHandler;
import org.cmdbuild.services.Settings;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class PropertiesModulesHandler implements ModulesHandler {

	private static class PropertiesModule implements Module {

		private final String name;

		public PropertiesModule(final String name) {
			this.name = name;
		}

		@Override
		public Map<String, String> retrieve() throws Exception {
			final DefaultProperties module = Settings.getInstance().getModule(name);
			return Maps.newHashMap(module.asMap()); //FIXME defensive copy should not be necessary... verify and eventually remove
		}

		@Override
		public void store(final Map<String, String> valuesToStore) throws Exception {
			final DefaultProperties properties = Settings.getInstance().getModule(name);
			for (final String key : Sets.intersection(valuesToStore.keySet(), properties.asMap().keySet())) {
				properties.setProperty(key, defaultString(valuesToStore.get(key)));
			}
			properties.store();
		}

	}

	@Override
	public Module get(final String name) {
		return new PropertiesModule(name);
	}

}

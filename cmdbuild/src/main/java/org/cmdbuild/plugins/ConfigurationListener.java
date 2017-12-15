package org.cmdbuild.plugins;

import java.io.File;
import static java.lang.String.format;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import static org.apache.commons.lang3.ObjectUtils.firstNonNull;
import org.apache.log4j.PropertyConfigurator;
import org.cmdbuild.logger.Log;
import org.cmdbuild.services.Settings;
import org.slf4j.Logger;

public class ConfigurationListener implements ServletContextListener {

	private static final Logger logger = Log.CMDBUILD;

	private static final String ROOT_PATH = "/";

	private static final String MODULES_PARAM = "modules";
	private static final String MODULES_SEPARATOR = ",";

	private static final String LOG4J_MODULE = "log4j";

	private static final String MODULE_FILE_PATTERN = "%s/%s.conf";

	private static final String CONFIG_LOCATION_PARAM = "configLocation";
	private static final String DEFAULT_CONFIG_LOCATION = "WEB-INF/conf";

	@Override
	public void contextInitialized(final ServletContextEvent sce) {
		loadConfiguration(sce);
	}

	@Override
	public void contextDestroyed(final ServletContextEvent sce) {
		// nothing to do
	}

	private void loadConfiguration(final ServletContextEvent sce) {
		// we get the fully qualified path to web application
		final String path = sce.getServletContext().getRealPath(ROOT_PATH);

		// we get the fully qualified path to configs
		String configPath = firstNonNull(
				sce.getServletContext().getInitParameter(CONFIG_LOCATION_PARAM),
				sce.getServletContext().getRealPath(DEFAULT_CONFIG_LOCATION),
				path + "/" + DEFAULT_CONFIG_LOCATION); // this is required if WEB-INF/config is a symlink (for example when we emulate a cluster on a single host, and want to share config dir via symlink)

		/*
		 * Next we set the properties for all the servlets and JSP pages in this
		 * web application
		 */

		logger.info("configuring log4j for watching at its configuration file changes");
		PropertyConfigurator.configureAndWatch(moduleFile(configPath, LOG4J_MODULE));

		logger.info("loading configurations");
		final String[] modules = sce.getServletContext().getInitParameter(MODULES_PARAM).split(MODULES_SEPARATOR);
		final Settings settings = Settings.getInstance();
		for (final String module : modules) {
			logger.debug("loading configurations for module = {}", module);
			try {
				settings.getModule(module, new File(moduleFile(configPath, module)));
			} catch (Exception e) {
				logger.error("unable to load configuration file for module = " + module, e);
			}
		}
		settings.setRootPath(path);
	}

	private String moduleFile(final String path, final String module) {
		return format(MODULE_FILE_PATTERN, path, module);
	}

}

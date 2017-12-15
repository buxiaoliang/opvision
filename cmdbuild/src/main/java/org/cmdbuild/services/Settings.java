package org.cmdbuild.services;

import static com.google.common.base.Objects.equal;
import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import com.google.common.collect.Maps;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.InvocationTargetException;
import java.util.Collections;
import java.util.Map;
import java.util.Properties;
import javax.annotation.Nullable;
import org.cmdbuild.common.cache.ClusterEvent;
import org.cmdbuild.common.cache.ClusterMessage;
import org.cmdbuild.common.cache.ClusterMessageConsumer;
import org.cmdbuild.common.cache.ClusterMessageReceiver;
import org.cmdbuild.common.cache.ClusterMessageSender;
import org.cmdbuild.common.cache.ClusterTarget;

import org.cmdbuild.config.DefaultProperties;
import org.cmdbuild.config.DefaultProperties.PropertyContainer;
import org.cmdbuild.utils.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Settings {

	private final Logger logger = LoggerFactory.getLogger(getClass());
	private static Settings instance;

	private final Map<String, DefaultProperties> propertiesByModule = Maps.newLinkedHashMap();

	private String rootPath;
	private ClusterNotifier clusterNotifierService;

	private Settings() {
		clusterNotifierService = new ClusterNotifier() { // dummy notification service
			@Override
			public void notifyClusterOfModuleConfigUpdate(String moduleKey) {
				logger.warn("cluster notifier not ready yet, this message will NOT be sent");
			}

			@Override
			public void registerModuleConfigUpdateListener(ModuleConfigUpdateListener listener) {
				throw new UnsupportedOperationException("Not supported yet.");
			}
		};
	}

	public static synchronized Settings getInstance() {
		if (instance == null) {
			instance = new Settings();
		}
		return instance;
	}

	/**
	 * this is a little ugly, but necessary to have settings started before
	 * spring, and attach springified SettingsClusterNotifierService later;
	 * should be called only once, during spring initialization
	 *
	 * @param clusterNotifierService
	 */
	public synchronized void setClusterNotifierService(DefaultSettingsClusterNotifierService clusterNotifierService) {
		this.clusterNotifierService = clusterNotifierService;
		this.clusterNotifierService.registerModuleConfigUpdateListener((moduleKey) -> {
			reloadModule(moduleKey);
		});
		logger.info("cluster notification service is ready");
	}

	private DefaultProperties createPropertiesClass(String key, @Nullable File sourceFile) {
		EnhancedPropertyContainer propertyContainer = sourceFile == null ? new NullStoragePropertyContainer() : new FileStoragePropertyContainer(key, sourceFile);
		DefaultProperties properties;
		try {
			Class<DefaultProperties> propertiesClass = (Class<DefaultProperties>) Class.forName("org.cmdbuild.config." + StringUtils.ucFirst(key) + "Properties");
			properties = propertiesClass.getConstructor(PropertyContainer.class).newInstance(propertyContainer);
		} catch (ClassNotFoundException cnfe) {
			properties = new DefaultProperties(propertyContainer);
		} catch (InstantiationException | IllegalAccessException | IllegalArgumentException | InvocationTargetException | NoSuchMethodException | SecurityException ex) {
			throw new RuntimeException(ex);
		}
		try {
			logger.info("loading config for module = {} from file = {}", key, sourceFile);
			propertyContainer.loadSafe();
		} catch (IOException ex) {
			throw new RuntimeException(ex);
		}
		return properties;
	}

	public synchronized DefaultProperties getModule(String key, @Nullable File file) {
		DefaultProperties properties = propertiesByModule.get(key);
		if (properties == null) {
			properties = createPropertiesClass(key, file);
			propertiesByModule.put(key, properties);
		}
		return properties;
	}

	public DefaultProperties getModule(String key) {
		return getModule(key, null);
	}

	public void setRootPath(String rootPath) {
		this.rootPath = rootPath;
	}

	public String getRootPath() {
		return rootPath;
	}

	public synchronized void reloadModule(String key) {
		DefaultProperties properties = propertiesByModule.get(key);
		checkArgument(properties != null && properties.getPropertyContainer() instanceof FileStoragePropertyContainer, "cannot reload config for module = %s: config non esisting or container module not supporting reload", key);
		FileStoragePropertyContainer propertyContainer = ((FileStoragePropertyContainer) properties.getPropertyContainer());
		propertiesByModule.remove(key);
		getModule(key, propertyContainer.getFile()); // this will trigger reload (and complete rebuild of DefaultProperties class)
	}

	private interface EnhancedPropertyContainer extends PropertyContainer {

		/**
		 * load properties if possible (ie if there is a storage from which to
		 * load); skip loading otherwise
		 *
		 * @throws IOException if there is an error loading from storage
		 */
		public void loadSafe() throws IOException;

	}

	public static abstract class AbstractStoragePropertyContainer implements EnhancedPropertyContainer {

		private final Properties properties = new Properties();

		public AbstractStoragePropertyContainer() {
		}

		protected Properties getProperties() {
			return properties;
		}

		@Override
		public abstract void store() throws IOException;

		@Override
		public abstract File getFile();

		@Override
		public String setProperty(String key, String value) {
			return toStringOrNull(properties.setProperty(key, value));
		}

		@Override
		public String getProperty(String key) {
			return properties.getProperty(key);
		}

		@Override
		public Map<String, String> getPropertiesAsMap() {
			return Collections.unmodifiableMap((Map) Maps.transformValues(properties, (Object o) -> toStringOrNull(o)));
		}

		private @Nullable
		String toStringOrNull(@Nullable Object value) {
			return value == null ? null : String.valueOf(value);
		}

		@Override
		public void loadSafe() throws IOException {
		}

	}

	public static class NullStoragePropertyContainer extends AbstractStoragePropertyContainer {

		public NullStoragePropertyContainer() {

		}

		@Override
		public void store() throws IOException {
			throw new UnsupportedOperationException("this property does not support store()");
		}

		@Override
		public File getFile() {
			throw new UnsupportedOperationException("this property does not suport getFile()");
		}

		public String getModule() {
			throw new UnsupportedOperationException("this property does not suport getFile()");
		}

	}

	private class FileStoragePropertyContainer extends AbstractStoragePropertyContainer {

		private final File file;
		private final String module;

		public FileStoragePropertyContainer(String module, File file) {
			checkNotNull(module);
			checkNotNull(file);
			this.module = module;
			this.file = file;
		}

		@Override
		public void store() throws IOException {
			try (OutputStream out = new FileOutputStream(file)) {
				getProperties().store(out, null);
			}
			clusterNotifierService.notifyClusterOfModuleConfigUpdate(module);
		}

		@Override
		public File getFile() {
			return file;
		}

		@Override
		public void loadSafe() throws IOException {
			try (InputStream in = new FileInputStream(file)) {
				getProperties().load(in);
			}

		}
	}

	public interface ClusterNotifier {

		public void notifyClusterOfModuleConfigUpdate(String moduleKey);

		public void registerModuleConfigUpdateListener(ModuleConfigUpdateListener listener);

	}

	public interface ModuleConfigUpdateListener {

		public void handleModuleConfigUpdate(String moduleKey);
	}

	public static class DefaultSettingsClusterNotifierService implements ClusterMessageConsumer, ClusterNotifier {

		private final Logger logger = LoggerFactory.getLogger(getClass());

		private final String SETTINGS_UPDATE = "SETTINGS_UPDATE";
		private ModuleConfigUpdateListener listener;
		private final ClusterMessageSender clusterMessageSender;

		public DefaultSettingsClusterNotifierService(ClusterMessageSender clusterMessageSender) {
			checkNotNull(clusterMessageSender);
			this.clusterMessageSender = clusterMessageSender;
		}

		@Override
		public void update(ClusterMessage msg) {
			checkArgument(equal(msg.getEvent(), ClusterEvent.OTHER));
			checkArgument(equal(msg.getParams().get(0), SETTINGS_UPDATE));
			String moduleKey = msg.getParams().get(1);
			checkNotNull(moduleKey);
			logger.debug("received SETTINGS_UPDATE message from cluster for module = {}", moduleKey);
			listener.handleModuleConfigUpdate(moduleKey);
		}

		@Override
		public void register(ClusterMessageReceiver receiver) {
			receiver.register(this, ClusterTarget.SettingsService.getTargetId());
		}

		@Override
		public void notifyClusterOfModuleConfigUpdate(String moduleKey) {
			checkNotNull(moduleKey);
			logger.debug("sending SETTINGS_UPDATE message to cluster for module = {}", moduleKey);
			clusterMessageSender.safeSend(new ClusterMessage(ClusterTarget.SettingsService.getTargetId(), ClusterEvent.OTHER, SETTINGS_UPDATE, moduleKey));
		}

		@Override
		public void registerModuleConfigUpdateListener(ModuleConfigUpdateListener listener) {
			this.listener = listener;
		}

	}

}

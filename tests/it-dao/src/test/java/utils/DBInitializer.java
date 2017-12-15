package utils;

import static java.io.File.separator;
import static java.lang.String.format;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.Properties;

import javax.sql.DataSource;

import static org.apache.commons.lang3.SystemUtils.USER_DIR;
import org.cmdbuild.config.DatabaseConfiguration;
import org.cmdbuild.config.DatabaseProperties;
import org.cmdbuild.dao.driver.AbstractDBDriver.DefaultTypeObjectCache;
import org.cmdbuild.dao.driver.DBDriver;
import org.cmdbuild.dao.driver.postgres.PostgresDriver;
import org.cmdbuild.dao.view.DBDataView;
import org.cmdbuild.logic.data.DefaultDataDefinitionLogic;
import org.cmdbuild.services.DefaultFilesStore;
import org.cmdbuild.services.DefaultPatchManager;
import org.cmdbuild.services.FilesStoreRepository;
import org.cmdbuild.services.PatchManager;
import org.cmdbuild.services.Settings;
import org.cmdbuild.services.Settings.NullStoragePropertyContainer;
import org.cmdbuild.services.database.DatabaseConfigurator;
import org.mockito.Mockito;
import static org.mockito.Mockito.mock;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DBInitializer {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	private static final String DATABASE_PROPERTIES = "database.properties";
	// TODO it's a little ugly, at the moment is ok
	private static final String WEB_INF_PATH = USER_DIR + "/../../cmdbuild/src/main/webapp/WEB-INF/";
	private static final String SQL_PATH = WEB_INF_PATH + "sql/";

	private final DatabaseConfigurator.Configuration dbConfiguration;
	private final DatabaseConfigurator dbConfigurator;
	private final PostgresDriver pgDriver;
	private PatchManager patchManager = null;

	public DBInitializer() {
		final Properties properties = readDatabaseProperties();
		final String webRoot = SQL_PATH;
		// FIXME needed for PatchManager... no comment
		Settings.getInstance().setRootPath(USER_DIR + separator + "../../cmdbuild/src/main/webapp/"); //TODO check if still necessary
		dbConfiguration = new DatabaseConfigurator.Configuration() {

			@Override
			public String getHost() {
				return properties.getProperty("host");
			}

			@Override
			public int getPort() {
				return Integer.parseInt(properties.getProperty("port"));
			}

			@Override
			public String getUser() {
				return properties.getProperty("super.user");
			}

			@Override
			public String getPassword() {
				return properties.getProperty("super.password");
			}

			@Override
			public String getDatabaseName() {
				return properties.getProperty("db.name");
			}

			@Override
			public String getDatabaseType() {
				return DatabaseConfigurator.EMPTY_DBTYPE;
			}

			@Override
			public boolean useLimitedUser() {
				return false;
			}

			@Override
			public String getLimitedUser() {
				return properties.getProperty("user");
			}

			@Override
			public String getLimitedUserPassword() {
				return properties.getProperty("password");
			}

			@Override
			public boolean useSharkSchema() {
				return false;
			}

			@Override
			public String getSqlPath() {
				return webRoot;
			}

		};

		PatchManager fakePatchManager = mock(PatchManager.class);
		final DatabaseConfiguration databaseConfiguration = new DatabaseProperties(new NullStoragePropertyContainer());
		dbConfigurator = new DatabaseConfigurator(dbConfiguration, databaseConfiguration, fakePatchManager);
		pgDriver = new PostgresDriver(dbConfigurator.systemDataSource(), new DefaultTypeObjectCache());
		Mockito.doAnswer((Answer<Void>) (InvocationOnMock invocation) -> {
			patchManager.createLastPatch();
			return null;
		}).when(fakePatchManager).createLastPatch();
	}

	private Iterable<DefaultPatchManager.Repository> patchRepositories() {
		return Arrays.asList(new FilesStoreRepository(new DefaultFilesStore(WEB_INF_PATH, "./patches/"), null));
	}

	private Properties readDatabaseProperties() {
		InputStream inputStream = null;
		try {
			final ClassLoader classLoader = DBInitializer.class.getClassLoader();
			inputStream = classLoader.getResourceAsStream(DATABASE_PROPERTIES);
			final Properties properties = new Properties();
			properties.load(inputStream);
			return properties;
		} catch (final Exception e) {
			logger.error("cannot read database properties", e);
			throw new Error(e);
		} finally {
			if (inputStream != null) {
				try {
					inputStream.close();
				} catch (final IOException e) {
					logger.warn("canno close input stream");
				}
			}
		}
	}

	public void initialize() {
		logger.info("initializing database (if needed)");
		setupDatabaseProperties();
		DBDataView dataView = new DBDataView(pgDriver);
		patchManager = new DefaultPatchManager(dbConfigurator.systemDataSource(), dataView, new DefaultDataDefinitionLogic(dataView), patchRepositories());
		if (!databaseExists()) {
			logger.info("database not found");
			createDatabase();
		}
		updateWithPatches();
	}

	public void drop() {
		logger.info("dropping database");
		if (databaseExists()) {
			dbConfigurator.drop();
			logger.info("database dropped");
		}
	}

	private void setupDatabaseProperties() {
		final org.cmdbuild.config.DatabaseConfiguration dp = DatabaseProperties.getInstance();
		dp.setDatabaseUrl(format("jdbc:postgresql://%1$s:%2$s/%3$s", //
				dbConfiguration.getHost(), //
				dbConfiguration.getPort(), //
				dbConfiguration.getDatabaseName()));
		logger.info("using database = {}", dp.getDatabaseUrl());
		dp.setDatabaseUser(dbConfiguration.getUser());
		dp.setDatabasePassword(dbConfiguration.getPassword());
	}

	private void updateWithPatches() {
		logger.info("check database for required patches");
		if (!patchManager.isUpdated()) {
			logger.info("database is NOT up-to-date, applying patches");
			patchManager.applyPatchList();
		} else {
			logger.info("database is up-to-date, no patching necessary");
		}
	}

	private void createDatabase() {
		logger.info("creating database");
		dbConfigurator.configureAndDoNotSaveSettings();
	}

	private boolean databaseExists() {
		logger.info("checking database");
		final DataSource dataSource = dbConfigurator.systemDataSource();
		Connection connection = null;
		try {
			connection = dataSource.getConnection();
			logger.info("database found");
			return true;
		} catch (final SQLException ex) {
			logger.info("database not found");
			return false;
		} finally {
			if (connection != null) {
				try {
					connection.close();
				} catch (final SQLException e) {
					logger.warn("error closing connection", e);
				}
			}
		}
	}

	public DataSource dataSource() {
		return dbConfigurator.systemDataSource();
	}

	public DBDriver getDriver() {
		return pgDriver;
	}

}

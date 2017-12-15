package org.cmdbuild.bim.service.bimserver;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.FileDataSource;

import org.apache.commons.lang3.StringUtils;
import org.bimserver.client.BimServerClient;
import org.bimserver.client.ClientIfcModel;
import org.bimserver.client.json.JsonBimServerClientFactory;
import org.bimserver.emf.IdEObject;
import org.bimserver.emf.IfcModelInterface;
import org.bimserver.interfaces.objects.SDeserializerPluginConfiguration;
import org.bimserver.interfaces.objects.SProject;
import org.bimserver.interfaces.objects.SRevision;
import org.bimserver.shared.UsernamePasswordAuthenticationInfo;
import org.cmdbuild.bim.logging.LoggingSupport;
import org.cmdbuild.bim.model.Entity;
import org.cmdbuild.bim.service.BimError;
import org.cmdbuild.bim.service.BimProject;
import org.cmdbuild.bim.service.BimRevision;
import org.cmdbuild.bim.service.Deserializer;
import org.cmdbuild.bim.service.ReferenceAttribute;
import org.cmdbuild.bim.service.Serializer;
import org.cmdbuild.bim.service.bimserver.BimserverConfiguration.ChangeListener;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EPackage;
import org.joda.time.DateTime;
import org.slf4j.Logger;

import com.google.common.collect.Maps;

public class DefaultBimserverClient implements BimserverClient, ChangeListener {

	private final BimserverConfiguration configuration;
	private BimServerClient client;
	private JsonBimServerClientFactory factory;
	private final Logger logger = LoggingSupport.logger;
	private final Map<String, IfcModelInterface> models = Maps.newHashMap();

	private enum IfcVersions {

		ifc2x3tc1 {
			@Override
			public String getDeserializerName() {
				return "Ifc2x3tc1 (Streaming)";
			}

			@Override
			public String getSerializerName() {
				return "Ifc2x3tc1";
			}

			@Override
			public EPackage getPackage() {
				return org.bimserver.models.ifc2x3tc1.Ifc2x3tc1Package.eINSTANCE;
			}

		},
		ifc4 {
			@Override
			public String getDeserializerName() {
				return "Ifc4 (Streaming)";
			}

			@Override
			public String getSerializerName() {
				return "Ifc4";
			}

			@Override
			public EPackage getPackage() {
				return org.bimserver.models.ifc4.Ifc4Package.eINSTANCE;
			}

		};

		public abstract String getDeserializerName();

		public abstract String getSerializerName();

		public abstract EPackage getPackage();
	}

	public DefaultBimserverClient(final BimserverConfiguration configuration) {
		this.configuration = configuration;
		this.configuration.addListener(this);
		connect();
	}

	@Override
	public DateTime checkin(final String projectId, final File file, final String ifcVersion) {
		try {
			final Long poid = Long.parseLong(projectId);
			Deserializer deserializer;
			if (StringUtils.isBlank(ifcVersion)) {
				final SDeserializerPluginConfiguration extension = client.getServiceInterface()
						.getSuggestedDeserializerForExtension("ifc", poid);
				deserializer = new BimserverDeserializer(extension);
			} else {
				final String deserializerName = IfcVersions.valueOf(ifcVersion).getDeserializerName();
				final SDeserializerPluginConfiguration extension = client.getServiceInterface()
						.getDeserializerByName(deserializerName);
				deserializer = new BimserverDeserializer(extension);
			}
			final DataSource dataSource = new FileDataSource(file);
			final DataHandler dataHandler = new DataHandler(dataSource);
			checkin(poid, "", deserializer.getOid(), file.length(), file.getName(), dataHandler, false, true);
			final String roid = getLastRevisionOfProject(projectId);
			final BimRevision revision = getRevision(roid);
			return new DateTime(revision.getDate());
		} catch (final Throwable e) {
			throw new BimError(e);
		}
	}

	@Override
	public void configurationChanged() {
		disconnect();
	}

	@Override
	public void connect() {
		synchronized (this) {
			try {
				if (!isConnected() && configuration.isEnabled()) {
					final JsonBimServerClientFactory factory = new JsonBimServerClientFactory(configuration.getUrl());
					client = factory.create(new UsernamePasswordAuthenticationInfo(configuration.getUsername(),
							configuration.getPassword()));
					// FIXME: find the correct point to close the factory, not
					// here!
					logger.info("Bimserver connection established");
				}
			} catch (final Throwable t) {
				logger.warn("Bimserver connection failed");
			}
		}
	}

	@Override
	public BimProject createProjectWithName(final String projectName, final String description,
			final String ifcVersion) {
		try {
			final SProject newProject = client.getServiceInterface().addProject(projectName, ifcVersion);
			newProject.setDescription(description);
			client.getServiceInterface().updateProject(newProject);
			final BimProject project = new BimserverProject(newProject);
			return project;
		} catch (final Throwable e) {
			throw new BimError(e);
		}
	}

	@Override
	public void disableProject(final String projectId) {
		try {
			final Long poid = new Long(projectId);
			client.getServiceInterface().deleteProject(poid);
		} catch (final Throwable e) {
			throw new BimError(e);
		}
	}

	@Override
	public void disconnect() {
		synchronized (this) {
			client = null;
		}
	}

	@Override
	public DataHandler downloadIfc(final String roid, final String ifcVersion) {
		try {
			final String serializerName = IfcVersions.valueOf(ifcVersion).getSerializerName();
			final Serializer serializer = new BimserverSerializer(
					client.getServiceInterface().getSerializerByName(serializerName));

			final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
			client.download(new Long(roid), serializer.getOid(), outputStream);

			final DataSource ds = new DataSource() {

				@Override
				public OutputStream getOutputStream() throws IOException {
					return outputStream;
				}

				@Override
				public String getName() {
					return roid + ".ifc";
				}

				@Override
				public InputStream getInputStream() throws IOException {
					return new ByteArrayInputStream(outputStream.toByteArray());
				}

				@Override
				public String getContentType() {
					return "application/ifc";
				}
			};
			return new DataHandler(ds);
		} catch (final Throwable e) {
			throw new BimError(e);
		}
	}

	@Override
	public void enableProject(final String projectId) {
		try {
			final Long poid = new Long(projectId);
			client.getServiceInterface().undeleteProject(poid);
		} catch (final Throwable e) {
			throw new BimError(e);
		}
	}

	@Override
	public Iterable<Entity> getEntitiesByType(final String type, final String revisionId) {
		try {
			final SRevision revision = client.getServiceInterface().getRevision(new Long(revisionId));
			final SProject project = client.getServiceInterface().getProjectByPoid(revision.getProjectId());
			final IfcVersions ifcVersion = IfcVersions.valueOf(project.getSchema());

			loadModel(revisionId);

			final EPackage einstance = ifcVersion.getPackage();
			final String methodName = "get" + type;
			final Method method = einstance.getClass().getDeclaredMethod(methodName, null);
			final EClass response = (EClass) method.invoke(einstance, (Object[]) null);

			final List<IdEObject> entitiesResponse = models.get(revisionId).getAllWithSubTypes(response);

			final List<Entity> entities = new ArrayList<Entity>();
			if (entitiesResponse != null) {
				for (final IdEObject object : entitiesResponse) {
					if (ifcVersion.equals(IfcVersions.ifc2x3tc1)
							&& object instanceof org.bimserver.models.ifc2x3tc1.IfcRoot) {
						final Entity entity = new org.cmdbuild.bim.service.bimserver.BimserverEntity(
								org.bimserver.models.ifc2x3tc1.IfcRoot.class.cast(object));
						entities.add(entity);
					} else if (ifcVersion.equals(IfcVersions.ifc4)
							&& object instanceof org.bimserver.models.ifc4.IfcRoot) {
						final Entity entity = new org.cmdbuild.bim.service.bimserver.BimserverEntity(
								org.bimserver.models.ifc4.IfcRoot.class.cast(object));
						entities.add(entity);
					}
				}
			}
			return entities;
		} catch (final Throwable e) {
			throw new BimError(e);
		}
	}

	@Override
	public Entity getEntityByOid(final String revisionId, final String objectId) {
		loadModel(revisionId);
		final IfcModelInterface model = models.get(revisionId);
		return new org.cmdbuild.bim.service.bimserver.BimserverEntity(model.get(new Long(objectId)));
	}

	@Override
	public String getLastRevisionOfProject(final String identifier) {
		try {
			final Long poid = new Long(identifier);
			final SProject project = client.getServiceInterface().getProjectByPoid(poid);
			return String.valueOf(project.getLastRevisionId());
		} catch (final Throwable e) {
			throw new BimError(e);
		}
	}

	@Override
	public BimProject getProjectByPoid(final String projectId) {
		try {
			final Long poid = new Long(projectId);
			final SProject bimserverProject = client.getServiceInterface().getProjectByPoid(poid);
			final BimProject project = new BimserverProject(bimserverProject);
			return project;
		} catch (final Throwable e) {
			throw new BimError(e);
		}
	}

	@Override
	public Entity getReferencedEntity(final ReferenceAttribute reference, final String revisionId) {
		Entity entity = Entity.NULL_ENTITY;
		if (!StringUtils.isBlank(reference.getGlobalId())) {
			final String guid = reference.getGlobalId();
			entity = getEntityByGuid(revisionId, guid, null);
		} else {
			final Long oid = reference.getOid();
			entity = getEntityByOid(revisionId, String.valueOf(oid));
		}
		return entity;
	}

	@Override
	public boolean isConnected() {
		synchronized (this) {
			boolean success = false;
			try {
				success = client.getBimServerAuthInterface().isLoggedIn();
			} catch (final Throwable t) {
				logger.warn("Unable to check login state");
			}
			return success;
		}
	}

	@Override
	public BimProject updateProject(final BimProject project) {
		try {
			final Long poid = new Long(project.getIdentifier());
			final SProject currentProject = client.getServiceInterface().getProjectByPoid(poid);
			currentProject.setDescription(project.getDescription());
			client.getServiceInterface().updateProject(currentProject);
			return project;
		} catch (final Throwable e) {
			throw new BimError(e);
		}
	}

	private void checkin(final Long poid, final String comment, final Long deserializerOid, final Long fileSize,
			final String fileName, final DataHandler ifcFile, final boolean merge, final boolean sync) {
		try {
			client.getServiceInterface().checkin(poid, comment, deserializerOid, fileSize, fileName, ifcFile, merge,
					sync);
		} catch (final Throwable e) {
			throw new BimError(e);
		}

	}

	private Entity getEntityByGuid(final String revisionId, final String guid, final Iterable<String> candidateTypes) {

		loadModel(revisionId);
		final IfcModelInterface model = models.get(revisionId);
		return new org.cmdbuild.bim.service.bimserver.BimserverEntity(model.getByGuid(guid));
	}

	private BimRevision getRevision(final String identifier) {
		final Long roid = new Long(identifier);
		BimRevision revision = BimRevision.NULL_REVISION;
		try {
			if (roid != -1) {
				revision = new BimserverRevision(client.getServiceInterface().getRevision(roid));
			}
			return revision;
		} catch (final Throwable e) {
			throw new BimError(e);
		}
	}

	private void loadModel(final String revisionId) {
		if (!models.containsKey(revisionId)) {
			final String projectId = getRevision(revisionId).getProjectId();
			try {
				final SProject project = client.getServiceInterface().getProjectByPoid(new Long(projectId));
				final ClientIfcModel model = client.getModel(project, new Long(revisionId), true, false);
				models.put(revisionId, model);
			} catch (final Throwable t) {
				logger.error("Cannot load model for revision {}", revisionId);
				throw new BimError(t);
			}
		}
	}

}

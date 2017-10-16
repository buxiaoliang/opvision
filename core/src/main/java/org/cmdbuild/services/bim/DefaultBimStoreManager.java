package org.cmdbuild.services.bim;

import static org.cmdbuild.data.store.Storables.storableOf;

import org.cmdbuild.bim.service.BimError;
import org.cmdbuild.data.store.Store;
import org.cmdbuild.model.bim.StorableLayer;
import org.cmdbuild.model.bim.StorableProject;

public class DefaultBimStoreManager implements BimStoreManager {

	private final Store<StorableProject> projectStore;
	private final Store<StorableLayer> layerStore;

	public DefaultBimStoreManager(final Store<StorableProject> projectInfoStore,
			final Store<StorableLayer> layerStore) {
		this.projectStore = projectInfoStore;
		this.layerStore = layerStore;
	}

	@Override
	public Iterable<StorableProject> readAll() {
		return projectStore.readAll();
	}

	@Override
	public StorableProject read(final String identifier) {
		return projectStore.read(storableOf(identifier));
	}

	@Override
	public StorableLayer readLayer(final String className) {
		return layerStore.read(storableOf(className));
	}

	@Override
	public void write(final StorableProject project) {
		final StorableProject projectAlreadyStored = projectStore.read(storableOf(project.getProjectId()));
		if (projectAlreadyStored != null) {
			project.setName(projectAlreadyStored.getName());
			if (project.getExportProjectId() == null) {
				project.setExportProjectId(projectAlreadyStored.getExportProjectId());
			}
			if (project.getLastCheckin() == null) {
				project.setLastCheckin(projectAlreadyStored.getLastCheckin());
			}
			if (project.getImportMapping() == null) {
				project.setImportMapping(projectAlreadyStored.getImportMapping());
			}
			projectStore.update(project);
		} else {
			projectStore.create(project).getIdentifier();
		}

	}

	@Override
	public void disableProject(final String identifier) {
		final StorableProject projectToEnable = read(identifier);
		projectToEnable.setActive(false);
		write(projectToEnable);
	}

	@Override
	public void enableProject(final String identifier) {
		final StorableProject projectToEnable = read(identifier);
		projectToEnable.setActive(true);
		write(projectToEnable);
	}

	@Override
	public Iterable<StorableLayer> readAllLayers() {
		return layerStore.readAll();
	}

	@Override
	public void saveActiveStatus(final String className, final String value) {
		StorableLayer layerForClass = layerStore.read(storableOf(className));
		if (layerForClass == null) {
			layerForClass = new StorableLayer(className);
			layerForClass.setActive(Boolean.parseBoolean(value));
			layerStore.create(layerForClass);
		} else {
			layerForClass.setActive(Boolean.parseBoolean(value));
			layerStore.update(layerForClass);
		}

	}

	@Override
	public void saveRoot(final String className, final boolean value) {
		StorableLayer layer = layerStore.read(storableOf(className));
		if (layer == null) {
			layer = new StorableLayer(className);
			layer.setRoot(value);
			layerStore.create(layer);
		} else {
			layer.setRoot(value);
			layerStore.update(layer);
		}
	}

	@Override
	public void saveRootReference(final String className, final String value) {
		StorableLayer layer = layerStore.read(storableOf(className));
		if (layer == null) {
			layer = new StorableLayer(className);
			layer.setRootReference(value);
			layerStore.create(layer);
		} else {
			layer.setRootReference(value);
			layerStore.update(layer);
		}
	}

	@Override
	public void saveExportStatus(final String className, final String value) {
		StorableLayer layerForClass = layerStore.read(storableOf(className));
		final boolean exportValue = Boolean.parseBoolean(value);
		if (layerForClass == null) {
			layerForClass = new StorableLayer(className);
			layerForClass.setExport(exportValue);
			layerStore.create(layerForClass);
		} else {
			layerForClass.setExport(exportValue);
			layerStore.update(layerForClass);
		}
	}

	@Override
	public void saveContainerStatus(final String className, final String value) {
		StorableLayer layerForClass = layerStore.read(storableOf(className));
		final boolean containerValue = Boolean.parseBoolean(value);
		if (layerForClass == null) {
			layerForClass = new StorableLayer(className);
			layerForClass.setContainer(containerValue);
			layerStore.create(layerForClass);
		} else {
			layerForClass.setContainer(containerValue);
			layerStore.update(layerForClass);
		}

	}

	@Override
	public StorableLayer findRoot() {
		for (final StorableLayer layer : layerStore.readAll()) {
			if (layer.isRoot()) {
				return layer;
			}
		}
		return StorableLayer.NULL_LAYER;
	}

	@Override
	public StorableLayer findContainer() {
		for (final StorableLayer layer : layerStore.readAll()) {
			if (layer.isContainer()) {
				return layer;
			}
		}
		return StorableLayer.NULL_LAYER;
	}

	@Override
	public boolean isActive(final String className) {
		boolean response = false;
		final StorableLayer layer = layerStore.read(storableOf(className));
		if (layer != null) {
			response = layer.isActive();
		}
		return response;
	}

	@Override
	public String getContainerClassName() {
		final StorableLayer containerLayer = findContainer();
		if (containerLayer == null) {
			throw new BimError("Container layer not configured");
		} else {
			return containerLayer.getClassName();
		}
	}

}

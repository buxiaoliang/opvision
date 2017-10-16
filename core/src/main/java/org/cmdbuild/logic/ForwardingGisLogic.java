package org.cmdbuild.logic;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.commons.fileupload.FileItem;
import org.cmdbuild.logic.data.access.DataAccessLogic;
import org.cmdbuild.model.data.Card;
import org.cmdbuild.model.domainTree.DomainTreeCardNode;
import org.cmdbuild.model.domainTree.DomainTreeNode;
import org.cmdbuild.model.gis.LayerMetadata;
import org.cmdbuild.services.gis.GeoFeature;

import com.google.common.collect.ForwardingObject;

public abstract class ForwardingGisLogic extends ForwardingObject implements GISLogic {

	/**
	 * Usable by subclasses only.
	 */
	protected ForwardingGisLogic() {
	}

	@Override
	protected abstract GISLogic delegate();

	@Override
	public boolean isGisEnabled() {
		return delegate().isGisEnabled();
	}

	@Override
	public LayerMetadata createGeoAttribute(final String targetClassName, final LayerMetadata layerMetaData)
			throws Exception {
		return delegate().createGeoAttribute(targetClassName, layerMetaData);
	}

	@Override
	public LayerMetadata modifyGeoAttribute(final String targetClassName, final String name, final String description,
			final int minimumZoom, final int maximumZoom, final String style) throws Exception {
		return delegate().modifyGeoAttribute(targetClassName, name, description, minimumZoom, maximumZoom, style);
	}

	@Override
	public void deleteGeoAttribute(final String masterTableName, final String attributeName) throws Exception {
		delegate().deleteGeoAttribute(masterTableName, attributeName);
	}

	@Override
	public Entry<String, GeoFeature> getFeature(final Card card) throws Exception {
		return delegate().getFeature(card);
	}

	@Override
	public List<GeoFeature> getFeatures(final String masterClassName, final String layerName, final String bbox)
			throws Exception {
		return delegate().getFeatures(masterClassName, layerName, bbox);
	}

	@Override
	public void updateFeatures(final Card ownerCard, final Map<String, Object> attributes) throws Exception {
		delegate().updateFeatures(ownerCard, attributes);
	}

	@Override
	public void createGeoServerLayer(final LayerMetadata layerMetaData, final FileItem file)
			throws IOException, Exception {
		delegate().createGeoServerLayer(layerMetaData, file);
	}

	@Override
	public void modifyGeoServerLayer(final String name, final String description, final int maximumZoom,
			final int minimumZoom, final FileItem file, final Set<String> cardBinding) throws Exception {
		delegate().modifyGeoServerLayer(name, description, maximumZoom, minimumZoom, file, cardBinding);
	}

	@Override
	public void deleteGeoServerLayer(final String name) throws Exception {
		delegate().deleteGeoServerLayer(name);
	}

	@Override
	public List<LayerMetadata> getGeoServerLayers() throws Exception {
		return delegate().getGeoServerLayers();
	}

	@Override
	public Map<String, ClassMapping> getGeoServerLayerMapping() throws Exception {
		return delegate().getGeoServerLayerMapping();
	}

	@Override
	public List<LayerMetadata> list() throws Exception {
		return delegate().list();
	}

	@Override
	public void setLayerVisisbility(final String layerFullName, final String visibleTable, final boolean visible)
			throws Exception {
		delegate().setLayerVisisbility(layerFullName, visibleTable, visible);
	}

	@Override
	public void reorderLayers(final int oldIndex, final int newIndex) throws Exception {
		delegate().reorderLayers(oldIndex, newIndex);
	}

	@Override
	public void saveGisTreeNavigation(final DomainTreeNode root) {
		delegate().saveGisTreeNavigation(root);
	}

	@Override
	public void removeGisTreeNavigation() {
		delegate().removeGisTreeNavigation();
	}

	@Override
	public DomainTreeNode getGisTreeNavigation() {
		return delegate().getGisTreeNavigation();
	}

	@Override
	public DomainTreeCardNode expandDomainTree(final DataAccessLogic dataAccesslogic) {
		return delegate().expandDomainTree(dataAccesslogic);
	}

}

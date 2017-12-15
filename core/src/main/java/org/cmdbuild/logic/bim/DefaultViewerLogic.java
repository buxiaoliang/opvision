package org.cmdbuild.logic.bim;

import static org.apache.commons.lang3.StringUtils.EMPTY;

import org.cmdbuild.bim.service.BimError;
import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.model.bim.StorableLayer;
import org.cmdbuild.services.bim.BimDataView;
import org.cmdbuild.services.bim.BimFacade;
import org.cmdbuild.services.bim.BimPersistence;
import org.cmdbuild.services.bim.DefaultBimDataView.BimCard;

public class DefaultViewerLogic implements ViewerLogic {

	private final BimFacade bimServiceFacade;
	private final BimPersistence bimPersistence;
	private final BimDataView bimDataView;

	public DefaultViewerLogic( //
			final BimFacade bimServiceFacade, //
			final BimPersistence bimPersistence, //
			final BimDataView bimDataView) {

		this.bimPersistence = bimPersistence;
		this.bimServiceFacade = bimServiceFacade;
		this.bimDataView = bimDataView;
	}

	// methods for the viewer

	@Override
	public BimCard fetchCardDataFromObjectId(final String objectId, final String revisionId) {
		final String globalId = bimServiceFacade.fetchGlobalIdFromObjectId(objectId, revisionId);
		final BimCard bimCard = bimDataView.getBimDataFromGlobalid(globalId);
		return bimCard;
	}

	@Override
	public String getDescriptionOfRoot(final Long cardId, final String className) {
		final Long rootId = getRootId(cardId, className);
		final StorableLayer rootLayer = bimPersistence.findRoot();
		if (rootLayer == null || rootLayer.getClassName() == null || rootLayer.getClassName().isEmpty()) {
			throw new BimError("Root layer not configured");
		}
		final CMCard rootCard = bimDataView.fetchCard(rootLayer.getClassName(), rootId);
		final String description = String.class.cast(rootCard.getDescription());
		return description;
	}

	@Override
	public String getBaseRevisionIdForViewer(final Long cardId, final String className) {
		final String baseProjectId = getBaseProjectIdForCardOfClass(cardId, className);
		final String revisionId = getLastRevisionOfProject(baseProjectId);
		return revisionId;
	}

	@Override
	public String getBaseProjectId(final Long cardId, final String className) {
		return getBaseProjectIdForCardOfClass(cardId, className);
	}

	private Long getRootId(final Long cardId, final String className) {
		Long rootId = null;
		final StorableLayer rootLayer = bimPersistence.findRoot();
		if (rootLayer == null || rootLayer.getClassName() == null || rootLayer.getClassName().isEmpty()) {
			throw new BimError("Root layer not configured");
		}
		if (className.equals(rootLayer.getClassName())) {
			rootId = cardId;
		} else {
			final StorableLayer layer = bimPersistence.readLayer(className);
			if (layer == null || layer.getRootReference() == null || layer.getRootReference().isEmpty()) {
				throw new BimError("'" + className + "' layer not configured");
			}
			final String referenceRoot = layer.getRootReference();
			rootId = bimDataView.getRootId(cardId, className, referenceRoot);
			if (rootId == null) {
				throw new BimError(referenceRoot + " is null for card '" + cardId + "' of class '" + className + "'");
			}
		}
		return rootId;
	}

	private String getBaseProjectIdForCardOfClass(final Long cardId, final String className) {
		final Long rootId = getRootId(cardId, className);
		final StorableLayer rootLayer = bimPersistence.findRoot();
		final String baseProjectId = getProjectIdForRootClass(rootId, rootLayer.getClassName());
		return baseProjectId;
	}

	private String getProjectIdForRootClass(final Long rootId, final String rootClassName) {
		final Long projectCardId = bimDataView.getProjectCardIdFromRootCard(rootId, rootClassName);
		final String projectId = bimPersistence.getProjectIdFromCardId(projectCardId);
		return projectId;
	}

	private String getLastRevisionOfProject(final String projectId) {
		String revisionId = EMPTY;
		if (!projectId.isEmpty()) {
			revisionId = bimServiceFacade.getLastRevisionOfProject(projectId);
		}
		return revisionId;
	}

}
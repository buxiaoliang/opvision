package org.cmdbuild.services.bim;

public class BimRootReferenceCommand extends BimDataModelCommand {

	public BimRootReferenceCommand(final BimPersistence bimDataPersistence,
			final BimDataModelManager dataModelManager) {
		super(bimDataPersistence, dataModelManager);
	}

	@Override
	public void execute(final String className, final String value) {
		dataPersistence.saveRootReferenceName(className, value);

	}

}

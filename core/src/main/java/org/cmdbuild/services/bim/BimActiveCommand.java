package org.cmdbuild.services.bim;

public class BimActiveCommand extends BimDataModelCommand {

	public BimActiveCommand(final BimPersistence bimDataPersistence, final BimDataModelManager dataModelManager) {
		super(bimDataPersistence, dataModelManager);
	}

	@Override
	public void execute(final String className, final String value) {

		if (Boolean.parseBoolean(value)) {
			dataModelManager.createBimTableIfNeeded(className);
		}
		dataPersistence.saveActiveFlag(className, value);
	}

}

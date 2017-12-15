package org.cmdbuild.services.bim.connector;

import org.cmdbuild.bim.model.Entity;
import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.services.bim.BimDataView;

public class DefaultBimMapper implements Mapper {

	private final BimDataView bimdataView;
	private final ImportDifferListener listener;

	public DefaultBimMapper(final CardDiffer cardDiffer, final BimDataView bimDataView) {
		this.bimdataView = bimDataView;
		this.listener = new ImportDifferListener() {

			@Override
			public void createTarget(final Entity source) {
				cardDiffer.createCard(source);
			}

			@Override
			public void updateTarget(final Entity source, final CMCard target) {
				cardDiffer.updateCard(source, target);
			}

			@Override
			public void deleteTarget(final CMCard target) {
				new UnsupportedOperationException();
			}
		};
	}

	@Override
	public void update(final Iterable<Entity> source) {
		for (final Entity sourceEntity : source) {
			final CMCard matchingCard = bimdataView.getCmCardFromGlobalId(sourceEntity.getKey(),
					sourceEntity.getTypeName());
			if (matchingCard != null) {
				listener.updateTarget(sourceEntity, matchingCard);
			} else {
				listener.createTarget(sourceEntity);
			}
		}

	}

}

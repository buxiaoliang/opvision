package org.cmdbuild.services.bim.connector;

import static org.cmdbuild.bim.utils.BimConstants.FK_COLUMN_NAME;
import static org.cmdbuild.bim.utils.BimConstants.GLOBALID_ATTRIBUTE;

import org.cmdbuild.bim.model.Entity;
import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.dao.entry.CMCard.CMCardDefinition;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.logic.data.lookup.LookupLogic;
import org.cmdbuild.services.bim.BimDataView;
import org.cmdbuild.utils.bim.BimIdentifier;

public class BimCardDiffer implements CardDiffer {

	private final CardDiffer defaultCardDiffer;
	private final CMDataView dataView;

	private BimCardDiffer(final CMDataView dataView, final LookupLogic lookupLogic, final BimDataView bimDataView) {
		this.defaultCardDiffer = new OptimizedDefaultCardDiffer(dataView, lookupLogic, bimDataView);
		this.dataView = dataView;
	}

	public static BimCardDiffer buildBimCardDiffer(final CMDataView dataView, final LookupLogic lookupLogic,
			final BimDataView bimDataView) {
		return new BimCardDiffer(dataView, lookupLogic, bimDataView);
	}

	@Override
	public CMCard updateCard(final Entity sourceEntity, final CMCard oldCard) {
		final CMCard updatedCard = defaultCardDiffer.updateCard(sourceEntity, oldCard);
		return updatedCard;
	}

	@Override
	public CMCard createCard(final Entity sourceEntity) {
		final CMCard newCard = defaultCardDiffer.createCard(sourceEntity);
		if (newCard != null) {
			createBimCard(newCard, sourceEntity);
		}
		return newCard;
	}

	private CMCard createBimCard(final CMCard newCard, final Entity sourceEntity) {
		final String cmdbClassName = sourceEntity.getTypeName();
		final Long id = newCard.getId();
		final CMClass bimClass = dataView.findClass(BimIdentifier.newIdentifier().withName(cmdbClassName));
		final CMCardDefinition bimCard = dataView.createCardFor(bimClass);
		bimCard.set(GLOBALID_ATTRIBUTE, sourceEntity.getKey());
		bimCard.set(FK_COLUMN_NAME, id.toString());
		return bimCard.save();
	}

}

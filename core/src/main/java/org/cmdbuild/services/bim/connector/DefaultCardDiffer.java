package org.cmdbuild.services.bim.connector;

import static org.cmdbuild.logic.data.lookup.LookupLogic.UNUSED_LOOKUP_QUERY;
import static org.cmdbuild.logic.data.lookup.LookupLogic.UNUSED_LOOKUP_TYPE_QUERY;

import java.util.Iterator;

import org.cmdbuild.bim.model.Attribute;
import org.cmdbuild.bim.model.Entity;
import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.dao.entry.CMCard.CMCardDefinition;
import org.cmdbuild.dao.entry.IdAndDescription;
import org.cmdbuild.dao.entrytype.CMAttribute;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.attributetype.CMAttributeType;
import org.cmdbuild.dao.entrytype.attributetype.LookupAttributeType;
import org.cmdbuild.dao.entrytype.attributetype.ReferenceAttributeType;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.data.store.lookup.Lookup;
import org.cmdbuild.data.store.lookup.LookupType;
import org.cmdbuild.logic.data.lookup.LookupLogic;
import org.cmdbuild.services.bim.BimDataView;
import org.cmdbuild.services.bim.DefaultBimDataView.BimCard;
import org.slf4j.Logger;

public class DefaultCardDiffer implements CardDiffer {

	private final BimDataView bimdataView;
	private final CMDataView dataView;
	private final LookupLogic lookupLogic;
	private final Logger logger = org.cmdbuild.bim.logging.LoggingSupport.logger;

	public DefaultCardDiffer(final CMDataView dataView, final LookupLogic lookupLogic, final BimDataView bimDataView) {
		this.bimdataView = bimDataView;
		this.dataView = dataView;
		this.lookupLogic = lookupLogic;
	}

	@Override
	public CMCard updateCard(final Entity sourceEntity, final CMCard oldCard) {
		CMCard updatedCard = null;
		final CMClass theClass = oldCard.getType();
		final String className = theClass.getName();
		if (!className.equals(sourceEntity.getTypeName())) {
			return updatedCard;
		}

		final CMCardDefinition cardDefinition = dataView.update(oldCard);
		final Iterable<? extends CMAttribute> attributes = theClass.getAttributes();
		logger.info("Updating card " + oldCard.getId() + " of type " + className);
		boolean sendDelta = false;

		for (final CMAttribute attribute : attributes) {
			final String attributeName = attribute.getName();

			final CMAttributeType<?> attributeType = attribute.getType();
			final boolean isReference = attributeType instanceof ReferenceAttributeType;
			final boolean isLookup = attributeType instanceof LookupAttributeType;
			final Object oldAttributeValue = oldCard.get(attributeName);

			if (sourceEntity.getAttributeByName(attributeName).isValid()) {
				if (isReference || isLookup) {
					final IdAndDescription oldReference = (IdAndDescription) oldAttributeValue;
					Long newReferencedId = null;
					if (isReference) {
						final String newReferencedKey = sourceEntity.getAttributeByName(attributeName).getValue();
						BimCard bimData = bimdataView.getBimDataFromGlobalid(newReferencedKey);
						newReferencedId = bimData.getId();
					} else if (isLookup) {
						final String lookupType = ((LookupAttributeType) attribute.getType()).getLookupTypeName();
						final String newLookupValue = sourceEntity.getAttributeByName(attributeName).getValue();
						newReferencedId = findLookupIdFromDescription(newLookupValue, lookupType);
					}
					if (newReferencedId != null && !newReferencedId.equals(oldReference.getId())) {
						final IdAndDescription newReference = new IdAndDescription(newReferencedId, "");
						cardDefinition.set(attributeName, newReference);
						sendDelta = true;
						logger.debug("attributeName {} attributeValue {}", attributeName, newReferencedId);
					}
				} else {
					final Object newAttributeValue = attributeType
							.convertValue(sourceEntity.getAttributeByName(attributeName).getValue());
					if ((newAttributeValue != null && !newAttributeValue.equals(oldAttributeValue))
							|| (newAttributeValue == null && oldAttributeValue != null)) {
						cardDefinition.set(attributeName, newAttributeValue);
						sendDelta = true;
						logger.debug("attributeName {} attributeValue {}", attributeName, newAttributeValue);
					}
				}
			}
		}
		if (sendDelta) {
			updatedCard = cardDefinition.save();
			logger.info("Card updated");
		}
		return updatedCard;
	}

	@Override
	public CMCard createCard(final Entity sourceEntity) {
		CMCard newCard = null;
		final String className = sourceEntity.getTypeName();
		final CMClass theClass = dataView.findClass(className);
		if (theClass == null) {
			logger.warn("Class " + className + " not found");
			return null;
		}
		final CMCardDefinition cardDefinition = dataView.createCardFor(theClass);

		final Iterable<? extends CMAttribute> attributes = theClass.getAttributes();
		logger.info("Building card of type " + className);
		boolean sendDelta = false;

		for (final CMAttribute attribute : attributes) {
			final String attributeName = attribute.getName();
			final boolean isReference = attribute.getType() instanceof ReferenceAttributeType;
			final boolean isLookup = attribute.getType() instanceof LookupAttributeType;
			final Attribute sourceAttribute = sourceEntity.getAttributeByName(attributeName);
			if (sourceAttribute.isValid()) {
				if (isReference || isLookup) {
					Long newReferencedId = null;
					if (isReference) {
						final String referencedGuid = sourceAttribute.getValue();
						BimCard bimData = bimdataView.getBimDataFromGlobalid(referencedGuid);
						newReferencedId = bimData.getId();
					} else if (isLookup) {
						final String newLookupValue = sourceAttribute.getValue();
						final String lookupType = ((LookupAttributeType) attribute.getType()).getLookupTypeName();
						newReferencedId = findLookupIdFromDescription(newLookupValue, lookupType);
					}
					if (newReferencedId != null) {
						sourceAttribute.setValue(newReferencedId.toString());
						cardDefinition.set(attributeName, sourceAttribute.getValue());
						sendDelta = true;
						logger.debug("attributeName {} attributeValue {}", attributeName, newReferencedId);
					}
				} else {
					cardDefinition.set(attributeName, sourceAttribute.getValue());
					sendDelta = true;
					logger.debug("attributeName {} attributeValue {}", attributeName, sourceAttribute.getValue());
				}
			}
		}
		if (sendDelta) {
			newCard = cardDefinition.save();
		}
		return newCard;
	}

	private Long findLookupIdFromDescription(final String lookupValue, final String lookupType) {
		Long lookupId = null;
		final Iterable<LookupType> allLookupTypes = lookupLogic.getAllTypes(UNUSED_LOOKUP_TYPE_QUERY);
		LookupType theType = null;
		for (final Iterator<LookupType> it = allLookupTypes.iterator(); it.hasNext();) {
			final LookupType lt = it.next();
			if (lt.name.equals(lookupType)) {
				theType = lt;
				break;
			}
		}
		final Iterable<Lookup> allLookusOfType = lookupLogic.getAllLookup(theType, true, UNUSED_LOOKUP_QUERY);

		for (final Iterator<Lookup> it = allLookusOfType.iterator(); it.hasNext();) {
			final Lookup l = it.next();
			if (l.getDescription() != null && l.getDescription().equals(lookupValue)) {
				lookupId = l.getId();
				break;
			}
		}
		return lookupId;
	}

}

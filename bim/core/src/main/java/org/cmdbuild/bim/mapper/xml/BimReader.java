package org.cmdbuild.bim.mapper.xml;

import java.util.List;

import org.cmdbuild.bim.logging.LoggingSupport;
import org.cmdbuild.bim.mapper.DefaultAttribute;
import org.cmdbuild.bim.mapper.DefaultEntity;
import org.cmdbuild.bim.mapper.Reader;
import org.cmdbuild.bim.model.Attribute;
import org.cmdbuild.bim.model.AttributeDefinition;
import org.cmdbuild.bim.model.Entity;
import org.cmdbuild.bim.model.EntityDefinition;
import org.cmdbuild.bim.model.implementation.ListAttributeDefinition;
import org.cmdbuild.bim.model.implementation.ReferenceAttributeDefinition;
import org.cmdbuild.bim.model.implementation.SimpleAttributeDefinition;
import org.cmdbuild.bim.service.BimError;
import org.cmdbuild.bim.service.BimService;
import org.cmdbuild.bim.service.ListAttribute;
import org.cmdbuild.bim.service.ReferenceAttribute;
import org.cmdbuild.bim.service.SimpleAttribute;
import org.slf4j.Logger;

import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;

public class BimReader implements Reader {

	private static final Logger logger = LoggingSupport.logger;

	private final BimService service;
	private String revisionId;

	public BimReader(final BimService service) {
		this.service = service;
	}

	@Override
	public List<Entity> readEntities(final String revisionId, final EntityDefinition entityDefinition) {
		this.revisionId = revisionId;
		final List<Entity> entities = Lists.newArrayList();
		read(new ReaderListener() {
			@Override
			public void retrieved(final Entity entity) {
				entities.add(entity);
			}

		}, entityDefinition);
		return entities;
	}

	private void read(final ReaderListener listener, final EntityDefinition entityDefinition) {

		logger.debug("reading data for revision " + revisionId + " for class " + entityDefinition.getIfcType()
				+ " corresponding to " + entityDefinition.getCmClass());
		if (entityDefinition.isValid()) {
			final Iterable<Entity> entities = service.getEntitiesByType(entityDefinition.getIfcType(), revisionId);
			if (Iterables.size(entities) == 0) {
				throw new BimError(
						"No entities of type " + entityDefinition.getIfcType() + " found in revision " + revisionId);
			}
			logger.debug(Iterables.size(entities) + " entities found");
			for (final Entity entity : entities) {
				final Entity entityToFill = DefaultEntity.withTypeAndKey(entityDefinition.getCmClass(),
						entity.getKey());
				if (!entityToFill.isValid()) {
					continue;
				}
				final boolean toInsert = readEntityAttributes(entity, entityDefinition, revisionId, entityToFill);
				if (toInsert) {
					listener.retrieved(entityToFill);
				}
			}
		}
	}

	private boolean readEntityAttributes(final Entity entity, final EntityDefinition entityDefinition,
			final String revisionId, final Entity retrievedEntity) {
		final Iterable<AttributeDefinition> attributesToRead = entityDefinition.getAttributes();
		boolean exit = false;
		for (final AttributeDefinition attributeDefinition : attributesToRead) {
			logger.debug("attribute " + attributeDefinition.getIfcName() + " of entity " + entity.getTypeName());
			if (!exit) {
				final String attributeName = attributeDefinition.getIfcName();
				final Attribute attribute = entity.getAttributeByName(attributeName);
				if (attribute.isValid()) {
					if (attributeDefinition instanceof SimpleAttributeDefinition) {
						final SimpleAttributeDefinition simpleAttributeDefinition = (SimpleAttributeDefinition) attributeDefinition;
						if (simpleAttributeDefinition.getValue() != "") {
							logger.debug(attributeName + " must have value " + simpleAttributeDefinition.getValue());
							logger.debug("It has value " + attribute.getValue());
							if (!simpleAttributeDefinition.getValue().equals(attribute.getValue())) {
								logger.debug("skip this entity");
								exit = true;
								return false;
							}
						}
						if (!exit) {
							logger.debug(attributeDefinition.getCmName() + ": " + attribute.getValue());
							final Attribute retrievedAttribute = DefaultAttribute
									.withNameAndValue(attributeDefinition.getCmName(), attribute.getValue());
							((DefaultEntity) retrievedEntity).addAttribute(retrievedAttribute);
						}
					} else if (attributeDefinition instanceof ReferenceAttributeDefinition) {
						final ReferenceAttribute referenceAttribute = (ReferenceAttribute) attribute;
						final Entity referencedEntity = service.getReferencedEntity(referenceAttribute, revisionId);
						final EntityDefinition referencedEntityDefinition = attributeDefinition.getReference();

						if (referencedEntity.isValid() && referencedEntityDefinition.isValid()) {
							readEntityAttributes(referencedEntity, referencedEntityDefinition, revisionId,
									retrievedEntity);
						} else {
							logger.debug("referenced entity valid " + referencedEntity.isValid());
						}
					} else if (attributeDefinition instanceof ListAttributeDefinition) {
						final ListAttribute list = (ListAttribute) attribute;
						int count = 1;
						for (final Attribute value : list.getValues()) {
							if (value instanceof ReferenceAttribute) {

								final ReferenceAttribute referenceAttribute = (ReferenceAttribute) value;
								final Entity referencedEntity = service.getReferencedEntity(referenceAttribute,
										revisionId);

								for (final EntityDefinition nestedEntityDefinition : ((ListAttributeDefinition) attributeDefinition)
										.getAllReferences()) {
									if (referencedEntity.isValid() && nestedEntityDefinition.isValid()) {
										readEntityAttributes(referencedEntity, nestedEntityDefinition, revisionId,
												retrievedEntity);
									} else {

									}
								}
							} else {
								final SimpleAttribute simpleAttribute = (SimpleAttribute) value;
								if (list.getValues().size() > 1) {
									final Attribute retrievedAttribute = DefaultAttribute.withNameAndValue(
											attributeDefinition.getCmName() + "" + count,
											simpleAttribute.getStringValue());
									((DefaultEntity) retrievedEntity).addAttribute(retrievedAttribute);
								} else {

									final Attribute retrievedAttribute = DefaultAttribute.withNameAndValue(
											attributeDefinition.getCmName(), simpleAttribute.getStringValue());
									((DefaultEntity) retrievedEntity).addAttribute(retrievedAttribute);
								}
								count++;
							}
						}
					}
				}
			}
		}
		return true;
	}

}

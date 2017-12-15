package org.cmdbuild.services.bim;

import static org.cmdbuild.bim.utils.BimConstants.GLOBALID_ATTRIBUTE;
import static org.cmdbuild.bim.utils.BimConstants.FK_COLUMN_NAME;

import javax.sql.DataSource;

import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.data.converter.StorableProjectConverter;
import org.cmdbuild.logic.data.DataDefinitionLogic;
import org.cmdbuild.logic.data.lookup.LookupLogic;
import org.cmdbuild.model.data.Attribute;
import org.cmdbuild.model.data.Attribute.AttributeBuilder;
import org.cmdbuild.model.data.Domain;
import org.cmdbuild.model.data.Domain.DomainBuilder;
import org.cmdbuild.model.data.EntryType;
import org.cmdbuild.model.data.EntryType.ClassBuilder;
import org.cmdbuild.model.data.EntryType.TableType;
import org.cmdbuild.utils.bim.BimIdentifier;

public class DefaultBimDataModelManager implements BimDataModelManager {

	public static final String PROJECTID = "ProjectId";
	private final CMDataView dataView;
	private final DataDefinitionLogic dataDefinitionLogic;

	public static final String BIM_SCHEMA = "bim";
	public static final String DEFAULT_DOMAIN_SUFFIX = StorableProjectConverter.TABLE_NAME;

	public DefaultBimDataModelManager(final CMDataView dataView, final DataDefinitionLogic dataDefinitionLogic,
			final LookupLogic lookupLogic, final DataSource dataSource) {
		this.dataView = dataView;
		this.dataDefinitionLogic = dataDefinitionLogic;
	}

	@Override
	public void createBimTableIfNeeded(final String className) {
		final CMClass bimClass = dataView.findClass(BimIdentifier.newIdentifier().withName(className));
		if (bimClass == null) {
			createBimTable(className);
		}
	}

	@Override
	public void createBimDomainOnClass(final String className) {
		final CMClass theClass = dataView.findClass(className);
		final CMClass projectClass = dataView.findClass(StorableProjectConverter.TABLE_NAME);
		final DomainBuilder domainBuilder = Domain.newDomain() //
				.withName(className + DEFAULT_DOMAIN_SUFFIX) //
				.withIdClass1(theClass.getId()) //
				.withIdClass2(projectClass.getId()) //
				.withCardinality("N:1");

		final Domain domain = domainBuilder.build();

		dataDefinitionLogic.create(domain);
	}

	@Override
	public void deleteBimDomainIfExists(final String className) {
		dataDefinitionLogic.deleteDomainIfExists(className + DEFAULT_DOMAIN_SUFFIX);
	}

	private void createBimTable(final String className) {
		final ClassBuilder classBuilder = EntryType.newClass() //
				.withName(className) //
				.withNamespace(BIM_SCHEMA) //
				.withTableType(TableType.simpletable)//
				.thatIsSystem(true);
		dataDefinitionLogic.createOrUpdate(classBuilder.build());

		AttributeBuilder attributeBuilder = Attribute.newAttribute() //
				.withName(GLOBALID_ATTRIBUTE) //
				.withType(Attribute.AttributeTypeBuilder.STRING) //
				.withLength(22) //
				.thatIsUnique(true) //
				.thatIsMandatory(true) //
				.withOwnerName(className) //
				.withOwnerNamespace(BIM_SCHEMA);

		final Attribute attributeGlobalId = attributeBuilder.build();
		dataDefinitionLogic.createOrUpdate(attributeGlobalId);

		attributeBuilder = Attribute.newAttribute() //
				.withName(FK_COLUMN_NAME) //
				.withType(Attribute.AttributeTypeBuilder.FOREIGNKEY) //
				.thatIsUnique(true) //
				.thatIsMandatory(true) //
				.withOwnerName(className) //
				.withOwnerNamespace(BIM_SCHEMA) //
				.withForeignKeyDestinationClassName(className);
		final Attribute attributeMaster = attributeBuilder.build();
		dataDefinitionLogic.createOrUpdate(attributeMaster);
	}

}

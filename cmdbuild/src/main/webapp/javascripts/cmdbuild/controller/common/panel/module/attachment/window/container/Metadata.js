(function () {

	/**
	 * Not managed as Ext.form.Field to use normal form validation and avoid imprecise validation errors
	 */
	Ext.define('CMDBuild.controller.common.panel.module.attachment.window.container.Metadata', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'panelModuleAttachmentWindowContainerMetadataFieldsAdd',
			'panelModuleAttachmentWindowContainerMetadataValuesGet',
			'panelModuleAttachmentWindowContainerMetadataValuesSet'
		],

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.container.MetadataView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.panel.module.attachment.Grid} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.panel.module.attachment.window.container.MetadataView', { delegate: this });
		},

		/**
		 * @param {CMDBuild.model.common.panel.module.attachment.category.MetadataGroup} metadataGroupModel
		 *
		 * @returns {Array} fields
		 *
		 * @private
		 */
		buildMetadataGroupFields: function (metadataGroupModel) {
			var fields = [];

			if (Ext.isObject(metadataGroupModel) && !Ext.Object.isEmpty(metadataGroupModel)) {
				var fieldManager = Ext.create('CMDBuild.core.fieldManager.FieldManager', { parentDelegate: this });

				Ext.Array.each(metadataGroupModel.get(CMDBuild.core.constants.Proxy.META), function (fieldObject, i, allFieldObjects) {
					var field = undefined;

					if (fieldManager.isAttributeManaged(fieldObject[CMDBuild.core.constants.Proxy.TYPE])) {
						fieldManager.attributeModelSet(Ext.create('CMDBuild.model.common.attributes.Attribute', fieldObject));

						field = fieldManager.buildField();
					} else { // @deprecated - Old field manager
						fieldObject['isnotnull'] = fieldObject[CMDBuild.core.constants.Proxy.MANDATORY];

						field = CMDBuild.Management.FieldManager.getFieldForAttr(fieldObject);

						if (!Ext.isEmpty(field))
							field.maxWidth = field.width || CMDBuild.core.constants.FieldWidths.STANDARD_MEDIUM;
					}

					if (!Ext.isEmpty(field)) {
						field.submitValue = false;
						field[CMDBuild.core.constants.Proxy.METADATA_GROUP_NAME] = metadataGroupModel.get(CMDBuild.core.constants.Proxy.NAME);

						fields.push(field);
					}
				}, this);
			}

			return fields;
		},

		/**
		 * @param {String} category
		 *
		 * @returns {Void}
		 */
		panelModuleAttachmentWindowContainerMetadataFieldsAdd: function (category) {
			// Error handling
				if (!Ext.isString(category) || Ext.isEmpty(category))
					return _error('panelModuleAttachmentWindowContainerMetadataFieldsAdd(): unmanaged category parameter', this, category);
			// END: Error handling

			this.panelModuleAttachmentWindowContainerMetadataReset();

			if (!this.cmfg('panelModuleAttachmentGridCategoriesIsEmpty', { name: category })) {
				var categoryModel = this.cmfg('panelModuleAttachmentGridCategoriesGet', { name: category }),
					fields = [];

				Ext.Array.forEach(categoryModel.get(CMDBuild.core.constants.Proxy.METADATA_GROUPS), function (metadataGroupModel, i, allMetadataGroupModels) {
					if (Ext.isObject(metadataGroupModel) && !Ext.Object.isEmpty(metadataGroupModel)) {
						var groupFields = this.buildMetadataGroupFields(metadataGroupModel);

						if (Ext.isArray(groupFields) && !Ext.isEmpty(groupFields))
							fields = Ext.Array.push(fields, groupFields);
					}
				}, this);

				if (Ext.isArray(fields) && !Ext.isEmpty(fields)) {
					this.view.add(fields);
					this.view.show();
				}
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		panelModuleAttachmentWindowContainerMetadataReset: function () {
			this.view.removeAll(false);
			this.view.hide();
		},

		/**
		 * @returns {Object} out
		 */
		panelModuleAttachmentWindowContainerMetadataValuesGet: function () {
			var out = {};

			Ext.Array.forEach(this.view.items.getRange(), function (field, i, allFields) {
				if (Ext.isObject(field) && !Ext.Object.isEmpty(field)) {
					// Create group
					if (Ext.isEmpty(out[field[CMDBuild.core.constants.Proxy.METADATA_GROUP_NAME]]))
						out[field[CMDBuild.core.constants.Proxy.METADATA_GROUP_NAME]] = {};

					out[field[CMDBuild.core.constants.Proxy.METADATA_GROUP_NAME]][field.getName()] = field.getValue();
				}
			}, this);

			return out;
		},

		/**
		 * @param {Object} value
		 *
		 * @returns {Void}
		 */
		panelModuleAttachmentWindowContainerMetadataValuesSet: function (value) {
			if (Ext.isObject(value) && !Ext.Object.isEmpty(value)) {
				Ext.Array.forEach(this.view.items.getRange(), function (field, i, allFields) {
					if (
						Ext.isObject(field) && !Ext.Object.isEmpty(field)
						&& Ext.isObject(value[field[CMDBuild.core.constants.Proxy.METADATA_GROUP_NAME]])
						&& !Ext.Object.isEmpty(value[field[CMDBuild.core.constants.Proxy.METADATA_GROUP_NAME]])
						&& !Ext.isEmpty(value[field[CMDBuild.core.constants.Proxy.METADATA_GROUP_NAME]][field.getName()])
					) {
						field.setValue(value[field[CMDBuild.core.constants.Proxy.METADATA_GROUP_NAME]][field.getName()]);
					}
				}, this);
			}
		}
	});

})();

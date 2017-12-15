(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.panel.FieldsTab', {
		extend: 'CMDBuild.controller.common.panel.module.form.panel.FieldsTab',

		uses: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.tabs.activityNew.panel.Panel}
		 */
		parentDelegate: undefined,

		/**
		 * @return {Object} groupedFields
		 *
		 * @override
		 * @private
		 */
		buildGroupedFields: function () {
			var groupedFields = {};

			if (!this.cmfg('workflowSelectedInstanceAttributesIsEmpty')) {
				var fieldManager = Ext.create('CMDBuild.core.fieldManager.FieldManager', { parentDelegate: this }),
					groupedAttributes = fieldManager.groupAttributesModels(this.getActivityAttributes()),
					readOnly = this.cmfg('panelGridAndFormViewModeEquals', ['read', 'readOnly']);

				Ext.Object.each(groupedAttributes, function (name, attributes, myself) {
					if (Ext.isArray(attributes) && !Ext.isEmpty(attributes)) {
						var fields = [];

						Ext.Array.forEach(attributes, function (attribute, i, allAttributes) {
							if (fieldManager.isAttributeManaged(attribute.get(CMDBuild.core.constants.Proxy.TYPE))) {
								fieldManager.attributeModelSet(attribute);
								fieldManager.push(fields, fieldManager.buildField({ readOnly: readOnly }));
							} else { /** @deprecated - Old field manager */
								fields.push(
									CMDBuild.Management.FieldManager.getFieldForAttr(
										attribute.get(CMDBuild.core.constants.Proxy.SOURCE_OBJECT),
										readOnly,
										false
									)
								);
							}
						}, this);

						groupedFields[name] = fields;
					}
				}, this);
			}

			return groupedFields;
		},

		/**
		 * Returns only attributes witch are defined as variables for this Activity
		 *
		 * @returns {Array} attributes
		 *
		 * @private
		 */
		getActivityAttributes: function () {
			var attributes = [];

			if (!this.cmfg('workflowSelectedInstanceAttributesIsEmpty'))
				if (!this.cmfg('workflowSelectedActivityIsEmpty')) {
					Ext.Array.forEach(this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.VARIABLES), function (variableObject, i, allVariableObjects) {
						Ext.Array.each(this.cmfg('workflowSelectedInstanceAttributesGet'), function (attributeModel, i, allAttributeModels) {
							if (attributeModel.get(CMDBuild.core.constants.Proxy.NAME) == variableObject[CMDBuild.core.constants.Proxy.NAME]) {
								attributeModel.set(CMDBuild.core.constants.Proxy.MANDATORY, variableObject[CMDBuild.core.constants.Proxy.MANDATORY]);
								attributeModel.set(CMDBuild.core.constants.Proxy.WRITABLE, variableObject[CMDBuild.core.constants.Proxy.WRITABLE]);

								// Legacy object setup
									var sourceObject = attributeModel.get(CMDBuild.core.constants.Proxy.SOURCE_OBJECT);
									sourceObject['isnotnull'] = variableObject[CMDBuild.core.constants.Proxy.MANDATORY];
									sourceObject['fieldmode'] = variableObject[CMDBuild.core.constants.Proxy.WRITABLE] ? 'write' : 'read';

									attributeModel.get(CMDBuild.core.constants.Proxy.SOURCE_OBJECT, sourceObject);

								attributes.push(attributeModel);

								return false;
							}
						}, this);
					}, this);
				} else if (
					!this.cmfg('workflowSelectedInstanceIsEmpty')
					&& (
						this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.FLOW_STATUS) == CMDBuild.core.constants.WorkflowStates.getAbortedCapitalized()
						|| this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.FLOW_STATUS) == CMDBuild.core.constants.WorkflowStates.getCompletedCapitalized()
					)
				) {
					attributes = this.cmfg('workflowSelectedInstanceAttributesGet');
				}

			return attributes;
		}
	});

})();

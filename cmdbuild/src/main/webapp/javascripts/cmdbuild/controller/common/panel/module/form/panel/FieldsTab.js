(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormSelectedItemAttributesGet
	 * 	- panelGridAndFormSelectedItemAttributesIsEmpty
	 * 	- panelGridAndFormSelectedItemGet
	 * 	- panelGridAndFormSelectedItemIsEmpty
	 * 	- panelGridAndFormViewModeEquals
	 * 	- panelGridAndFormViewModeGet
	 */
	Ext.define('CMDBuild.controller.common.panel.module.form.panel.FieldsTab', {
		extend: 'CMDBuild.controller.common.panel.gridAndForm.panel.tab.Tab',

		uses: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.form.panel.Panel}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'panelGridAndFormMixinsManageTabActiveFireShowEvent = panelModuleFormPanelTabManageTabActiveFireShowEvent',
			'panelGridAndFormMixinsManageTabActiveSet = panelModuleFormPanelTabManageTabActiveSet',
			'panelGridAndFormMixinsManageTabActiveIsEmpty = panelModuleFormPanelTabManageTabActiveIsEmpty',
			'panelGridAndFormMixinsManageTabSelection = panelModuleFormPanelTabManageTabSelection',
			'panelModuleFormPanelTabFieldsBuild',
			'panelModuleFormPanelTabReset'
		],

		/**
		 * Definitions of all sub controller classes names
		 *
		 * @cfg {Object}
		 */
		subClassesNames: {
			view: 'CMDBuild.view.common.panel.module.form.panel.FieldsTabPanel'
		},

		/**
		 * @property {CMDBuild.view.common.panel.module.form.panel.FieldsTabPanel}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.panel.module.form.panel.Panel} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create(this.subClassesNames.view, {
				delegate: this,
				tabPosition: CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.CARD_TABS_POSITION) || 'bottom'
			});

			this.cmfg('panelModuleFormPanelTabManageTabSelection', { target: this.view });
		},

		/**
		 * @return {Object} groupedFields
		 *
		 * @private
		 */
		buildGroupedFields: function () {
			var groupedFields = {};

			if (!this.cmfg('panelGridAndFormSelectedItemAttributesIsEmpty')) {
				var fieldManager = Ext.create('CMDBuild.core.fieldManager.FieldManager', { parentDelegate: this }),
					groupedAttributes = fieldManager.groupAttributesModels(this.cmfg('panelGridAndFormSelectedItemAttributesGet')),
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
		 * @param {Object} groupedFields
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		buildTabsFromGroupedFields: function (groupedFields) {
			var panels = [];
			CMDBuild.clearComponent(this.view);

			if (!Ext.Object.isEmpty(groupedFields))
				Ext.Object.each(groupedFields, function (name, fields, myself) {
					if (Ext.isArray(fields) && !Ext.isEmpty(fields))
						panels.push(
							Ext.create('Ext.panel.Panel', {
								bodyCls: 'cmdb-blue-panel',
								border: false,
								frame: false,
								itemId: Ext.String.trim(name).replace(/\s+/g, ''),  // FIXME: waitinf for refactor (attribute's group identifiers)
								labelAlign: 'right',
								overflowY: 'auto',
								title: name,
								items: fields
							})
						);
				}, this);

			if (!Ext.isEmpty(panels))
				this.view.add(panels);

			this.view.getTabBar().setVisible(panels.length > 1);
		},

		/**
		 * @param {Object} parameters
		 * @param {Object or String or Number} parameters.subTabToSelect
		 *
		 * @return {Void}
		 */
		panelModuleFormPanelTabFieldsBuild: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			var activeTabItemId = undefined;

			// Error handling
				if (this.cmfg('panelGridAndFormSelectedEntityIsEmpty'))
					return _error('panelModuleFormPanelTabFieldsBuild(): unmanaged selectedEntity property', this, this.cmfg('panelGridAndFormSelectedEntityGet'));
			// END: Error handling

			// Preserve active tab selection over tab rebuild (step 1)
			if (!this.cmfg('panelModuleFormPanelTabManageTabActiveIsEmpty', { target: this.view }))
				activeTabItemId = this.view.getActiveTab().getItemId();

			this.buildTabsFromGroupedFields(this.buildGroupedFields());

			// SubTab selection manage
			if (!Ext.isEmpty(parameters.subTabToSelect))
				return this.cmfg('panelModuleFormPanelTabManageTabActiveSet', {
					tabToSelect: parameters.subTabToSelect,
					target: this.view
				});

			// Preserve active tab selection over tab rebuild (step 2)
			if (Ext.isString(activeTabItemId) && !Ext.isEmpty(activeTabItemId))
				return this.cmfg('panelModuleFormPanelTabManageTabActiveSet', {
					tabToSelect: activeTabItemId,
					target: this.view
				});

			this.cmfg('panelModuleFormPanelTabManageTabSelection', { target: this.view });
		},

		/**
		 * @returns {Void}
		 */
		panelModuleFormPanelTabReset: function () {
			if (!Ext.isEmpty(this.view.items)) {
				CMDBuild.clearComponent(this.view);
			    
			}
		}
	});

})();

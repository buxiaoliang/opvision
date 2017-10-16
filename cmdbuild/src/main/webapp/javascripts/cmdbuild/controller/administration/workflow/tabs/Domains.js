(function () {

	/**
	 * @link CMDBuild.controller.administration.classes.tabs.Domains
	 */
	Ext.define('CMDBuild.controller.administration.workflow.tabs.Domains', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.ModuleIdentifiers',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.workflow.tabs.Domains'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.workflow.Workflow}
		 */
		parentDelegate: undefined,

		/**
		 * @property {Array}
		 *
		 * @private
		 */
		bufferEntryTypes: {},


		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onWorkflowTabDomainsAddButtonClick',
			'onWorkflowTabDomainsAddWorkflowButtonClick',
			'onWorkflowTabDomainsIncludeInheritedCheck',
			'onWorkflowTabDomainsItemDoubleClick',
			'onWorkflowTabDomainsModifyButtonClick',
			'onWorkflowTabDomainsRemoveButtonClick',
			'onWorkflowTabDomainsRowSelect',
			'onWorkflowTabDomainsShow',
			'onWorkflowTabDomainsStoreLoad',
			'onWorkflowTabDomainsWorkflowSelected',
			'workflowTabDomainsBufferEntryTypesGet'
		],

		/**
		 * @property {CMDBuild.view.administration.workflow.tabs.domains.GridPanel}
		 */
		grid: undefined,

		/**
		 * Just the grid subset of domain properties, not a full domain object
		 *
		 * @property {CMDBuild.model.administration.workflow.tabs.domains.Grid}
		 *
		 * @private
		 */
		selectedDomain: undefined,

		/**
		 * @cfg {CMDBuild.view.administration.workflow.tabs.domains.DomainsView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.workflow.Workflow} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.workflow.tabs.domains.DomainsView', { delegate: this });

			// Shorthands
			this.grid = this.view.grid;
			this.includeInheritedCheckbox = this.view.includeInheritedCheckbox;
		},

		// BufferEntryTypes property functions
			/**
			 * @param {Object} parameters
			 * @param {String} parameters.attributeName
			 * @param {String} parameters.name
			 *
			 * @returns {CMDBuild.model.administration.workflow.tabs.domains.EntryType or null} selectedEntryType
			 */
			workflowTabDomainsBufferEntryTypesGet: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};

				var selectedEntryType = null;

				if (Ext.isString(parameters.name) && !Ext.isEmpty(parameters.name)) {
					selectedEntryType = this.bufferEntryTypes[parameters.name];

					if (Ext.isString(parameters.attributeName) && !Ext.isEmpty(parameters.attributeName))
						return selectedEntryType.get(parameters.attributeName);
				}

				return selectedEntryType;
			},

			/**
			 * @param {Array} classes
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowTabDomainsBufferEntryTypesSet: function (entryTypes) {
				if (Ext.isArray(entryTypes) && !Ext.isEmpty(entryTypes))
					Ext.Array.each(entryTypes, function (entryTypeObject, i, allEntryTypeObjects) {
						if (Ext.isObject(entryTypeObject) && !Ext.Object.isEmpty(entryTypeObject)) {
							var model = Ext.create('CMDBuild.model.administration.workflow.tabs.domains.EntryType', entryTypeObject);

							this.bufferEntryTypes[model.get(CMDBuild.core.constants.Proxy.NAME)] = model;
						}
					}, this);
			},

		/**
		 * @returns {Void}
		 */
		onWorkflowTabDomainsAddButtonClick: function () {
			var moduleController = this.cmfg('mainViewportModuleControllerGet', CMDBuild.core.constants.ModuleIdentifiers.getDomain());

			if (Ext.isObject(moduleController) && !Ext.Object.isEmpty(moduleController)	&& Ext.isFunction(moduleController.cmfg))
				moduleController.cmfg('domainExternalServicesAddButtonClick');
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTabDomainsAddWorkflowButtonClick: function () {
			this.view.disable();
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTabDomainsIncludeInheritedCheck: function () {
			if (this.includeInheritedCheckbox.getValue()) {
				this.grid.getStore().clearFilter();
			} else {
				this.grid.getStore().filterBy(function (record) {
					return !record.get(CMDBuild.core.constants.Proxy.INHERITED);
				});
			}
		},

		/**
		 * @param {CMDBuild.model.administration.workflow.tabs.domains.Grid} record
		 *
		 * @returns {Void}
		 */
		onWorkflowTabDomainsItemDoubleClick: function (record) {
			// Error handling
			if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
				return _error('onWorkflowTabDomainsItemDoubleClick(): unmanaged record parameter', this, record);
		// END: Error handling

		var moduleController = this.cmfg('mainViewportModuleControllerGet', CMDBuild.core.constants.ModuleIdentifiers.getDomain());

		if (Ext.isObject(moduleController) && !Ext.Object.isEmpty(moduleController)	&& Ext.isFunction(moduleController.cmfg))
			moduleController.cmfg('domainExternalServicesItemDoubleClick', { id: record.get(CMDBuild.core.constants.Proxy.ID_DOMAIN) });
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTabDomainsModifyButtonClick: function () {
			// Error handling
				if (this.selectedDomainIsEmpty())
					return _error('onClassesTabDomainsModifyButtonClick(): unmanaged selectedDomain parameter', this, this.selectedDomainGet());
			// END: Error handling

			if (
				this.cmfg('mainViewportAccordionControllerExists', CMDBuild.core.constants.ModuleIdentifiers.getDomain())
				&& this.cmfg('mainViewportModuleControllerExists', CMDBuild.core.constants.ModuleIdentifiers.getDomain())
			) {
				var moduleController = this.cmfg('mainViewportModuleControllerGet', CMDBuild.core.constants.ModuleIdentifiers.getDomain());

				if (Ext.isObject(moduleController) && !Ext.Object.isEmpty(moduleController)	&& Ext.isFunction(moduleController.cmfg))
					moduleController.cmfg('domainExternalServicesModifyButtonClick', { id: this.selectedDomainGet(CMDBuild.core.constants.Proxy.ID_DOMAIN) });
			}
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTabDomainsRemoveButtonClick: function () {
			Ext.Msg.show({
				title: CMDBuild.Translation.common.confirmpopup.title,
				msg: CMDBuild.Translation.common.confirmpopup.areyousure,
				buttons: Ext.Msg.YESNO,
				scope: this,

				fn: function (buttonId, text, opt) {
					if (buttonId == 'yes')
						this.removeItem();
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTabDomainsRowSelect: function () {
			if (this.grid.getSelectionModel().hasSelection())
				this.selectedDomainSet({ value: this.grid.getSelectionModel().getSelection()[0] });

			this.view.setDisabledTopBar(!this.grid.getSelectionModel().hasSelection());
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTabDomainsShow: function () {
			if (!this.cmfg('workflowSelectedWorkflowIsEmpty')) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);

				this.grid.getStore().load({
					params: params,
					scope: this,
					callback: function (records, operation, success) {
						if (!this.grid.getSelectionModel().hasSelection())
							this.grid.getSelectionModel().select(0, true);

						this.cmfg('onWorkflowTabDomainsRowSelect');
					}
				});
			}
		},

		/**
		 * Enable/Disable tab on workflow selection
		 *
		 * @returns {Void}
		 */
		onWorkflowTabDomainsWorkflowSelected: function () {
			CMDBuild.proxy.administration.workflow.tabs.Domains.readAllEntryTypes({
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.CLASSES];

					this.workflowTabDomainsBufferEntryTypesSet(decodedResponse);

					this.view.setDisabled(
						this.cmfg('workflowSelectedWorkflowIsEmpty')
						|| this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.TABLE_TYPE) == CMDBuild.core.constants.Global.getTableTypeSimpleTable()
					);
				}
			});
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		removeItem: function () {
			if (!this.selectedDomainIsEmpty()) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.DOMAIN_NAME] = this.selectedDomainGet(CMDBuild.core.constants.Proxy.NAME);

				CMDBuild.proxy.administration.workflow.tabs.Domains.remove({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						this.selectedDomainReset();

						this.cmfg('onWorkflowTabDomainsShow');
					}
				});
			}
		},

		// SelectedDomain property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 *
			 * @private
			 */
			selectedDomainGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedDomain';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 *
			 * @private
			 */
			selectedDomainIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedDomain';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @param {Object} parameters
			 *
			 * @private
			 */
			selectedDomainReset: function (parameters) {
				this.propertyManageReset('selectedDomain');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @private
			 */
			selectedDomainSet: function (parameters) {
				if (!Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.administration.workflow.tabs.domains.Grid';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedDomain';

					this.propertyManageSet(parameters);
				}
			}
	});

})();

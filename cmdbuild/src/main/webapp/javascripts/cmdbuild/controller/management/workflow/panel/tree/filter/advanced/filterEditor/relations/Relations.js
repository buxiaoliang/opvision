(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.relations.Relations', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.FilterEditor}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onWorkflowTreeFilterAdvancedFilterEditorRelationsCheckchange',
			'onWorkflowTreeFilterAdvancedFilterEditorRelationsDomainSelect',
			'onWorkflowTreeFilterAdvancedFilterEditorRelationsInit',
			'workflowTreeFilterAdvancedFilterEditorRelationsDataGet',
			'workflowTreeFilterAdvancedFilterEditorRelationsSelectedDomainGet',
			'workflowTreeFilterAdvancedFilterEditorRelationsSelectedDomainIsEmpty',
			'workflowTreeFilterAdvancedFilterEditorRelationsSelectedDomainSet',
			'workflowTreeFilterAdvancedFilterEditorRelationsSelectionManage'
		],

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.relations.GridDomain}
		 */
		controllerGridDomain: undefined,

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.relations.GridCard}
		 */
		controllerGridCard: undefined,

		/**
		 * @property {CMDBuild.model.management.workflow.panel.tree.filter.advanced.filterEditor.relations.DomainGrid}
		 *
		 * @private
		 */
		selectedDomain: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.tree.filter.advanced.filterEditor.relations.RelationsView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.FilterEditor} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.tree.filter.advanced.filterEditor.relations.RelationsView', { delegate: this });

			// Sub-controllers
			this.controllerGridCard = Ext.create('CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.relations.GridCard', { parentDelegate: this });
			this.controllerGridDomain = Ext.create('CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.relations.GridDomain', { parentDelegate: this });

			this.view.add([
				this.controllerGridCard.getView(),
				this.controllerGridDomain.getView()
			]);
		},

		/**
		 * Decodes filter object and launch creation of form items
		 *
		 * @param {Object} filterConfigurationObject
		 *
		 * @returns {Mixed}
		 *
		 * @private
		 */
		decodeFilterConfigurationObject: function (filterConfigurationObject) {
			if (Ext.isArray(filterConfigurationObject) && !Ext.isEmpty(filterConfigurationObject))
				Ext.Array.each(filterConfigurationObject, function (configurationObject, i, allConfigurationObjects) {
					if (Ext.isObject(configurationObject) && !Ext.Object.isEmpty(configurationObject)) {
						var domainRecord = null;

						var recordIndex = this.controllerGridDomain.getView().getStore().findBy(function (record) {
							return (
								record.get([CMDBuild.core.constants.Proxy.DOMAIN, CMDBuild.core.constants.Proxy.NAME]) == configurationObject[CMDBuild.core.constants.Proxy.DOMAIN]
								&& record.get(CMDBuild.core.constants.Proxy.DIRECTION) == configurationObject[CMDBuild.core.constants.Proxy.DIRECTION]
							);
						});

						if (recordIndex >= 0)
							domainRecord = this.controllerGridDomain.getView().getStore().getAt(recordIndex);

						if (!Ext.isEmpty(domainRecord)) {
							domainRecord.setType(configurationObject[CMDBuild.core.constants.Proxy.TYPE]);

							if (Ext.isArray(configurationObject[CMDBuild.core.constants.Proxy.CARDS]) && !Ext.isEmpty(configurationObject[CMDBuild.core.constants.Proxy.CARDS]))
								domainRecord.set(CMDBuild.core.constants.Proxy.CHECKED_CARDS, configurationObject[CMDBuild.core.constants.Proxy.CARDS]);
						}
					}
				}, this);
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.checked
		 * @param {String} parameters.propertyName
		 * @param {CMDBuild.model.management.workflow.panel.tree.filter.advanced.filterEditor.relations.DomainGrid} parameters.record
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedFilterEditorRelationsCheckchange: function (parameters) {
			this.controllerGridDomain.cmfg('onWorkflowTreeFilterAdvancedFilterEditorRelationsGridDomainCheckchange', parameters);
			this.controllerGridCard.cmfg('onWorkflowTreeFilterAdvancedFilterEditorRelationsGridCardCheckchange');
		},

		/**
		 * @param {CMDBuild.model.management.workflow.panel.tree.filter.advanced.filterEditor.relations.DomainGrid} record
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedFilterEditorRelationsDomainSelect: function (record) {
			if (Ext.isObject(record) && !Ext.Object.isEmpty(record)) {
				this.cmfg('workflowTreeFilterAdvancedFilterEditorRelationsSelectedDomainSet', { value: record });

				this.controllerGridCard.cmfg('onWorkflowTreeFilterAdvancedFilterEditorRelationsGridCardDomainSelect');
			}
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedFilterEditorRelationsInit: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (this.cmfg('workflowSelectedWorkflowIsEmpty'))
					return _error('onWorkflowTreeFilterAdvancedFilterEditorRelationsInit(): empty selected entryType', this, this.cmfg('workflowSelectedWorkflowGet'));
			// END: Error handling

			this.workflowTreeFilterAdvancedFilterEditorRelationsSelectedDomainReset();

			this.controllerGridCard.getView().fireEvent('show');
			this.controllerGridDomain.getView().fireEvent('show');

			if (!Ext.isEmpty(parameters.callback) && Ext.isFunction(parameters.callback))
				Ext.callback(parameters.callback, this);
		},

		// SelectedDomain property methods
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			workflowTreeFilterAdvancedFilterEditorRelationsSelectedDomainGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedDomain';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			workflowTreeFilterAdvancedFilterEditorRelationsSelectedDomainIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedDomain';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowTreeFilterAdvancedFilterEditorRelationsSelectedDomainReset: function () {
				this.propertyManageReset('selectedDomain');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 */
			workflowTreeFilterAdvancedFilterEditorRelationsSelectedDomainSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.workflow.panel.tree.filter.advanced.filterEditor.relations.DomainGrid';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedDomain';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * Manages view's filter configuration
		 *
		 * @returns {Void}
		 */
		workflowTreeFilterAdvancedFilterEditorRelationsSelectionManage: function () {
			// Error handling
				if (this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterIsEmpty'))
					return _error('workflowTreeFilterAdvancedFilterEditorRelationsSelectionManage(): selected filter is empty', this, this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterGet'));
			// END: Error handling

			if (
				!this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterIsEmpty', CMDBuild.core.constants.Proxy.CONFIGURATION)
				&& !this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterIsEmpty', [CMDBuild.core.constants.Proxy.CONFIGURATION, CMDBuild.core.constants.Proxy.RELATION])
			) {
				this.decodeFilterConfigurationObject(
					this.cmfg('workflowTreeFilterAdvancedManagerSelectedFilterGet', [CMDBuild.core.constants.Proxy.CONFIGURATION, CMDBuild.core.constants.Proxy.RELATION])
				);
			}
		},

		/**
		 * @returns {Object} out
		 */
		workflowTreeFilterAdvancedFilterEditorRelationsDataGet: function () {
			var out = {};

			if (this.controllerGridDomain.getView().getSelectionModel().hasSelection()) {
				var data = [];

				this.controllerGridDomain.getView().getStore().each(function (domain) {
					var type = domain.getType();

					if (!Ext.isEmpty(type)) {
						var domainFilterConfiguration = {};
						domainFilterConfiguration[CMDBuild.core.constants.Proxy.DESTINATION] = domain.get([CMDBuild.core.constants.Proxy.DESTINATION, CMDBuild.core.constants.Proxy.NAME]);
						domainFilterConfiguration[CMDBuild.core.constants.Proxy.DIRECTION] = domain.get(CMDBuild.core.constants.Proxy.DIRECTION);
						domainFilterConfiguration[CMDBuild.core.constants.Proxy.DOMAIN] = domain.get([CMDBuild.core.constants.Proxy.DOMAIN, CMDBuild.core.constants.Proxy.NAME]);
						domainFilterConfiguration[CMDBuild.core.constants.Proxy.SOURCE] = domain.get([CMDBuild.core.constants.Proxy.SOURCE, CMDBuild.core.constants.Proxy.NAME]);
						domainFilterConfiguration[CMDBuild.core.constants.Proxy.TYPE] = type;

						if (
							type == 'oneof'
							&& this.controllerGridCard.getView().getSelectionModel().hasSelection()
						) {
							var checkedCards = [];

							Ext.Array.each(this.controllerGridCard.getView().getSelectionModel().getSelection(), function (record, i, allRecords) {
								if (!Ext.isEmpty(record)) {
									var checkedCardObject = {};
									checkedCardObject[CMDBuild.core.constants.Proxy.CLASS_NAME] = record.get('IdClass_value');
									checkedCardObject[CMDBuild.core.constants.Proxy.ID] = record.get('Id');

									checkedCards.push(checkedCardObject);
								}
							}, this);

							domainFilterConfiguration[CMDBuild.core.constants.Proxy.CARDS] = checkedCards;
						}

						data.push(domainFilterConfiguration);
					}
				}, this);

				out[CMDBuild.core.constants.Proxy.RELATION] = data;
			}

			return out;
		}
	});

})();

(function () {

	/**
	 * @link CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.relations.Relations
	 */
	Ext.define('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.relations.Relations', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.FilterEditor}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'panelGridAndFormFilterAdvancedFilterEditorRelationsDataGet',
			'panelGridAndFormFilterAdvancedFilterEditorRelationsSelectedDomainGet',
			'panelGridAndFormFilterAdvancedFilterEditorRelationsSelectedDomainIsEmpty',
			'panelGridAndFormFilterAdvancedFilterEditorRelationsSelectedDomainSet',
			'panelGridAndFormFilterAdvancedFilterEditorRelationsSelectionManage',
			'onPanelGridAndFormFilterAdvancedFilterEditorRelationsCheckchange',
			'onPanelGridAndFormFilterAdvancedFilterEditorRelationsDomainSelect',
			'onPanelGridAndFormFilterAdvancedFilterEditorRelationsInit'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.relations.GridDomain}
		 */
		controllerGridDomain: undefined,

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.relations.GridCard}
		 */
		controllerGridCard: undefined,

		/**
		 * @property {CMDBuild.model.common.field.filter.advanced.window.relations.DomainGrid}
		 *
		 * @private
		 */
		selectedDomain: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.relations.RelationsView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.FilterEditor} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.relations.RelationsView', { delegate: this });

			// Sub-controllers
			this.controllerGridCard = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.relations.GridCard', { parentDelegate: this });
			this.controllerGridDomain = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.filterEditor.relations.GridDomain', { parentDelegate: this });

			this.view.add([
				this.controllerGridCard.getView(),
				this.controllerGridDomain.getView()
			]);
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.checked
		 * @param {String} parameters.propertyName
		 * @param {CMDBuild.model.common.panel.gridAndForm.filter.advanced.filterEditor.relations.DomainGrid} parameters.record
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormFilterAdvancedFilterEditorRelationsCheckchange: function (parameters) {
			this.controllerGridDomain.cmfg('onPanelGridAndFormFilterAdvancedFilterEditorRelationsGridDomainCheckchange', parameters);
			this.controllerGridCard.cmfg('onPanelGridAndFormFilterAdvancedFilterEditorRelationsGridCardCheckchange');
		},

		/**
		 * @param {CMDBuild.model.common.panel.gridAndForm.filter.advanced.filterEditor.relations.DomainGrid} record
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormFilterAdvancedFilterEditorRelationsDomainSelect: function (record) {
			if (Ext.isObject(record) && !Ext.Object.isEmpty(record)) {
				this.cmfg('panelGridAndFormFilterAdvancedFilterEditorRelationsSelectedDomainSet', { value: record });

				this.controllerGridCard.cmfg('onPanelGridAndFormFilterAdvancedFilterEditorRelationsGridCardDomainSelect');
			}
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
		 * Manages view's filter configuration
		 *
		 * @returns {Void}
		 */
		panelGridAndFormFilterAdvancedFilterEditorRelationsSelectionManage: function () {
			// Error handling
				if (this.cmfg('panelGridAndFormFilterAdvancedEntryTypeIsEmpty'))
					return _error('panelGridAndFormFilterAdvancedFilterEditorRelationsSelectionManage(): selected filter is empty', this, this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterGet'));
			// END: Error handling

			if (
				!this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterIsEmpty', CMDBuild.core.constants.Proxy.CONFIGURATION)
				&& !this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterIsEmpty', [CMDBuild.core.constants.Proxy.CONFIGURATION, CMDBuild.core.constants.Proxy.RELATION])
			) {
				this.decodeFilterConfigurationObject(
					this.cmfg('panelGridAndFormFilterAdvancedManagerSelectedFilterGet', [CMDBuild.core.constants.Proxy.CONFIGURATION, CMDBuild.core.constants.Proxy.RELATION])
				);
			}
		},

		/**
		 * @returns {Object} out
		 */
		panelGridAndFormFilterAdvancedFilterEditorRelationsDataGet: function () {
			var data = [],
				out = {};

			this.controllerGridDomain.getView().getStore().each(function (domain) {
				var type = domain.getType();

				if (!Ext.isEmpty(type)) {
					var domainFilterConfiguration = {};
					domainFilterConfiguration[CMDBuild.core.constants.Proxy.DESTINATION] = domain.get([CMDBuild.core.constants.Proxy.DESTINATION, CMDBuild.core.constants.Proxy.NAME]);
					domainFilterConfiguration[CMDBuild.core.constants.Proxy.DIRECTION] = domain.get(CMDBuild.core.constants.Proxy.DIRECTION);
					domainFilterConfiguration[CMDBuild.core.constants.Proxy.DOMAIN] = domain.get([CMDBuild.core.constants.Proxy.DOMAIN, CMDBuild.core.constants.Proxy.NAME]);
					domainFilterConfiguration[CMDBuild.core.constants.Proxy.SOURCE] = domain.get([CMDBuild.core.constants.Proxy.SOURCE, CMDBuild.core.constants.Proxy.NAME]);
					domainFilterConfiguration[CMDBuild.core.constants.Proxy.TYPE] = type;

					if (type == 'oneof')
						domainFilterConfiguration[CMDBuild.core.constants.Proxy.CARDS] = domain.get(CMDBuild.core.constants.Proxy.CHECKED_CARDS);

					data.push(domainFilterConfiguration);
				}
			}, this);

			if (!Ext.isEmpty(data))
				out[CMDBuild.core.constants.Proxy.RELATION] = data;

			return out;
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 *
		 * @returns {Void}
		 */
		onPanelGridAndFormFilterAdvancedFilterEditorRelationsInit: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (this.cmfg('panelGridAndFormFilterAdvancedEntryTypeIsEmpty'))
					return _error('onPanelGridAndFormFilterAdvancedFilterEditorRelationsInit(): empty selected entryType', this, this.cmfg('panelGridAndFormFilterAdvancedEntryTypeGet'));
			// END: Error handling

			this.selectedDomainReset();

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
			panelGridAndFormFilterAdvancedFilterEditorRelationsSelectedDomainGet: function (attributePath) {
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
			panelGridAndFormFilterAdvancedFilterEditorRelationsSelectedDomainIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedDomain';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @private
			 */
			selectedDomainReset: function () {
				this.propertyManageReset('selectedDomain');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 */
			panelGridAndFormFilterAdvancedFilterEditorRelationsSelectedDomainSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.common.panel.gridAndForm.filter.advanced.filterEditor.relations.DomainGrid';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedDomain';

					this.propertyManageSet(parameters);
				}
			}
	});

})();

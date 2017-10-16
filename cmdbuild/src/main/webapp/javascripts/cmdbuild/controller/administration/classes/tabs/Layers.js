(function () {

	Ext.define('CMDBuild.controller.administration.classes.tabs.Layers', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.classes.tabs.Layers'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.classes.Classes}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onClassesTabLayersAddClassButtonClick',
			'onClassesTabLayersClassSelected',
			'onClassesTabLayersShow',
			'onClassesTabLayersStoreLoad',
			'onClassesTabLayersVisibilityChange'
		],

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.layers.GridPanel}
		 */
		grid: undefined,

		/**
		 * @cfg {CMDBuild.view.administration.classes.tabs.layers.LayersView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.classes.Classes} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.classes.tabs.layers.LayersView', { delegate: this });

			// Shorthands
			this.grid = this.view.grid;
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		classesTabLayersVisibilityManage: function () {
			var className = this.cmfg('classesSelectedClassGet', CMDBuild.core.constants.Proxy.NAME);

			this.grid.getStore().each(function (record) {
				if (Ext.isObject(record) && !Ext.Object.isEmpty(record)) {
					record.set(CMDBuild.core.constants.Proxy.IS_VISIBLE, record.isVisibleForEntryType(className));
					record.commit();
				}
			}, this);
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabLayersAddClassButtonClick: function () {
			this.view.disable();
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabLayersClassSelected: function () {
			this.view.setDisabled(
				this.cmfg('classesSelectedClassIsEmpty')
				|| this.cmfg('classesSelectedClassGet', CMDBuild.core.constants.Proxy.TABLE_TYPE) == CMDBuild.core.constants.Global.getTableTypeSimpleTable()
				|| !CMDBuild.configuration.gis.get(CMDBuild.core.constants.Proxy.ENABLED)
			);
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabLayersShow: function () {
			if (!this.cmfg('classesSelectedClassIsEmpty'))
				this.grid.getStore().load();
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabLayersStoreLoad: function () {
			this.classesTabLayersVisibilityManage();
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.checked
		 * @param {Number} parameters.record
		 *
		 * @returns {Void}
		 */
		onClassesTabLayersVisibilityChange: function (parameters) {
			if (
				Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)
				&& Ext.isBoolean(parameters.checked)
				&& Ext.isObject(parameters.record) && !Ext.Object.isEmpty(parameters.record)
			) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.LAYER_FULL_NAME] = parameters.record.get(CMDBuild.core.constants.Proxy.FULL_NAME);
				params[CMDBuild.core.constants.Proxy.TABLE_NAME] = this.cmfg('classesSelectedClassGet', CMDBuild.core.constants.Proxy.NAME);
				params[CMDBuild.core.constants.Proxy.VISIBLE] = parameters.checked;

				CMDBuild.proxy.administration.classes.tabs.Layers.setVisibility({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						this.cmfg('onClassesTabLayersShow');

						/**
						 * @deprecated
						 */
						_CMCache.onGeoAttributeVisibilityChanged();
					}
				});
			} else {
				_error('onClassesTabLayersVisibilityChange(): wrong parameters', this, parameters);
			}
		}
	});

})();

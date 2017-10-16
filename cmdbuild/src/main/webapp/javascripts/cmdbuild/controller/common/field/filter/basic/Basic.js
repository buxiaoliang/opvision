(function () {

	Ext.define('CMDBuild.controller.common.field.filter.basic.Basic', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Utils'
		],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.controller.common.field.filter.advanced.window.Window}
		 */
		controllerFilterWindow: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onFieldFilterBasicReset',
			'onFieldFilterBasicTrigger1Click = onFieldFilterBasicEnterKeyPress',
			'onFieldFilterBasicTrigger2Click'
		],

		/**
		 * @property {CMDBuild.view.common.field.filter.basic.Basic}
		 */
		view: undefined,

		/**
		 * @param {Object} configObject
		 * @param {Object} configObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function(configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.field.filter.basic.Basic', { delegate: this });
		},

		/**
		 * @param {Boolean} silently
		 *
		 * @returns {Void}
		 */
		onFieldFilterBasicReset: function (silently) {
			silently = Ext.isBoolean(silently) ? silently : false;

			// Error handling
				if (!Ext.isObject(this.view) || Ext.Object.isEmpty(this.view))
					return _error('onFieldFilterBasicReset(): view not found', this, this.view);
			// END: Error handling

			this.view.setValue();

			this.cmfg('panelGridAndFormGridFilterClear', {
				disableStoreLoad: silently,
				type: 'basic'
			});
		},

		/**
		 * @returns {Void}
		 */
		onFieldFilterBasicTrigger1Click: function () {
			var value = Ext.String.trim(this.view.getValue());

			if (Ext.isString(value) && !Ext.isEmpty(value)) { // Apply action on NON empty filter string
				var filterConfigurationObject = {};
				filterConfigurationObject[CMDBuild.core.constants.Proxy.CONFIGURATION] = {};
				filterConfigurationObject[CMDBuild.core.constants.Proxy.CONFIGURATION][CMDBuild.core.constants.Proxy.QUERY] = value;

				this.cmfg('panelGridAndFormGridFilterApply', {
					filter: Ext.create('CMDBuild.model.common.field.filter.basic.Filter', filterConfigurationObject),
					type: 'basic'
				});
			} else { // Reset action on empty filter string
				this.cmfg('onFieldFilterBasicReset');
			}
		},

		/**
		 * @returns {Void}
		 */
		onFieldFilterBasicTrigger2Click: function () {
			if (!this.view.isDisabled())
				this.cmfg('onFieldFilterBasicReset');
		}
	});

})();

(function () {

	Ext.define('CMDBuild.view.common.field.filter.basic.Basic', {
		extend: 'Ext.form.field.Trigger',

		/**
		 * @cfg {CMDBuild.controller.common.field.filter.basic.Basic}
		 */
		delegate: undefined,

		/**
		 * @cfg {Ext.grid.Panel}
		 */
		grid: undefined,

		enableKeyEvents: true,
		hideTrigger1: false,
		hideTrigger2: false,
		trigger1Cls: Ext.baseCSSPrefix + 'form-search-trigger',
		trigger2Cls: Ext.baseCSSPrefix + 'form-clear-trigger',
		validateOnBlur: false,

		listeners: {
			specialkey: function (field, e, eOpts) {
				if (e.getKey() == e.ENTER)
					this.delegate.cmfg('onFieldFilterBasicEnterKeyPress');
			}
		},

		/**
		 * @returns {Void}
		 */
		onTrigger1Click: function () {
			this.delegate.cmfg('onFieldFilterBasicTrigger1Click');
		},

		/**
		 * @returns {Void}
		 */
		onTrigger2Click: function () {
			this.delegate.cmfg('onFieldFilterBasicTrigger2Click');
		},

		/**
		 * @param {Boolean} silently
		 *
		 * @returns {Void}
		 */
		reset: function (silently) {
			this.delegate.cmfg('onFieldFilterBasicReset', silently);
		}
	});

})();

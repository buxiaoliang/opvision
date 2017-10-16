(function () {

	Ext.define('CMDBuild.view.common.field.trigger.cron.Cron', {
		extend: 'Ext.form.field.Trigger',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @property {CMDBuild.controller.common.field.trigger.cron.Cron}
		 */
		delegate: undefined,

		/**
		 * @cfg {String}
		 */
		fieldLabel: undefined,

		/**
		 * @cfg {String}
		 */
		name: undefined,

		triggerCls: 'trigger-edit',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				delegate: Ext.create('CMDBuild.controller.common.field.trigger.cron.Cron', { view: this })
			});

			this.callParent(arguments);
		},

		/**
		 * @returns {Void}
		 */
		onTriggerClick: function () {
			this.delegate.cmfg('onFieldTriggerCronClick');
		}
	});

})();

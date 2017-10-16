(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.common.cronForm.Advanced', {
		extend: 'Ext.panel.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.common.CronForm}
		 */
		delegate: undefined,

		/**
		 * @property {Array}
		 */
		advancedFields: undefined,

		/**
		 * @property {Ext.form.field.Radio}
		 */
		advanceRadio: undefined,

		frame: true,
		layout: 'hbox',
		margin: '0 0 5 0',
		overflowY: 'auto',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			var me = this;

			this.advanceRadio = Ext.create('Ext.form.field.Radio', {
				name: CMDBuild.core.constants.Proxy.CRON_INPUT_TYPE,
				inputValue: CMDBuild.core.constants.Proxy.ADVANCED,
				boxLabel: CMDBuild.Translation.advanced,
				width: CMDBuild.core.constants.FieldWidths.LABEL,

				listeners: {
					change: function (radio, value) {
						me.delegate.cmOn('onChangeAdvancedRadio', value);
					}
				}
			});

			this.advancedFields = [
				this.delegate.createCronField(CMDBuild.core.constants.Proxy.MINUTE, CMDBuild.Translation.minute),
				this.delegate.createCronField(CMDBuild.core.constants.Proxy.HOUR, CMDBuild.Translation.hour),
				this.delegate.createCronField(CMDBuild.core.constants.Proxy.DAY_OF_MONTH, CMDBuild.Translation.dayOfMonth),
				this.delegate.createCronField(CMDBuild.core.constants.Proxy.MONTH, CMDBuild.Translation.month),
				this.delegate.createCronField(CMDBuild.core.constants.Proxy.DAY_OF_WEEK, CMDBuild.Translation.dayOfWeek)
			];

			Ext.apply(this, {
				items: [
					this.advanceRadio,
					{
						xtype: 'container',
						frame: false,
						border: false,

						items: this.advancedFields
					}
				]
			});

			this.callParent(arguments);
		}
	});

})();

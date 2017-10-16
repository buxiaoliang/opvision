(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.common.cronForm.Base', {
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
		 * @property {Ext.form.field.ComboBox}
		 */
		baseCombo: undefined,

		/**
		 * @property {Ext.form.field.Radio}
		 */
		baseRadio: undefined,

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

			this.baseRadio = Ext.create('Ext.form.field.Radio', {
				name: CMDBuild.core.constants.Proxy.CRON_INPUT_TYPE,
				inputValue: CMDBuild.core.constants.Proxy.BASE,
				boxLabel: CMDBuild.Translation.basic,
				width: CMDBuild.core.constants.FieldWidths.LABEL,

				listeners: {
					change: function (radio, value) {
						me.delegate.cmOn('onChangeBaseRadio', value);
					}
				}
			});

			this.baseCombo = Ext.create('Ext.form.field.ComboBox', {
				name: 'baseCombo',
				valueField: CMDBuild.core.constants.Proxy.VALUE,
				displayField: CMDBuild.core.constants.Proxy.DESCRIPTION,
				forceSelection: true,
				editable: false,
				margins: '0 0 0 ' + (CMDBuild.core.constants.FieldWidths.LABEL - 45),

				store: Ext.create('Ext.data.ArrayStore', {
					fields: [CMDBuild.core.constants.Proxy.VALUE, CMDBuild.core.constants.Proxy.DESCRIPTION],
					data: [
						['0 * * * ?', CMDBuild.Translation.everyHour],
						['0 0 * * ?', CMDBuild.Translation.everyDay],
						['0 0 1 * ?', CMDBuild.Translation.everyMonth],
						['0 0 1 1 ?', CMDBuild.Translation.everyYear]
					]
				}),

				listeners: {
					select: function (combo, record, index) {
						me.delegate.cmOn('onSelectBaseCombo', this.getValue());
					}
				}
			});

			Ext.apply(this, {
				items: [this.baseRadio, this.baseCombo]
			});

			this.callParent(arguments);
		}
	});

})();

(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.generic.Step3', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.generic.Generic}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onTaskManagerFormTaskGenericStep3DeleteRowButtonClick'
		],

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.generic.Step3}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.task.generic.Generic} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.generic.Step3', { delegate: this });
		},

		/**
		 * @param {CMDBuild.model.administration.taskManager.task.generic.Context} record
		 *
		 * @returns {Void}
		 */
		onTaskManagerFormTaskGenericStep3DeleteRowButtonClick: function (record) {
			this.view.grid.getStore().remove(record);
		},

		// GETters functions
			/**
			 * @returns {Object} data
			 */
			getData: function () {
				var data = {};

				// To validate and filter grid rows
				this.view.grid.getStore().each(function (record) {
					if (
						!Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.KEY))
						&& !Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.VALUE))
					) {
						data[record.get(CMDBuild.core.constants.Proxy.KEY)] = record.get(CMDBuild.core.constants.Proxy.VALUE);
					}
				}, this);

				return data;
			},
		// SETters functions
			/**
			 * @param {Object} data
			 *
			 * @returns {Void}
			 */
			setData: function (data) {
				if (Ext.isObject(data) && !Ext.Object.isEmpty(data)) {
					var storeData = [];

					Ext.Object.each(data, function (key, value, myself) {
						var recordObject = {};
						recordObject[CMDBuild.core.constants.Proxy.KEY] = key;
						recordObject[CMDBuild.core.constants.Proxy.VALUE] = value;

						storeData.push(recordObject);
					}, this);

					if (!Ext.isEmpty(storeData))
						this.view.grid.getStore().loadData(storeData);
				}
			}
	});

})();

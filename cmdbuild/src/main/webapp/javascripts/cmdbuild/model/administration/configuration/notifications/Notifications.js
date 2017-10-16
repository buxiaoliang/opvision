(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.administration.configuration.notifications.Notifications', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ACCOUNT, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DESTINATION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ENABLED, type: 'boolean', defaultValue: false },
			{ name: CMDBuild.core.constants.Proxy.TEMPLATE, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.TIME_INTERVAL, type: 'int', defaultValue: 0 }
		],

		/**
		 * @param {Object} data
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (data) {
			data = Ext.isObject(data) ? data : {};
			data[CMDBuild.core.constants.Proxy.ACCOUNT] = data[CMDBuild.core.constants.Proxy.ACCOUNT] || data['notification.email.dms.account'];
			data[CMDBuild.core.constants.Proxy.DESTINATION] = data[CMDBuild.core.constants.Proxy.DESTINATION] || data['notification.email.dms.destination'];
			data[CMDBuild.core.constants.Proxy.ENABLED] = data[CMDBuild.core.constants.Proxy.ENABLED] || data['notification.enable'];
			data[CMDBuild.core.constants.Proxy.TEMPLATE] = data[CMDBuild.core.constants.Proxy.TEMPLATE] || data['notification.email.dms.template'];
			data[CMDBuild.core.constants.Proxy.TIME_INTERVAL] = data[CMDBuild.core.constants.Proxy.TIME_INTERVAL] || data['notification.email.dms.silence'];

			this.callParent(arguments);
		},

		/**
		 * @returns {Object}
		 */
		getParamsObject: function () {
			var data = this.getData();

			return {
				'notification.email.dms.account': data[CMDBuild.core.constants.Proxy.ACCOUNT],
				'notification.email.dms.destination': data[CMDBuild.core.constants.Proxy.DESTINATION],
				'notification.email.dms.silence': data[CMDBuild.core.constants.Proxy.TIME_INTERVAL],
				'notification.email.dms.template': data[CMDBuild.core.constants.Proxy.TEMPLATE],
				'notification.enable': data[CMDBuild.core.constants.Proxy.ENABLED]
			};
		}
	});

})();

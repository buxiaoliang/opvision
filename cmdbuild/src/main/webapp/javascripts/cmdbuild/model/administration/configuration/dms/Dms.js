(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * TODO: waiting for refactor (rename)
	 */
	Ext.define('CMDBuild.model.administration.configuration.dms.Dms', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ALFRESCO_DELAY, type: 'int', defaultValue: 1000, useNull: true },
			{ name: CMDBuild.core.constants.Proxy.ALFRESCO_FILE_SERVER_PORT, type: 'int', defaultValue: 1121, useNull: true },
			{ name: CMDBuild.core.constants.Proxy.ALFRESCO_FILE_SERVER_URL, type: 'string', defaultValue: 'localhost' },
			{ name: CMDBuild.core.constants.Proxy.ALFRESCO_HOST, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ALFRESCO_LOOKUP_CATEGORY, type: 'string', defaultValue: 'AlfrescoCategory' },
			{ name: CMDBuild.core.constants.Proxy.ALFRESCO_PASSWORD, type: 'string', defaultValue: 'admin' },
			{ name: CMDBuild.core.constants.Proxy.ALFRESCO_REPOSITORY_APPLICATION, type: 'string', defaultValue: 'cm:cmdbuild' },
			{ name: CMDBuild.core.constants.Proxy.ALFRESCO_REPOSITORY_FILE_SERVER_PATH, type: 'string', defaultValue: '/Alfresco/User Homes/cmdbuild' },
			{ name: CMDBuild.core.constants.Proxy.ALFRESCO_REPOSITORY_WEB_SERVICE_PATH, type: 'string', defaultValue: '/app:company_home/app:user_homes/' },
			{ name: CMDBuild.core.constants.Proxy.ALFRESCO_USER, type: 'string', defaultValue: 'admin' },
			{ name: CMDBuild.core.constants.Proxy.CMIS_HOST, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.CMIS_MODEL, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.CMIS_PASSWORD, type: 'string', defaultValue: 'admin' },
			{ name: CMDBuild.core.constants.Proxy.CMIS_PATH, type: 'string', defaultValue: '/User Homes/cmdbuild' },
			{ name: CMDBuild.core.constants.Proxy.CMIS_USER, type: 'string', defaultValue: 'admin' },
			{ name: CMDBuild.core.constants.Proxy.ENABLED, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.TYPE, type: 'string' }
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
			data[CMDBuild.core.constants.Proxy.TYPE] = data[CMDBuild.core.constants.Proxy.TYPE] || data['dms.service.type'];

			// Alfresco configuration translations
			data[CMDBuild.core.constants.Proxy.ALFRESCO_DELAY] = data[CMDBuild.core.constants.Proxy.ALFRESCO_DELAY] || data['delay'];
			data[CMDBuild.core.constants.Proxy.ALFRESCO_FILE_SERVER_PORT] = data[CMDBuild.core.constants.Proxy.ALFRESCO_FILE_SERVER_PORT] || data['fileserver.port'];
			data[CMDBuild.core.constants.Proxy.ALFRESCO_FILE_SERVER_URL] = data[CMDBuild.core.constants.Proxy.ALFRESCO_FILE_SERVER_URL] || data['fileserver.url'];
			data[CMDBuild.core.constants.Proxy.ALFRESCO_HOST] = data[CMDBuild.core.constants.Proxy.ALFRESCO_HOST] || data['server.url'];
			data[CMDBuild.core.constants.Proxy.ALFRESCO_LOOKUP_CATEGORY] = data[CMDBuild.core.constants.Proxy.ALFRESCO_LOOKUP_CATEGORY] || data['category.lookup'];
			data[CMDBuild.core.constants.Proxy.ALFRESCO_PASSWORD] = data[CMDBuild.core.constants.Proxy.ALFRESCO_PASSWORD] || data['credential.password'];
			data[CMDBuild.core.constants.Proxy.ALFRESCO_REPOSITORY_APPLICATION] = data[CMDBuild.core.constants.Proxy.ALFRESCO_REPOSITORY_APPLICATION] || data['repository.app'];
			data[CMDBuild.core.constants.Proxy.ALFRESCO_REPOSITORY_FILE_SERVER_PATH] = data[CMDBuild.core.constants.Proxy.ALFRESCO_REPOSITORY_FILE_SERVER_PATH] || data['repository.fspath'];
			data[CMDBuild.core.constants.Proxy.ALFRESCO_REPOSITORY_WEB_SERVICE_PATH] = data[CMDBuild.core.constants.Proxy.ALFRESCO_REPOSITORY_WEB_SERVICE_PATH] || data['repository.wspath'];
			data[CMDBuild.core.constants.Proxy.ALFRESCO_USER] = data[CMDBuild.core.constants.Proxy.ALFRESCO_USER] || data['credential.user'];

			// CMIS configuration translations
			data[CMDBuild.core.constants.Proxy.CMIS_HOST] = data[CMDBuild.core.constants.Proxy.CMIS_HOST] || data['dms.service.cmis.url'];
			data[CMDBuild.core.constants.Proxy.CMIS_MODEL] = data[CMDBuild.core.constants.Proxy.CMIS_MODEL] || data['dms.service.cmis.model'];
			data[CMDBuild.core.constants.Proxy.CMIS_PASSWORD] = data[CMDBuild.core.constants.Proxy.CMIS_PASSWORD] || data['dms.service.cmis.password'];
			data[CMDBuild.core.constants.Proxy.CMIS_PATH] = data[CMDBuild.core.constants.Proxy.CMIS_PATH] || data['dms.service.cmis.path'];
			data[CMDBuild.core.constants.Proxy.CMIS_USER] = data[CMDBuild.core.constants.Proxy.CMIS_USER] || data['dms.service.cmis.user'];

			this.callParent(arguments);
		},

		/**
		 * @returns {Object}
		 */
		getParamsObject: function () {
			var data = this.getData();

			return {
				'category.lookup': data[CMDBuild.core.constants.Proxy.ALFRESCO_LOOKUP_CATEGORY],
				'credential.password': data[CMDBuild.core.constants.Proxy.ALFRESCO_PASSWORD],
				'credential.user': data[CMDBuild.core.constants.Proxy.ALFRESCO_USER],
				'dms.service.cmis.model': data[CMDBuild.core.constants.Proxy.CMIS_MODEL],
				'dms.service.cmis.password': data[CMDBuild.core.constants.Proxy.CMIS_PASSWORD],
				'dms.service.cmis.path': data[CMDBuild.core.constants.Proxy.CMIS_PATH],
				'dms.service.cmis.url': data[CMDBuild.core.constants.Proxy.CMIS_HOST],
				'dms.service.cmis.user': data[CMDBuild.core.constants.Proxy.CMIS_USER],
				'dms.service.type': data[CMDBuild.core.constants.Proxy.TYPE],
				'fileserver.port': data[CMDBuild.core.constants.Proxy.ALFRESCO_FILE_SERVER_PORT],
				'fileserver.url': data[CMDBuild.core.constants.Proxy.ALFRESCO_FILE_SERVER_URL],
				'repository.app': data[CMDBuild.core.constants.Proxy.ALFRESCO_REPOSITORY_APPLICATION],
				'repository.fspath': data[CMDBuild.core.constants.Proxy.ALFRESCO_REPOSITORY_FILE_SERVER_PATH],
				'repository.wspath': data[CMDBuild.core.constants.Proxy.ALFRESCO_REPOSITORY_WEB_SERVICE_PATH],
				'server.url': data[CMDBuild.core.constants.Proxy.ALFRESCO_HOST],
				delay: data[CMDBuild.core.constants.Proxy.ALFRESCO_DELAY],
				enabled: data[CMDBuild.core.constants.Proxy.ENABLED]
			};
		}
	});

})();

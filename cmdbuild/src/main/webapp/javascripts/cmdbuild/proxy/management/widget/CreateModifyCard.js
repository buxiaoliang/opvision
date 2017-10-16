(function () {

	Ext.define('CMDBuild.proxy.management.widget.CreateModifyCard', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		// Lock/Unlock methods
			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 */
			lock: function (parameters) {
				parameters = Ext.isEmpty(parameters) ? {} : parameters;

				Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.card.lock });

				CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.UNCACHED, parameters, true);
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 */
			unlock: function (parameters) {
				parameters = Ext.isEmpty(parameters) ? {} : parameters;

				Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.card.unlock });

				CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.UNCACHED, parameters, true);
			},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		read: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.card.read });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CARD, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAllClasses: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.classes.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CLASS, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		readAttributes: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.attribute.readAll });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.ATTRIBUTE, parameters);
		},

		/**
		 * @param {Object} parameters
		 *
		 * @returns {Void}
		 */
		update: function (parameters) {
			parameters = Ext.isEmpty(parameters) ? {} : parameters;

			Ext.apply(parameters, { url: CMDBuild.proxy.index.Json.card.update });

			CMDBuild.global.Cache.request(CMDBuild.core.constants.Proxy.CARD, parameters, true);
		}
	});

})();

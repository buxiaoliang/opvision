(function () {

	Ext.define('CMDBuild.proxy.administration.classes.tabs.widgets.Calendar', {

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.model.administration.classes.tabs.widgets.calendar.AttributeCombo',
			'CMDBuild.model.administration.classes.tabs.widgets.calendar.TargetClass',
			'CMDBuild.proxy.index.Json'
		],

		singleton: true,

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreTargetClass: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.ENTRY_TYPE, {
				autoLoad: true,
				model: 'CMDBuild.model.administration.classes.tabs.widgets.calendar.TargetClass',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.entryType.readAll,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.CLASSES
					},
					extraParams: {
						active: true,
						limitParam: undefined,
						pageParam: undefined,
						startParam: undefined
					}
				},
				filters: [
					function (record) { // Filters root of all classes
						return record.get(CMDBuild.core.constants.Proxy.NAME) != CMDBuild.core.constants.Global.getRootNameClasses();
					}
				],
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.TEXT, direction: 'ASC' }
				]
			});
		},

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreAttributesDate: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.ATTRIBUTE, {
				autoLoad: false,
				model: 'CMDBuild.model.administration.classes.tabs.widgets.calendar.AttributeCombo',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.attribute.read,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.ATTRIBUTES
					},
					extraParams: {
						limitParam: undefined,
						pageParam: undefined,
						startParam: undefined
					}
				},
				filters: [
					function (record) { // Filters by attribute's type
						return Ext.Array.contains(['DATE', 'TIMESTAMP'], record.get(CMDBuild.core.constants.Proxy.TYPE));
					}
				],
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.DESCRIPTION, direction: 'ASC' }
				]
			});
		},

		/**
		 * @returns {Ext.data.Store or CMDBuild.core.cache.Store}
		 */
		getStoreAttributesString: function () {
			return CMDBuild.global.Cache.requestAsStore(CMDBuild.core.constants.Proxy.ATTRIBUTE, {
				autoLoad: false,
				model: 'CMDBuild.model.administration.classes.tabs.widgets.calendar.AttributeCombo',
				proxy: {
					type: 'ajax',
					url: CMDBuild.proxy.index.Json.attribute.read,
					reader: {
						type: 'json',
						root: CMDBuild.core.constants.Proxy.ATTRIBUTES
					},
					extraParams: {
						limitParam: undefined,
						pageParam: undefined,
						startParam: undefined
					}
				},
				filters: [
					function (record) { // Filters by attribute's type
						return Ext.Array.contains(['TEXT', 'STRING'], record.get(CMDBuild.core.constants.Proxy.TYPE));
					}
				],
				sorters: [
					{ property: CMDBuild.core.constants.Proxy.DESCRIPTION, direction: 'ASC' }
				]
			});
		}
	});

})();

(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.task.event.asynchronous.Step2', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.event.asynchronous.Asynchronous}
		 */
		parentDelegate: undefined,

		/**
		 * @property {String}
		 */
		className: undefined,

		/**
		 * @property {Object}
		 */
		filterValues: undefined,

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.event.asynchronous.Step2}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.taskManager.task.event.asynchronous.Asynchronous} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.taskManager.task.event.asynchronous.Step2', { delegate: this });
		},

		/**
		 * Create and draw filter tabs
		 */
		drawFilterTabs: function () {
			var me = this;

			if (this.className) {
				_CMCache.getAttributeList(
					_CMCache.getEntryTypeByName(me.className).getId(),
					function (attributes) {
						me.view.filterTabPanel.removeAll();

						// Filter tabs
						me.view.filterAttributeTab = Ext.create('CMDBuild.view.management.common.filter.CMFilterAttributes', {
							attributes: attributes
						});
						me.view.filterRelationTab = Ext.create('CMDBuild.view.management.common.filter.CMRelations', {
							className: me.className,
							height: '100%'
						});

						// To setup filters values
						if (!Ext.isEmpty(me.filterValues)) {
							if (!Ext.isEmpty(me.view.filterAttributeTab) && !Ext.isEmpty(me.filterValues[CMDBuild.core.constants.Proxy.ATTRIBUTE]))
								me.view.filterAttributeTab.setData(me.filterValues[CMDBuild.core.constants.Proxy.ATTRIBUTE]);

							if (!Ext.isEmpty(me.view.filterRelationTab) && !Ext.isEmpty(me.filterValues[CMDBuild.core.constants.Proxy.RELATION]))
								me.view.filterRelationTab.setData(me.filterValues[CMDBuild.core.constants.Proxy.RELATION]);
						}

						me.view.filterTabPanel.add([me.view.filterAttributeTab, me.view.filterRelationTab]);
						me.view.filterTabPanel.doLayout();
					}
				);
			}
		},

		/**
		 * Function to get filter's datas
		 *
		 * @return {Object} filter's tab datas
		 */
		getDataFilters: function () {
			if (
				!Ext.isEmpty(this.view.filterAttributeTab)
				&& !Ext.isEmpty(this.view.filterRelationTab)
			) {
				var returnArray = {};

				returnArray[CMDBuild.core.constants.Proxy.ATTRIBUTE] = this.view.filterAttributeTab.getData();
				returnArray[CMDBuild.core.constants.Proxy.RELATION] = this.view.filterRelationTab.getData();

				return returnArray;
			}

			return null;
		},

		/**
		 * To setup all filters
		 *
		 * @param {Object} filterValuesObject
		 *
		 * example:
		 * 		{
		 * 			"attributes": {...},
		 * 			"relations": {...}
		 * 		}
		 */
		setValueFilters: function (filterValuesObject) {
			this.filterValues = filterValuesObject;
		}
	});

})();

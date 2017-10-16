(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.tree.toolbar.Paging', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.tree.Tree}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onWorkflowTreeToolbarPagingShow',
			'onWorkflowTreeToolbarPagingWokflowSelect',
			'workflowTreeToolbarPagingFilterAdvancedReset',
			'workflowTreeToolbarPagingFilterBasicReset'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.filter.advanced.Advanced}
		 */
		controllerFilterAdvanced: undefined,

		/**
		 * @property {CMDBuild.controller.common.field.filter.basic.Basic}
		 */
		controllerFilterBasic: undefined,

		/**
		 * @cfg {Boolean}
		 */
		enableFilterAdvanced: false,

		/**
		 * @cfg {Boolean}
		 */
		enableFilterBasic: false,

		/**
		 * @cfg {Boolean}
		 */
		enableButtonPrint: false,

		/**
		 * @property {CMDBuild.core.buttons.iconized.split.Print}
		 */
		printButton: undefined,

		/**
		 * @cfg {CMDBuild.view.management.workflow.panel.tree.toolbar.Paging}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.workflow.panel.tree.Tree} configurationObject.parentDelegate
		 * @param {Boolean} configurationObject.enableFilterAdvanced
		 * @param {Boolean} configurationObject.enableFilterBasic
		 * @param {Boolean} configurationObject.enableButtonPrint
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			var items = [];

			// Build basic filter controller
			if (Ext.isBoolean(this.enableFilterBasic) && this.enableFilterBasic) {
				this.controllerFilterBasic = Ext.create('CMDBuild.controller.common.field.filter.basic.Basic', { parentDelegate: this });

				items: Ext.Array.push(items, [
					{ xtype: 'tbseparator' },
					this.controllerFilterBasic.getView()
				]);
			}

			// Build advanced filter controller
			if (Ext.isBoolean(this.enableFilterAdvanced) && this.enableFilterAdvanced) {
				this.controllerFilterAdvanced = Ext.create('CMDBuild.controller.management.workflow.panel.tree.filter.advanced.Advanced', { parentDelegate: this });

				items: Ext.Array.push(items, [
					{ xtype: 'tbseparator' },
					this.controllerFilterAdvanced.getView()
				]);
			}

			// Build print button
			if (Ext.isBoolean(this.enableButtonPrint) && this.enableButtonPrint)
				items: Ext.Array.push(items, [
					{ xtype: 'tbseparator' },
					this.printButton = Ext.create('CMDBuild.core.buttons.iconized.split.Print', {
						delegate: this,
						delegateEventPrefix: 'onWorkflowTree',
						formatList: [
							CMDBuild.core.constants.Proxy.PDF,
							CMDBuild.core.constants.Proxy.CSV
						]
					})
				]);

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.tree.toolbar.Paging', {
				delegate: this,
				store: this.cmfg('workflowTreeStoreGet'),
				items: items
			});
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTreeToolbarPagingShow: function () {
			this.cmfg('workflowTreeToolbarPagingFilterBasicReset');
		},

		/**
		 * @param {CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter} filter
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeToolbarPagingWokflowSelect: function (filter) {
			this.cmfg('workflowTreeToolbarPagingFilterBasicReset');

			this.controllerFilterAdvanced.cmfg('onWorkflowTreeFilterAdvancedFilterSelect', filter);
		},

		/**
		 * @returns {Void}
		 */
		workflowTreeToolbarPagingFilterAdvancedReset: function () {
			if (Ext.isObject(this.controllerFilterAdvanced) && !Ext.Object.isEmpty(this.controllerFilterAdvanced))
				this.controllerFilterAdvanced.cmfg('onWorkflowTreeFilterAdvancedClearButtonClick', true);
		},

		/**
		 * Forwarder method
		 *
		 * @returns {Void}
		 */
		workflowTreeToolbarPagingFilterBasicReset: function () {
			if (Ext.isObject(this.controllerFilterBasic) && !Ext.Object.isEmpty(this.controllerFilterBasic))
				this.controllerFilterBasic.cmfg('onFieldFilterBasicReset', true);
		}
	});

})();

(function () {

	/**
	 * Adapter class to use CMCardGrid
	 *
	 * FIXME: refactor to build own grid card
	 */
	Ext.define('CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.relations.GridCard', {
		extend: 'CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.relations.CMCardGridController',

		mixins: {
			base: 'CMDBuild.controller.common.abstract.Base',
			cardGridDelegate: 'CMDBuild.view.management.workflow.panel.tree.filter.advanced.filterEditor.relations.CardGridPanelDelegate'
		},

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.relations.Relations}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onWorkflowTreeFilterAdvancedFilterEditorRelationsGridCardCheckchange',
			'onWorkflowTreeFilterAdvancedFilterEditorRelationsGridCardDomainSelect',
			'onWorkflowTreeFilterAdvancedFilterEditorRelationsGridCardLoad',
			'onWorkflowTreeFilterAdvancedFilterEditorRelationsGridCardSelectionChange',
			'onWorkflowTreeFilterAdvancedFilterEditorRelationsGridCardViewShow'
		],

		/**
		 * @property {CMDBuild.view.management.workflow.panel.tree.filter.advanced.filterEditor.relations.CardGridPanel}
		 */
		view: undefined,

		/**
		 * @param {Object} parameters
		 * @param {CMDBuild.controller.management.workflow.panel.tree.filter.advanced.filterEditor.relations.Relations} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (parameters) {
			// Base controller callParent alias
			this.mixins.base.constructor.call(this, arguments);
			Ext.apply(this, parameters);

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.tree.filter.advanced.filterEditor.relations.CardGridPanel', { delegate: this })

			this.callParent([this.view, this.parentDelegate]);

			this.view.addDelegate(this);
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedFilterEditorRelationsGridCardCheckchange: function () {
			if (!this.cmfg('workflowTreeFilterAdvancedFilterEditorRelationsSelectedDomainIsEmpty'))
				return this.view.setDisabled(!this.cmfg('workflowTreeFilterAdvancedFilterEditorRelationsSelectedDomainGet', 'oneof'));

			return this.view.setDisabled(true);
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedFilterEditorRelationsGridCardDomainSelect: function () {
			this.view.getSelectionModel().clearSelections();

			this.view.updateStoreForClassId( // FIXME: implementation of own card grid
				this.cmfg('workflowTreeFilterAdvancedFilterEditorRelationsSelectedDomainGet', [CMDBuild.core.constants.Proxy.DESTINATION, CMDBuild.core.constants.Proxy.ID])
			);

			this.cmfg('onWorkflowTreeFilterAdvancedFilterEditorRelationsGridCardCheckchange');
		},

		/**
		 * Select configuration object cards, executed only on domain selection
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedFilterEditorRelationsGridCardLoad: function () {
			if (!this.cmfg('workflowTreeFilterAdvancedFilterEditorRelationsSelectedDomainIsEmpty')) {
				var checkedCards = this.cmfg('workflowTreeFilterAdvancedFilterEditorRelationsSelectedDomainGet', CMDBuild.core.constants.Proxy.CHECKED_CARDS);

				if (Ext.isArray(checkedCards) && !Ext.isEmpty(checkedCards))
					Ext.Array.each(checkedCards, function (selectedCardObject, i, allSelectedCardObject) {
						this.view.getSelectionModel().select(
							this.view.getStore().findBy(function (storeRecord) {
								return (
									selectedCardObject[CMDBuild.core.constants.Proxy.CLASS_NAME] == storeRecord.get('IdClass_value')
									&& selectedCardObject[CMDBuild.core.constants.Proxy.ID] == storeRecord.get('Id')
								);
							}),
							true
						);
					}, this);
			}
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedFilterEditorRelationsGridCardSelectionChange: function () {
			var checkedCards = [];

			if (this.view.getSelectionModel().hasSelection())
				Ext.Array.each(this.view.getSelectionModel().getSelection(), function (record, i, allRecords) {
					if (Ext.isObject(record) && !Ext.isEmpty(record)) {
						var checkedCardObject = {};
						checkedCardObject[CMDBuild.core.constants.Proxy.CLASS_NAME] = record.get('IdClass_value');
						checkedCardObject[CMDBuild.core.constants.Proxy.ID] = record.get('Id');

						checkedCards.push(checkedCardObject);
					}
				}, this);

			this.cmfg('workflowTreeFilterAdvancedFilterEditorRelationsSelectedDomainSet', {
				propertyName: CMDBuild.core.constants.Proxy.CHECKED_CARDS,
				value: checkedCards
			});
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTreeFilterAdvancedFilterEditorRelationsGridCardViewShow: function () {
			this.view.getStore().removeAll();
			this.view.getSelectionModel().clearSelections();

			this.cmfg('onWorkflowTreeFilterAdvancedFilterEditorRelationsGridCardCheckchange');
		},

		// Overrides
			/**
			 * @param {CMDBuild.view.management.common.CMCardGrid} grid
			 * @param {Ext.data.Model} record
			 *
			 * @returns {Void}
			 *
			 * @override
			 */
			onCMCardGridDeselect: function (grid, record) {
				this.cmfg('onWorkflowTreeFilterAdvancedFilterEditorRelationsGridCardSelectionChange');
			},

			/**
			 * @param {CMDBuild.view.management.common.CMCardGrid} grid
			 * @param {Ext.data.Model} record
			 *
			 * @returns {Void}
			 *
			 * @override
			 */
			onCMCardGridSelect: function (grid, record) {
				this.cmfg('onWorkflowTreeFilterAdvancedFilterEditorRelationsGridCardSelectionChange');
			},

			/**
			 * @returns {Void}
			 *
			 * @override
			 */
			onCardSelected: Ext.emptyFn,

			/**
			 * @param {CMDBuild.view.management.common.CMCardGrid} grid
			 *
			 * @returns {Void}
			 *
			 * @override
			 */
			onCMCardGridLoad: function (grid) {
				this.cmfg('onWorkflowTreeFilterAdvancedFilterEditorRelationsGridCardLoad');
			}
	});

})();

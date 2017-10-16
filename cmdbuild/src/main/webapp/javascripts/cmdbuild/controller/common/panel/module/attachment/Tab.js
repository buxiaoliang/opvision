(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormIdentifierGet
	 * 	- panelGridAndFormPanelFormTemplateResolverFormGet
	 * 	- panelGridAndFormPanelFormTabActiveSet
	 * 	- panelGridAndFormSelectedEntityGet
	 * 	- panelGridAndFormSelectedEntityIsEmpty
	 * 	- panelGridAndFormSelectedItemGet
	 * 	- panelGridAndFormSelectedItemIsEmpty
	 *
	 * @abstract
	 */
	Ext.define('CMDBuild.controller.common.panel.module.attachment.Tab', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onPanelModuleAttachmentTabAddButtonClick',
			'onPanelModuleAttachmentTabBackButtonClick',
			'onPanelModuleAttachmentTabShow',
			'onPanelModuleAttachmentTabShowCallback', // Public only for overriding reason
			'panelModuleAttachmentTabReset'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.module.attachment.Grid}
		 */
		controllerGrid: undefined,

		/**
		 * Adds css class to add grid bottom border
		 *
		 * @cfg {Boolean}
		 */
		enableBorderBottom: false,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.TabView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {Object} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.panel.module.attachment.TabView', { delegate: this });

			// Build sub-controllers
			this.controllerGrid = Ext.create('CMDBuild.controller.common.panel.module.attachment.Grid', { parentDelegate: this });

			// Shorthands
			this.grid = this.controllerGrid.getView();

			// View build
			this.view.add([this.grid]);
		},

		/**
		 * @returns {Void}
		 */
		onPanelModuleAttachmentTabAddButtonClick: function () {
			this.view.disable();
		},

		/**
		 * @returns {Void}
		 */
		onPanelModuleAttachmentTabBackButtonClick: function () {
			this.cmfg('panelGridAndFormPanelFormTabActiveSet', 'formTabAttachment');
		},

		/**
		 * @returns {Void}
		 */
		onPanelModuleAttachmentTabShow: function () {
			// Error handling
				if (this.cmfg('panelGridAndFormSelectedEntityIsEmpty'))
					return _error('onPanelModuleAttachmentTabShow(): unmanaged selectedEntity property', this, this.cmfg('panelGridAndFormSelectedEntityGet'));

				if (this.cmfg('panelGridAndFormSelectedItemIsEmpty'))
					return _error('onPanelModuleAttachmentTabShow(): unmanaged selectedItem property', this, this.cmfg('panelGridAndFormSelectedItemGet'));
			// END: Error handling

			CMDBuild.core.LoadMask.show(); // Manual loadMask manage

			this.controllerGrid.cmfg('panelModuleAttachmentGridReadAttachmentContext', {
				scope: this,
				callback: function () {
					CMDBuild.core.LoadMask.hide(); // Manual loadMask manage

					// History record save
					CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
						moduleId: this.cmfg('panelGridAndFormIdentifierGet'),
						entryType: {
							description: this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
							id: this.cmfg('panelGridAndFormSelectedEntityGet', CMDBuild.core.constants.Proxy.ID),
							object: this.cmfg('panelGridAndFormSelectedEntityGet')
						},
						item: {
							description: this.cmfg('panelGridAndFormSelectedItemGet', 'Description') || this.cmfg('panelGridAndFormSelectedItemGet','Code'),
							id: this.cmfg('panelGridAndFormSelectedItemGet',CMDBuild.core.constants.Proxy.ID),
							object: this.cmfg('panelGridAndFormSelectedItemGet')
						},
						section: {
							description: this.view.title,
							object: this.view
						}
					});

					this.cmfg('onPanelModuleAttachmentTabShowCallback');
				}
			});
		},

		/**
		 * Public only for overriding reasons
		 *
		 * @returns {Void}
		 *
		 * @abstract
		 */
		onPanelModuleAttachmentTabShowCallback: Ext.emptyFn,

		/**
		 * @returns {Void}
		 */
		panelModuleAttachmentTabReset: function () {
			this.controllerGrid.cmfg('panelModuleAttachmentGridReset');

			this.view.disable();
		}
	});

})();

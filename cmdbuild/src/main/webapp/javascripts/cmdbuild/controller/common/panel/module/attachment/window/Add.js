(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormSelectedEntityGet
	 * 	- panelGridAndFormSelectedEntityIsEmpty
	 * 	- panelGridAndFormSelectedItemGet
	 * 	- panelGridAndFormSelectedItemIsEmpty
	 */
	Ext.define('CMDBuild.controller.common.panel.module.attachment.window.Add', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.common.panel.module.attachment.Add'
		],

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.Grid}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onPanelModuleAttachmentWindowAddAbortButtonClick',
			'onPanelModuleAttachmentWindowAddCategoryChange',
			'onPanelModuleAttachmentWindowAddConfirmButtonClick',
			'panelModuleAttachmentWindowAddConfigureAndShow'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.module.attachment.window.container.Metadata}
		 */
		controllerContainerMetadata: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.add.ContainerFieldsCommon}
		 */
		containerFieldsCommon: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.add.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.add.AddView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.panel.module.attachment.Grid} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.common.panel.module.attachment.window.add.AddView', { delegate: this });

			// Build sub-controllers
			this.controllerContainerMetadata = Ext.create('CMDBuild.controller.common.panel.module.attachment.window.container.Metadata', { parentDelegate: this });

			// Shorthands
			this.containerFieldsCommon = this.view.form.containerFieldsCommon;
			this.form = this.view.form;

			// Build view
			this.form.add(this.controllerContainerMetadata.getView());
		},

		/**
		 * @returns {Void}
		 */
		onPanelModuleAttachmentWindowAddAbortButtonClick: function () {
			this.view.close();
		},

		/**
		 * @param {String} category
		 *
		 * @returns {Void}
		 */
		onPanelModuleAttachmentWindowAddCategoryChange: function (category) {
			this.controllerContainerMetadata.cmfg('panelModuleAttachmentWindowContainerMetadataFieldsAdd', category);
		},

		/**
		 * @returns {Void}
		 */
		onPanelModuleAttachmentWindowAddConfirmButtonClick: function () {
			if (this.validate(this.form)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.CLASS_NAME);
				params[CMDBuild.core.constants.Proxy.MAJOR] = true;
				params[CMDBuild.core.constants.Proxy.META] = Ext.encode(this.controllerContainerMetadata.cmfg('panelModuleAttachmentWindowContainerMetadataValuesGet'));

				CMDBuild.proxy.common.panel.module.attachment.Add.create({
					form: this.form.getForm(),
					params: params,
					loadMask: this.view,
					scope: this,
					success: function (form, action) {
						this.cmfg('panelModuleAttachmentGridStoreLoad');

						this.cmfg('onPanelModuleAttachmentWindowAddAbortButtonClick');
					}
				});
			}
		},

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.presets
		 *
		 * @returns {Void}
		 */
		panelModuleAttachmentWindowAddConfigureAndShow: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.presets = Ext.isObject(parameters.presets) ? parameters.presets : {};

			// Error handling
				if (this.cmfg('panelGridAndFormSelectedEntityIsEmpty'))
					return _error('panelModuleAttachmentWindowAddConfigureAndShow(): unmanaged selectedEntity property', this, this.cmfg('panelGridAndFormSelectedEntityGet'));

				if (this.cmfg('panelGridAndFormSelectedItemIsEmpty'))
					return _error('panelModuleAttachmentWindowAddConfigureAndShow(): unmanaged selectedItem property', this, this.cmfg('panelGridAndFormSelectedItemGet'));
			// END: Error handling

			this.containerFieldsCommon.fieldComboCategory.getStore().load({ // Load combo store before setup window
				scope: this,
				callback: function (records, operation, success) {
					// Form setup
					this.form.reset();

					this.controllerContainerMetadata.cmfg('panelModuleAttachmentWindowContainerMetadataValuesSet', parameters.presets);

					this.view.show();
				}
			});
		}
	});

})();

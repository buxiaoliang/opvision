(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormSelectedEntityGet
	 * 	- panelGridAndFormSelectedEntityIsEmpty
	 * 	- panelGridAndFormSelectedItemGet
	 * 	- panelGridAndFormSelectedItemIsEmpty
	 */
	Ext.define('CMDBuild.controller.common.panel.module.attachment.window.Modify', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		uses: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.common.panel.module.attachment.Modify'
		],

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.attachment.Grid}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onPanelModuleAttachmentWindowModifyAbortButtonClick',
			'onPanelModuleAttachmentWindowModifyCategoryChange',
			'onPanelModuleAttachmentWindowModifyConfirmButtonClick',
			'panelModuleAttachmentWindowModifyConfigureAndShow'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.module.attachment.window.container.Metadata}
		 */
		controllerContainerMetadata: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.modify.ContainerFieldsCommon}
		 */
		containerFieldsCommon: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.modify.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.window.modify.ModifyView}
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

			this.view = Ext.create('CMDBuild.view.common.panel.module.attachment.window.modify.ModifyView', { delegate: this });

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
		onPanelModuleAttachmentWindowModifyAbortButtonClick: function () {
			this.view.close();
		},

		/**
		 * @param {String} category		 *
		 * @returns {Void}
		 */
		onPanelModuleAttachmentWindowModifyCategoryChange: function (category) {
			this.controllerContainerMetadata.cmfg('panelModuleAttachmentWindowContainerMetadataFieldsAdd', category);
		},

		/**
		 * @returns {Void}
		 */
		onPanelModuleAttachmentWindowModifyConfirmButtonClick: function () {
			if (this.validate(this.form)) {
				// Avoid to submit empty file property
				this.containerFieldsCommon.fieldFile.submitValue = !Ext.isEmpty(this.containerFieldsCommon.fieldFile.getValue());

				var params = {};
				params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('panelGridAndFormSelectedItemGet', CMDBuild.core.constants.Proxy.CLASS_NAME);
				params[CMDBuild.core.constants.Proxy.META] = Ext.encode(this.controllerContainerMetadata.cmfg('panelModuleAttachmentWindowContainerMetadataValuesGet'));

				CMDBuild.proxy.common.panel.module.attachment.Modify.update({
					form: this.form.getForm(),
					params: params,
					loadMask: this.view,
					scope: this,
					success: function (form, action) {
						this.cmfg('panelModuleAttachmentGridStoreLoad');

						this.cmfg('onPanelModuleAttachmentWindowModifyAbortButtonClick');
					}
				});
			}
		},

		/**
		 * @param {Object} parameters
		 * @param {CMDBuild.model.common.panel.module.attachment.Attachment} parameters.record
		 *
		 * @returns {Void}
		 */
		panelModuleAttachmentWindowModifyConfigureAndShow: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (this.cmfg('panelGridAndFormSelectedEntityIsEmpty'))
					return _error('panelModuleAttachmentWindowModifyConfigureAndShow(): unmanaged selectedEntity property', this, this.cmfg('panelGridAndFormSelectedEntityGet'));

				if (this.cmfg('panelGridAndFormSelectedItemIsEmpty'))
					return _error('panelModuleAttachmentWindowModifyConfigureAndShow(): unmanaged selectedItem property', this, this.cmfg('panelGridAndFormSelectedItemGet'));

				if (!Ext.isObject(parameters.record) || Ext.Object.isEmpty(parameters.record))
					return _error('panelModuleAttachmentWindowModifyConfigureAndShow(): unmanaged record parameter', this, parameters.record);
				// END: Error handling

			this.containerFieldsCommon.fieldComboCategory.getStore().load({ // Load combo store before setup window
				scope: this,
				callback: function (records, operation, success) {
					// Form setup
					this.form.reset();
					this.form.loadRecord(parameters.record);

					this.controllerContainerMetadata.cmfg('panelModuleAttachmentWindowContainerMetadataValuesSet', parameters.record.get(CMDBuild.core.constants.Proxy.META));

					// Fields setup
					this.containerFieldsCommon.fieldFile.setDisabled(!parameters.record.get(CMDBuild.core.constants.Proxy.VERSIONABLE));
					this.containerFieldsCommon.fieldFile.setEmptyText('C:\\fakepath\\' + parameters.record.get(CMDBuild.core.constants.Proxy.FILE_NAME));

					this.containerFieldsCommon.fieldMajor.setDisabled(!parameters.record.get(CMDBuild.core.constants.Proxy.VERSIONABLE));

					this.view.show();
				}
			});
		}
	});

})();

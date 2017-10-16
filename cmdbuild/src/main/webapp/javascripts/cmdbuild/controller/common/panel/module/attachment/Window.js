(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormSelectedEntityGet
	 * 	- panelGridAndFormSelectedEntityIsEmpty
	 * 	- panelGridAndFormSelectedItemGet
	 * 	- panelGridAndFormSelectedItemIsEmpty
	 */
	Ext.define('CMDBuild.controller.common.panel.module.attachment.Window', {
		extend: 'CMDBuild.controller.common.panel.module.attachment.Grid',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.LoadMask',
			'CMDBuild.proxy.common.panel.module.attachment.Window'
		],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onPanelModuleAttachmentWindowCloseButtonClick',
			'panelModuleAttachmentWindowConfigureAndShow',
			'panelModuleAttachmentWindowSelectedEntityGet = panelGridAndFormSelectedEntityGet',
			'panelModuleAttachmentWindowSelectedEntityIsEmpty = panelGridAndFormSelectedEntityIsEmpty',
			'panelModuleAttachmentWindowSelectedItemGet = panelGridAndFormSelectedItemGet',
			'panelModuleAttachmentWindowSelectedItemIsEmpty = panelGridAndFormSelectedItemIsEmpty'
		],

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {CMDBuild.model.common.panel.module.attachment.entity.Entity}
		 *
		 * @private
		 */
		selectedEntity: undefined,

		/**
		 * @property {CMDBuild.model.common.panel.module.attachment.Item}
		 *
		 * @private
		 */
		selectedItem: undefined,

		/**
		 * @property {CMDBuild.view.common.panel.module.attachment.WindowView}
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

			this.view = Ext.create('CMDBuild.view.common.panel.module.attachment.WindowView', { delegate: this });

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
		onPanelModuleAttachmentWindowCloseButtonClick: function () {
			this.view.close();
		},

		/**
		 * @param {Object} parameters
		 * @param {Number} parameters.entityId
		 * @param {Number} parameters.id
		 *
		 * @returns {Void}
		 */
		panelModuleAttachmentWindowConfigureAndShow: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			this.panelModuleAttachmentWindowSelectedEntityReset();
			this.panelModuleAttachmentWindowSelectedItemReset();

			CMDBuild.core.LoadMask.show(); // Manual loadMask manage

			this.readEntity(parameters.entityId, function () {
				this.readItem(parameters.id, function () {
					this.controllerGrid.cmfg('panelModuleAttachmentGridReadAttachmentContext',{
						scope: this,
						callback:  function () {
							CMDBuild.core.LoadMask.hide(); // Manual loadMask manage

							this.setViewTitle([this.cmfg('panelModuleAttachmentWindowSelectedItemGet', CMDBuild.core.constants.Proxy.DESCRIPTION)]);

							this.grid.buttonAdd.setDisabled(
								!this.cmfg('panelGridAndFormSelectedEntityGet', [
									CMDBuild.core.constants.Proxy.PERMISSIONS,
									CMDBuild.core.constants.Proxy.WRITE
								])
							);

							this.controllerGrid.cmfg('panelModuleAttachmentGridStoreLoad');

							this.view.show();
						}
					});
				});
			});
		},

		// SelectedEntity property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			panelModuleAttachmentWindowSelectedEntityGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntity';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			panelModuleAttachmentWindowSelectedEntityIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntity';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Boolean}
			 *
			 * @private
			 */
			panelModuleAttachmentWindowSelectedEntityReset: function () {
				return this.propertyManageReset('selectedEntity');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			panelModuleAttachmentWindowSelectedEntitySet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.common.panel.module.attachment.entity.Entity';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntity';

					this.propertyManageSet(parameters);
				}
			},

		// SelectedItem property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			panelModuleAttachmentWindowSelectedItemGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedItem';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			panelModuleAttachmentWindowSelectedItemIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedItem';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			panelModuleAttachmentWindowSelectedItemReset: function (parameters) {
				this.propertyManageReset('selectedItem');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			panelModuleAttachmentWindowSelectedItemSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.common.panel.module.attachment.Item';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedItem';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @param {Number} id
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		readEntity: function (id, callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			// Error handling
				if (!Ext.isNumber(id) || Ext.isEmpty(id))
					return _error('readEntity(): unmanaged id parameter', this, id);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.ACTIVE] = true;

			CMDBuild.proxy.common.panel.module.attachment.Window.readEntity({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.CLASSES];

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
						var entityObject = Ext.Array.findBy(decodedResponse, function(entityObject, i) {
							return entityObject[CMDBuild.core.constants.Proxy.ID] == id;
						}, this);

						if (Ext.isObject(entityObject) && !Ext.Object.isEmpty(entityObject)) {
							this.panelModuleAttachmentWindowSelectedEntitySet({ value: entityObject });

							Ext.callback(callback, this);
						} else {
							_error('readEntity(): entity not found', this, id);
						}
					} else {
						_error('readEntity(): unmanaged response', this, decodedResponse);
					}
				}
			});
		},

		/**
		 * @param {Number} id
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		readItem: function (id, callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			// Error handling
				if (!Ext.isNumber(id) || Ext.isEmpty(id))
					return _error('readItem(): unmanaged id parameter', this, id);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = id;
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('panelModuleAttachmentWindowSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);

			CMDBuild.proxy.common.panel.module.attachment.Window.readItem({
				params: params,
				loadMask: false,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.CARD];

					if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
						this.panelModuleAttachmentWindowSelectedItemSet({ value: decodedResponse });

						Ext.callback(callback, this);
					} else {
						_error('readItem(): item not found', this, id);
					}
				}
			});
		}
	});

})();

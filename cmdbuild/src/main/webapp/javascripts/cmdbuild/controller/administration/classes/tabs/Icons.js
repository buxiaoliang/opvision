(function () {

	Ext.require([
		'CMDBuild.core.constants.Proxy',
		'CMDBuild.core.LoadMask',
		'CMDBuild.proxy.administration.classes.tabs.Icons'
	]);

	Ext.define('CMDBuild.controller.administration.classes.tabs.Icons', {

		/**
		 * @cfg {CMDBuild.controller.administration.classes.Classes}
		 */
		parentDelegate: undefined,

		/**
		 * @property {Object}
		 */
		classIconObject: {},

		/**
		 * @cfg {Array}
		 *
		 * FIXME: Waiting for a future full implementation as separate tab
		 */
		//cmfgCatchedFunctions: [
		//	'onClassesTabPropertiesIconsClassSelection',
		//	'onClassesTabPropertiesIconsUploadButtonClick'
		//],

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.properties.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.properties.panel.IconsPanel}
		 */
		panelIcons: undefined,

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.properties.panel.BasePropertiesPanel}
		 */
		panelProperties: undefined,

		/**
		 * @cfg {CMDBuild.view.administration.classes.tabs.properties.PropertiesView}
		 */
		view: undefined,

		/**
		 * @returns {Void}
		 */
		onClassesTabPropertiesIconsClassSelection: function () {
			if (!this.cmfg('classesSelectedClassIsEmpty')) {
				this.panelIcons.imageIconDisplayField.setSrc(); // Field reset

				// Find icon definition object
				CMDBuild.proxy.administration.classes.tabs.Icons.readAllIcons({
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.DATA];

						this.classIconObject = {};

						if (!Ext.isEmpty(decodedResponse) && Ext.isArray(decodedResponse)) {
							this.classIconObject = Ext.Array.findBy(decodedResponse, function (iconObject, i, allIconObjects) {
								return iconObject.details.id == this.cmfg('classesSelectedClassGet', CMDBuild.core.constants.Proxy.NAME);
							}, this);

							if (!Ext.isEmpty(this.classIconObject)) {
								// Download and display
								this.panelIcons.imageIconDisplayField.setSrc(
									'services/rest/v2/filestores/images/folders/' // TODO: use rest index
									+ this.classIconObject.image.details.folder + '/files/'
									+ this.classIconObject.image.details.file + '/download/?'
									+ CMDBuild.core.constants.Proxy.AUTHORIZATION_HEADER_KEY + '=' + Ext.util.Cookies.get(CMDBuild.core.constants.Proxy.AUTHORIZATION_HEADER_KEY)
								);
							}
						}
					}
				});
			} else {
				_error('wrong selectedClassModel parameter on icon form class selected method', this);
			}
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabPropertiesIconsUploadButtonClick: function () {
			var targetFolderModel = null;

			if (Ext.Object.isEmpty(this.classIconObject)) {
				this.uploadImageAndBindIcon();
			} else { // Delete icon after upload new one
				this.deleteImageAndIcon();
			}
		},

		/**
		 * @param {Function} callback
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		deleteImageAndIcon: function () {
			CMDBuild.proxy.administration.classes.tabs.Icons.remove({
				restUrlParams: {
					iconId: this.classIconObject._id,
					folderId: this.classIconObject.image.details.folder,
					imageId: this.classIconObject.image.details.file
				},
				scope: this,
				callback: this.uploadImageAndBindIcon
			});
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		uploadImageAndBindIcon: function (options, success, response) {
			// Build target folder model
			CMDBuild.core.LoadMask.show();
			CMDBuild.proxy.administration.classes.tabs.Icons.getFolders({
				loadMask: false,
				scope: this,
				failure: function (response, options, decodedResponse) {
					CMDBuild.core.LoadMask.hide();
				},
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.DATA];

					if (!Ext.isEmpty(decodedResponse) && Ext.isArray(decodedResponse))
						targetFolderModel = Ext.create('CMDBuild.model.classes.icon.Folder',
							Ext.Array.findBy(decodedResponse, function (folderObject, i, allFolderObjects) {
								return Ext.isEmpty(folderObject[CMDBuild.core.constants.Proxy.PARENT]);
							}, this)
						);

					// Upload image
					if (Ext.isObject(targetFolderModel) && !Ext.Object.isEmpty(targetFolderModel)) {
						var params = {};
						params['fileStore'] = 'images';
						params['folder'] = targetFolderModel.get('_id');

						CMDBuild.proxy.administration.classes.tabs.Icons.createImage({
							form: this.panelIcons.getForm(),
							params: params,
							scope: this,
							failure: function (response, options, decodedResponse) {
								CMDBuild.core.LoadMask.hide();
							},
							success: function (response, options, decodedResponse) {
								var uploadedIconName = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

								if (!Ext.isEmpty(uploadedIconName) && Ext.isString(uploadedIconName)) {
									// Update uploaded image with class bind
									CMDBuild.proxy.administration.classes.tabs.Icons.update({
										jsonData: {
											type: 'class',
											details: {
												id: this.cmfg('classesSelectedClassGet', CMDBuild.core.constants.Proxy.NAME)
											},
											image: {
												type: 'filestore',
												details: {
													store: 'filestore',
													folder: targetFolderModel.get('_id'),
													file: uploadedIconName
												}
											}
										},
										loadMask: false,
										scope: this,
										callback: function (response, options, decodedResponse) {
											this.cmfg('onClassesTabPropertiesIconsClassSelection');

											CMDBuild.core.LoadMask.hide();
										}
									});
								} else {
									_error('uploaded icon identifier error "' + uploadedIconName + '"', this);
								}
							}
						});
					}
				}
			});
		}
	});

})();

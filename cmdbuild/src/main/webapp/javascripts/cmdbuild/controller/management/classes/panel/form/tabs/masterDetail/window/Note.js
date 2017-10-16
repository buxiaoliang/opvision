(function () {

	Ext.define('CMDBuild.controller.management.classes.panel.form.tabs.masterDetail.window.Note', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.management.classes.panel.form.tabs.masterDetail.window.Note'
		],

		/**
		 * @cfg {CMDBuild.controller.management.classes.masterDetails.CMMasterDetailsController}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'classesFormTabMasterDetailWindowNoteConfigureAndShow'
		],

		/**
		 * @property {CMDBuild.view.management.classes.panel.form.tabs.masterDetail.window.NoteView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.classes.masterDetails.CMMasterDetailsController} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.classes.panel.form.tabs.masterDetail.window.NoteView', { delegate: this });
		},

		/**
		 * @param {Object} parameters
		 * @param {Number} parameters.cardId
		 * @param {String} parameters.className
		 *
		 * @returns {Void}
		 */
		classesFormTabMasterDetailWindowNoteConfigureAndShow: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (!Ext.isNumber(parameters.cardId) || Ext.isEmpty(parameters.cardId))
					return _error('classesFormTabMasterDetailWindowNoteConfigureAndShow(): unmanaged cardId parameter', this, parameters.cardId);

				if (!Ext.isString(parameters.className) || Ext.isEmpty(parameters.className))
					return _error('classesFormTabMasterDetailWindowNoteConfigureAndShow(): unmanaged className parameter', this, parameters.className);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = parameters.cardId;
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = parameters.className;

			CMDBuild.proxy.management.classes.panel.form.tabs.masterDetail.window.Note.read({
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.CARD];

					if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
						this.view.fieldNote.setValue(decodedResponse['Notes']);

						this.setViewTitle([decodedResponse['Description']]);

						this.view.show();
					} else {
						_error('classesFormTabMasterDetailWindowNoteConfigureAndShow(): unmanaged response', this, decodedResponse);
					}
				}
			});
		}
	});

})();

(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.common.emailFilterForm.Textarea', {
		extend: 'Ext.form.field.TextArea',

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.common.emailFilterForm.EmailFilterForm}
		 */
		delegate: undefined,

		/**
		 * @property {String}
		 *
		 * @required
		 */
		name: undefined,

		/**
		 * @property {Number}
		 *
		 * @required
		 */
		id: undefined,

		readOnly: true,
		flex: 1
	});

})();

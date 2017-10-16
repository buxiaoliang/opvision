(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.common.emailFilterForm.EditButton', {
		extend: 'Ext.button.Button',

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.common.emailFilterForm.EmailFilterForm}
		 */
		delegate: undefined,

		/**
		 * @property {String}
		 *
		 * @required
		 */
		titleWindow: undefined,

		icon: 'images/icons/table.png',
		considerAsFieldToDisable: true,
		border: true,
		margin: '0 0 0 3',

		handler: function () {
			this.delegate.cmOn('onFilterButtonClick', {
				titleWindow: this.titleWindow
			});
		}
	});

})();

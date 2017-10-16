(function () {

	/**
	 * Placeholder class to build empty form if no widget is selected from grid
	 */
	Ext.define('CMDBuild.controller.administration.classes.tabs.widgets.form.Empty', {
		extend: 'CMDBuild.controller.administration.classes.tabs.widgets.form.Abstract',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.administration.classes.tabs.widgets.Widgets}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.widgets.form.EmptyPanel}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.classes.tabs.widgets.Widgets} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.classes.tabs.widgets.form.EmptyPanel', { delegate: this });
		}
	});

})();

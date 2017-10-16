(function () {

	Ext.define('CMDBuild.view.administration.accordion.TaskManager', {
		extend: 'CMDBuild.view.common.abstract.Accordion',

		/**
		 * @cfg {CMDBuild.controller.administration.accordion.TaskManager}
		 */
		delegate: undefined,

		title: CMDBuild.Translation.taskManager,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				store: Ext.create('Ext.data.TreeStore', {
					autoLoad: true,
					model: this.storeModelName,
					root: {
						expanded: true,
						children: []
					}
				})
			});

			this.callParent(arguments);
		}
	});

})();

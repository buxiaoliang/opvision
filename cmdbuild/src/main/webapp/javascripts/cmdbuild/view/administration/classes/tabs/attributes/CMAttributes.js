(function () {

	/**
	 * @link CMDBuild.view.administration.domain.tabs.attributes.CMAttributes
	 * @link CMDBuild.view.administration.workflow.CMAttributes
	 */

	Ext.define('CMDBuild.view.administration.classes.tabs.attributes.CMAttributes', {
		extend: "Ext.panel.Panel",

		/**
		 * @cfg {CMDBuild.controller.administration.classes.Classes}
		 */
		delegate: undefined,

		constructor: function () {
			this.formPanel = this.buildFormPanel();

			this.gridPanel = Ext.create('CMDBuild.view.administration.classes.tabs.attributes.CMAttributeGrid', {
				region: "north",
				split: true,
				height: "30%",
				border: false
			});

			this.callParent(arguments);

			this.formPanel.disableModify();
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				layout: "border",
				items: [this.formPanel, this.gridPanel]
			});

			this.callParent(arguments);

			this.formPanel.delegate = this.delegate;
			this.gridPanel.delegate = this.delegate;
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		onClassSelected: function (idClass, className) {
			this.formPanel.onClassSelected(idClass, className);
			this.gridPanel.onClassSelected(idClass, className);
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		buildFormPanel: function () {
			return Ext.create('CMDBuild.view.administration.classes.tabs.attributes.CMAttributesForm', {
				region: 'center'
			});
		}
	});

})();

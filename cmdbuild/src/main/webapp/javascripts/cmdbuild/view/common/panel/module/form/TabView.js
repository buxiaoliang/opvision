(function () {

	Ext.define('CMDBuild.view.common.panel.module.form.TabView', {
		extend: 'Ext.panel.Panel',

		/**
		 * @cfg {CMDBuild.controller.common.panel.module.form.Tab}
		 */
		delegate: undefined,

		bodyCls: 'cmdb-blue-panel-no-padding',
		border: false,
		frame: false,
		itemId: 'formTabItem',
		layout: 'border',
		title: CMDBuild.Translation.item,

		listeners: {
			show: function (panel, eOpts) {
				this.delegate.cmfg('onPanelModuleFormTabShow');
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		disable: function () {
			this.delegate.cmfg('panelModuleFormTabDisable');
		},

		/**
		 * @returns {Ext.form.Basic}
		 *
		 * @legacy widget manager
		 *
		 * FIXME: waiting for refactor (CMWidgetManager)
		 */
		getFormForTemplateResolver: function () {
			return this.delegate.cmfg('panelModuleFormFormGet');
		},

		/**
		 * @returns {CMDBuild.view.management.common.widget.CMWidgetButtonsPanel}
		 *
		 * @legacy widget manager
		 *
		 * FIXME: waiting for refactor (CMWidgetManager)
		 */
		getWidgetButtonsPanel: function() {
			return this.delegate.controllerPanelWidget;
		}
	});

})();

(function () {

	/**
	 * Adapter
	 *
	 * @legacy
	 */
	Ext.define('CMDBuild.view.management.workflow.panel.form.TabPanel', {
		extend: 'Ext.tab.Panel',

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.Form}
		 */
		delegate: undefined,

		border: false,
		cls: 'cmdb-border-right',
		frame: false,
		region: 'center',

		/**
		 * @returns {Void}
		 */
		activateFirstTab: function() {
			this.setActiveTab(0);
		},

		// CMTabbedWidgetDelegate
			/**
			 * @returns {CMDBuild.view.common.panel.module.attachment.TabView}
			 */
			getAttachmentsPanel: function() {
				if (!Ext.isEmpty(this.delegate) && !Ext.isEmpty(this.delegate.controllerTabAttachment))
					return this.delegate.controllerTabAttachment.getView();

				return null;
			},

			/**
			 * @returns {CMDBuild.view.management.workflow.panel.form.tabs.note.NoteView}
			 */
			getNotesPanel: function() {
				if (!Ext.isEmpty(this.delegate) && !Ext.isEmpty(this.delegate.controllerTabNote))
					return this.delegate.controllerTabNote.getView();

				return null;
			},

			/**
			 * @returns {CMDBuild.view.management.workflow.panel.form.tabs.email.Email}
			 */
			getEmailPanel: function() {
				if (!Ext.isEmpty(this.delegate) && !Ext.isEmpty(this.delegate.controllerTabEmail))
					return this.delegate.controllerTabEmail.getView();

				return null;
			},

			/**
			 * Returns false if is not able to manage the widget (only for normal widgets)
			 *
			 * @param {Object} view
			 *
			 * @returns {Boolean}
			 */
			showWidget: function (view) {
				var managedClasses = {
					'CMDBuild.view.common.panel.module.attachment.TabView': Ext.emptyFn,
					'CMDBuild.view.management.workflow.panel.form.tabs.note.NoteView': Ext.emptyFn,
					'CMDBuild.view.management.workflow.panel.form.tabs.email.Email': function (me) {
						var widgetRelatedPanel = me.getEmailPanel();

						if (!Ext.isEmpty(widgetRelatedPanel) && Ext.isFunction(widgetRelatedPanel.cmActivate))
							widgetRelatedPanel.cmActivate();
					}
				};

				var fn = managedClasses[Ext.getClassName(view)];

				if (Ext.isFunction(fn)) {
					fn(this);

					return true;
				} else {
					return false;
				}
			}
	});

})();

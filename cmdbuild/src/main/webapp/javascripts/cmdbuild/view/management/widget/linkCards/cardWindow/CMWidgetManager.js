(function() {

	/**
	 * @link CMDBuild.view.management.common.widgets.CMWidgetManager
	 */
	Ext.define("CMDBuild.view.management.widget.linkCards.cardWindow.CMWidgetManager", {

		/**
		 * @cfg {CMDBuild.controller.management.common.CMWidgetManagerController}
		 */
		delegate: undefined,

		/**
		 * @property {Object}
		 */
		builders: {},

		/**
		 * @param {CMDBuild.view.management.classes.CMCardPanel or CMDBuild.view.management.workflow.panel.form.tabs.activity.ActivityView} mainView
		 * @param {Mixed} tabbedWidgetDelegate
		 */
		constructor: function(configurationObject) {
			var me = this;

			Ext.apply(this, configurationObject);

			Ext.apply(this, {
				builders: {
				// OpenTabs widgets: they have to open a tab in the activityTabPanel, and not a separate window
					/**
					 * @param {Object} widget
					 * @param {Ext.data.Model or CMDBuild.model.CMActivityInstance} card
					 *
					 * @returns {Void}
					 */
					'.ManageEmail': function (widget, card) {
						if (!Ext.isEmpty(me.tabbedWidgetDelegate) && !Ext.isEmpty(me.tabbedWidgetDelegate.getEmailPanel()))
							return me.tabbedWidgetDelegate.getEmailPanel();

						return null;
					},

					/**
					 * @param {Object} widget
					 * @param {CMDBuild.model.CMActivityInstance} activity
					 *
					 * @returns {Void}
					 */
					'.OpenAttachment': function (widget, activity) {
						if (!Ext.isEmpty(me.tabbedWidgetDelegate) && !Ext.isEmpty(me.tabbedWidgetDelegate.getAttachmentsPanel()))
							return me.tabbedWidgetDelegate.getAttachmentsPanel();

						return null;
					},

					/**
					 * @param {Object} widget
					 * @param {CMDBuild.model.CMActivityInstance} activity
					 *
					 * @returns {Void}
					 */
					'.OpenNote': function (widget, activity) {
						if (!Ext.isEmpty(me.tabbedWidgetDelegate) && !Ext.isEmpty(me.tabbedWidgetDelegate.getEmailPanel()))
							return me.tabbedWidgetDelegate.getNotesPanel();

						return null;
					},
				// End OpenTabs widgets

					/**
					 * @param {Object} widget
					 * @param {Ext.data.Model or CMDBuild.model.CMActivityInstance} card or activity
					 */
					'.Calendar': function(widget, card) {
						var w = new CMDBuild.view.management.common.widgets.CMCalendar();

						me.widgetsContainer.addWidgt(w);

						return w;
					},

					/**
					 * @param {Object} widget
					 * @param {Ext.data.Model or CMDBuild.model.CMActivityInstance} card or activity
					 */
					'.CreateModifyCard': function(widget, card) {
						var w = Ext.create('CMDBuild.view.management.widget.createModifyCard.CMCreateModifyCard');

						me.widgetsContainer.addWidgt(w);

						return w;
					},

					/**
					 * @param {Object} widget
					 * @param {CMDBuild.model.CMActivityInstance} activity
					 *
					 * @returns {CMDBuild.view.management.widget.customForm.CustomFormView}
					 */
					'.CustomForm': function(widget, card) {
						var w = Ext.create('CMDBuild.view.management.widget.customForm.CustomFormView');

						me.widgetsContainer.addWidgt(w);

						return w;
					},

					/**
					 * @param {Object} widget
					 * @param {CMDBuild.model.CMActivityInstance} activity
					 *
					 * @returns {CMDBuild.view.management.common.widgets.grid.GridView}
					 */
					'.Grid': function(widget, card) {
						var w = Ext.create('CMDBuild.view.management.common.widgets.grid.GridView');

						me.widgetsContainer.addWidgt(w);

						return w;
					},

					/**
					 * @param {Object} widget
					 * @param {CMDBuild.model.CMActivityInstance} card or activity
					 */
					'.LinkCards': function(widget, card) {
						var w = Ext.create('CMDBuild.view.management.widget.linkCards.LinkCards', {
							widgetConf: widget // TODO: this dependency should be deleted
						});

						me.widgetsContainer.addWidgt(w);

						return w;
					},

					/**
					 * @param {Object} widget
					 * @param {CMDBuild.model.CMActivityInstance} card or activity
					 */
					'.ManageRelation': function(widget, card) {
						var w = Ext.create('CMDBuild.view.management.widget.manageRelation.CMManageRelation', {
							widget: widget // TODO: this dependency should be deleted
						});

						me.widgetsContainer.addWidgt(w);

						return w;
					},

					/**
					 * @param {Object} widget
					 * @param {CMDBuild.model.CMActivityInstance} card or activity
					 */
					'.NavigationTree': function(widget, card) {
						var w = Ext.create('CMDBuild.view.management.widget.navigationTree.NavigationTreeView');

						me.widgetsContainer.addWidgt(w);

						return w;
					},

					/**
					 * @param {Object} widget
					 * @param {Ext.data.Model or CMDBuild.model.CMActivityInstance} card or activity
					 */
					'.OpenReport': function(widget, card) {
						var w = Ext.create('CMDBuild.view.management.widget.openReport.OpenReportView');

						me.widgetsContainer.addWidgt(w);

						return w;
					},

					/**
					 * @param {Object} widget
					 * @param {Ext.data.Model or CMDBuild.model.CMActivityInstance} card or activity
					 */
					'.Ping': function(widget, card) {
						var w = Ext.create('CMDBuild.view.management.widget.PingView');

						me.widgetsContainer.addWidgt(w);

						return w;
					},

					/**
					 * @param {Object} widget
					 * @param {CMDBuild.model.CMActivityInstance} card or activity
					 */
					'.PresetFromCard': function(widget, card) {
						var w = new CMDBuild.view.management.common.widgets.CMPresetFromCard();

						me.widgetsContainer.addWidgt(w);

						return w;
					},

					/**
					 * @param {Object} widget
					 * @param {CMDBuild.model.CMActivityInstance} card or activity
					 */
					'.WebService': function(widget, card) {
						var w = new CMDBuild.view.management.common.widgets.CMWebService();

						me.widgetsContainer.addWidgt(w);

						return w;
					},

					/**
					 * @param {Object} widget
					 * @param {Ext.data.Model or CMDBuild.model.CMActivityInstance} card or activity
					 */
					'.Workflow': function(widget, card) {
						var w = Ext.create('CMDBuild.view.management.common.widgets.workflow.CMWorkflow');

						me.widgetsContainer.addWidgt(w);

						return w;
					}
				}
			});
		},

		buildWidget: function(widget, card) {
			this.mainView.getWidgetButtonsPanel().addWidget(widget);
			return this._buildWidget(widget, card);
		},

		showWidget: function(w, title) {
			if (this.tabbedWidgetDelegate == null
				|| !this.tabbedWidgetDelegate.showWidget(w, title)) {

				this.widgetsContainer.showWidget(w, title);
			}
		},

		hideWidgetsContainer: function() {
			if (this.widgetsContainer) {
				this.widgetsContainer.hide();
			}
		},

		buildWidgetsContainer: function() {
			return Ext.create('CMDBuild.view.management.common.widgets.CMWidgetsWindow', {
				delegate: this.delegate
			});
		},

		reset: function() {
			if (!Ext.isEmpty(this.widgetsContainer))
				this.widgetsContainer.destroy();

			// Email tab configuration reset
			// TODO: find a better implementation
			if (
				!Ext.isEmpty(this.mainView.delegate)
				&& !Ext.isEmpty(this.mainView.delegate.superController)
				&& !Ext.isEmpty(this.mainView.delegate.superController.controllerTabEmail)
				&& Ext.isFunction(this.mainView.delegate.superController.controllerTabEmail.reset)
			) {
				this.mainView.delegate.superController.controllerTabEmail.reset();
			}

			this.widgetsContainer = this.buildWidgetsContainer();

			this.mainView.getWidgetButtonsPanel().removeAllButtons();

			this.widgetsMap = {};
		},

		getFormForTemplateResolver: function getFormForTemplateResolver() {
			return this.mainView.getFormForTemplateResolver();
		},

		activateFirstTab: function() {
			if (this.tabbedWidgetDelegate != null) {
				this.tabbedWidgetDelegate.activateFirstTab();
			}
		},

		_buildWidget: function(widget, card) {
			if (this.builders[widget.type]) {
				return this.builders[widget.type](widget, card);
			} else {
				return null;
			}
		}
	});

})();
(function() {

	/**
	 * @link CMDBuild.view.management.common.CMFormWithWidgetButtons
	 *
	 * @legacy
	 */
	Ext.define("CMDBuild.view.management.workflow.panel.form.tabs.activity.ActivityView", {
		extend: "Ext.panel.Panel",

		mixins: {
			widgetManagerDelegate: "CMDBuild.view.management.common.widgets.CMWidgetManagerDelegate"
		},

		border: false,
		title: CMDBuild.Translation.activity,
		withButtons: true,
		withToolBar: true,

		constructor: function() {
			this.form = this.buildForm();

			this.widgets = new CMDBuild.view.management.common.widget.CMWidgetButtonsPanel({
				region: 'east',
				hideMode: 'offsets',
				cls: "cmdb-border-left",
				autoScroll: true,
				frame: true,
				border: false,
				items: []
			});

			_CMUtils.forwardMethods(this, this.form, [
				"loadCard",
				"getValues",
				"reset",
				"getInvalidAttributeAsHTML",
				"fillForm",
				"getForm",
				"hasDomainAttributes",
				"ensureEditPanel",
				"isInEditing",
				"enableStopButton",
				"disableStopButton",
				"updateInfo"
			]);

			_CMUtils.forwardMethods(this, this.widgets, [
				"removeAllButtons",
				"addWidget"
			]);

			this.widgets.hide();

			Ext.apply(this, {
				layout: "border",
				items: [this.form, this.widgets]
			});

			this.callParent(arguments);

			this.CMEVENTS = Ext.apply(this.form.CMEVENTS, this.widgets.CMEVENTS);
			this.relayEvents(this.widgets, [this.widgets.CMEVENTS.widgetButtonClick]);

			var ee = this.form.CMEVENTS;
			this.relayEvents(this.form, [
				ee.saveCardButtonClick,
				ee.abortButtonClick,
				ee.removeCardButtonClick,
				ee.modifyCardButtonClick,
				ee.openGraphButtonClick,
				ee.editModeDidAcitvate,
				ee.displayModeDidActivate
			]);

			this.mon(this, "activate", function() {
				this.form.fireEvent("activate");
			}, this);

			this.CMEVENTS.advanceCardButtonClick = this.form.CMEVENTS.advanceCardButtonClick;
			this.addEvents(this.CMEVENTS.advanceCardButtonClick);
			this.relayEvents(this.form, [this.CMEVENTS.advanceCardButtonClick, this.CMEVENTS.checkEditability]);
		},

		listeners: {
			show: function(panel, eOpts) {
				// History record save
				if (!Ext.isEmpty(_CMWFState.getProcessClassRef()) && !Ext.isEmpty( _CMWFState.getProcessInstance()))
					CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
						moduleId: 'workflow',
						entryType: {
							description: _CMWFState.getProcessClassRef().get(CMDBuild.core.constants.Proxy.TEXT),
							id: _CMWFState.getProcessClassRef().get(CMDBuild.core.constants.Proxy.ID),
							object: _CMWFState.getProcessClassRef()
						},
						item: {
							description: _CMWFState.getProcessInstance().get(CMDBuild.core.constants.Proxy.TEXT),
							id: _CMWFState.getProcessInstance().get(CMDBuild.core.constants.Proxy.ID),
							object: _CMWFState.getProcessInstance()
						},
						section: {
							description: this.title,
							object: this
						}
					});
			}
		},

		buildForm: function() {
			return Ext.create('CMDBuild.view.management.workflow.panel.form.tabs.activity.FormPanel', {
				region: "center",
				cmOwner: this
			});
		},

		clear: function() {
			this.form.removeAll(destroy = true);
			this.form.updateInfo();
			this.widgets.removeAll(destroy = true);
			this.widgets.hide();
			this.displayMode();
		},

		displayMode: function(enableCMTbar) {
			this.form.displayMode(enableCMTbar);
			this.widgets.displayMode();
		},

		displayModeForNotEditableCard: function() {
			this.form.displayModeForNotEditableCard();
			this.widgets.displayMode();
		},

		editMode: function() {
			this.form.editMode();
			this.widgets.editMode();
		},

		isTheActivePanel: function() {
			var out = true;
			try {
				out = this.ownerCt.layout.getActiveItem() == this;
			} catch (e) {
				// if fails, the panel is not in a TabPanel, so don't defer the call
			}

			return out;
		},

		formIsVisisble: function() {
			return this.form.isVisible(deep = true);
		},

		// CMWidgetManagerDelegate

		getFormForTemplateResolver: function() {
			return this.form.getForm();
		},

		showCardPanel: Ext.emptyFn,

		getWidgetButtonsPanel: function() {
			return this.widgets;
		}
	});

})();

(function () {

	Ext.define('CMDBuild.view.management.widget.createModifyCard.CMCreateModifyCard', {
		extend: 'Ext.panel.Panel',

		mixins: {
			widgetManagerDelegate: 'CMDBuild.view.management.common.widgets.CMWidgetManagerDelegate'
		},

		/**
		 * @proeprty {CMDBuild.core.buttons.iconized.split.add.Card}
		 */
		addCardButton: undefined,

		/**
		 * @proeprty {CMDBuild.view.management.classes.CMCardForm}
		 */
		form: undefined,

		/**
		 * @proeprty {CMDBuild.view.management.common.widget.CMWidgetButtonsPanel}
		 */
		widgets: undefined,

		border: false,
		cls: 'cmdb-blue-panel',
		frame: false,
		layout: 'border',
		padding: '0 0 5px 0',
		withButtons: false,
		withToolBar: false,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				dockedItems: [
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'top',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP,

						items: [
							this.addCardButton = Ext.create('CMDBuild.core.buttons.iconized.split.add.Card', { classId: undefined })
						]
					})
				],
				items: [
					this.form = new CMDBuild.view.management.classes.CMCardForm({
						region: 'center',
						cmOwner: this,
						withToolBar: this.withToolBar,
						withButtons: this.withButtons
					}),
					this.widgets = new CMDBuild.view.management.common.widget.CMWidgetButtonsPanel({
						region: 'east',
						hideMode: 'offsets',
						cls: 'cmdb-border-left',
						autoScroll: true,
						frame: true,
						border: false,
						items: []
					})
				]
			});

			_CMUtils.forwardMethods(this, this.form, [
				'loadCard',
				'getValues',
				'reset',
				'getInvalidAttributeAsHTML',
				'fillForm',
				'getForm',
				'hasDomainAttributes',
				'ensureEditPanel',
				'isInEditing'
			]);

			_CMUtils.forwardMethods(this, this.widgets, ['removeAllButtons', 'addWidget']);
			this.widgets.hide();

			this.callParent(arguments);

			this.CMEVENTS = Ext.apply(this.form.CMEVENTS, this.widgets.CMEVENTS);
			this.relayEvents(this.widgets, [this.widgets.CMEVENTS.widgetButtonClick]);

			var ee = this.form.CMEVENTS;
			this.relayEvents(this.form, [
				ee.saveCardButtonClick,
				ee.abortButtonClick,
				ee.removeCardButtonClick,
				ee.modifyCardButtonClick,
				ee.cloneCardButtonClick,
				ee.printCardButtonClick,
				ee.openGraphButtonClick,
				ee.editModeDidAcitvate,
				ee.displayModeDidActivate
			]);

			this.mon(this, 'activate', function () {
				this.form.fireEvent('activate');
			}, this);
		},

		displayMode: function (enableCMTbar) {
			this.form.displayMode(enableCMTbar);
			this.widgets.displayMode();
		},

		displayModeForNotEditableCard: function () {
			this.form.displayModeForNotEditableCard();
			this.widgets.displayMode();
		},

		editMode: function () {
			this.form.editMode();
			this.widgets.editMode();
		},

		isTheActivePanel: function () {
			var out = true;
			try {
				out = this.ownerCt.layout.getActiveItem() == this;
			} catch (e) {
				// if fails, the panel is not in a TabPanel, so don't defer the call
			}

			return out;
		},

		formIsVisisble: function () {
			return this.form.isVisible(deep = true);
		},

		// CMWidgetManagerDelegate

		getFormForTemplateResolver: function () {
			return this.form.getForm();
		},

		showCardPanel: Ext.emptyFn,

		getWidgetButtonsPanel: function () {
			return this.widgets;
		},

		/**
		 * Buttons that the owner panel add to itself
		 *
		 * @returns {Array}
		 */
		getExtraButtons: function () {
			return [
				Ext.create('CMDBuild.core.buttons.text.Save', {
					name: 'saveButton',
					scope: this,

					handler: function (button, e) {
						this.delegate.cmfg('onWidgetCreateModifyCardSaveButtonClick');
					}
				})
			];
		}
	});

})();

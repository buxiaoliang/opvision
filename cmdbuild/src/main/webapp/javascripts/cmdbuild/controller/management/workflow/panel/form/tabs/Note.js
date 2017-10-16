(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.form.tabs.Note', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.constants.WidgetType',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.management.workflow.panel.form.tabs.Note'
		],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onWorkflowFormTabNoteAbortActivityButtonClick',
			'onWorkflowFormTabNoteAbortButtonClick',
			'onWorkflowFormTabNoteActivitySelect',
			'onWorkflowFormTabNoteAddButtonClick',
			'onWorkflowFormTabNoteInstanceSelect',
			'onWorkflowFormTabNoteModifyButtonClick',
			'onWorkflowFormTabNoteSaveButtonClick',
			'onWorkflowFormTabNoteShow',
			'workflowFormTabNoteReset',
			'workflowFormTabNoteToolbarBottomBuild',
			'workflowFormTabNoteToolbarTopBuild'
		],

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.tabs.note.NoteView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.workflow.panel.form.Form} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.form.tabs.note.NoteView', { delegate: this });

			this.cmfg('workflowFormTabNoteToolbarBottomBuild');
			this.cmfg('workflowFormTabNoteToolbarTopBuild');
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		itemLock: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			if (
				CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK)
				&& !this.cmfg('workflowSelectedInstanceIsEmpty')
			) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_ID] = this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.PROCESS_INSTANCE_ID] = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.management.workflow.panel.form.tabs.Note.lock({
					params: params,
					scope: parameters.scope,
					success: parameters.callback
				});
			} else {
				Ext.callback(parameters.callback, parameters.scope);
			}
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		itemUnlock: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			if (
				CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK)
				&& !this.cmfg('workflowSelectedInstanceIsEmpty')
			) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_ID] = this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.PROCESS_INSTANCE_ID] = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.management.workflow.panel.form.tabs.Note.unlock({
					params: params,
					scope: parameters.scope,
					success: parameters.callback
				});
			} else {
				Ext.callback(parameters.callback, parameters.scope);
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		navigationChronologyRecordSave: function () {
			if (!this.cmfg('workflowSelectedWorkflowIsEmpty') && !this.cmfg('workflowSelectedInstanceIsEmpty'))
				CMDBuild.global.navigation.Chronology.cmfg('navigationChronologyRecordSave', {
					moduleId: 'workflow',
					entryType: {
						description: this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
						id: this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.ID),
						object: this.cmfg('workflowSelectedWorkflowGet')
					},
					item: {
						description: null, // Instances hasn't description property so display ID and no description
						id: this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID),
						object: this.cmfg('workflowSelectedInstanceGet')
					},
					section: {
						description: this.view.title,
						object: this.view
					}
				});
		},

		/**
		 * Disable tab on instance creation abort button click
		 *
		 * @returns {Void}
		 */
		onWorkflowFormTabNoteAbortActivityButtonClick: function () {
			this.view.disable();
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowFormTabNoteAbortButtonClick: function () {
			if (!this.cmfg('workflowSelectedActivityIsEmpty') && !this.cmfg('workflowIsStartActivityGet')) {
				this.cmfg('onWorkflowFormTabNoteShow');
			} else {
				this.itemUnlock({
					scope: this,
					callback: function () {
						this.viewModeSet('read');

						this.view.reset();
						this.view.setDisabledModify(true, true, !this.cmfg('workflowFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenNote()));
					}
				});
			}
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowFormTabNoteActivitySelect: function () {
			this.view.enable();
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowFormTabNoteAddButtonClick: function () {
			this.view.setDisabled(!this.cmfg('workflowFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenNote()));
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowFormTabNoteInstanceSelect: function () {
			this.view.enable();
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowFormTabNoteModifyButtonClick: function () {
			// Error handling
				if (!this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.WRITABLE)) // Verify workflow privileges
					return _warning('onWorkflowFormTabNoteModifyButtonClick(): no write privileges on activity', this, this.cmfg('workflowSelectedActivityGet'));

				if (!this.cmfg('workflowFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenNote()))
					return _error('onWorkflowFormTabNoteModifyButtonClick(): widget not configured (permission denied)', this);
			// END: Error handling

			this.itemLock({
				scope: this,
				callback: function () {
					this.viewModeSet('edit');

					this.view.setDisabledModify(false);
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowFormTabNoteSaveButtonClick: function () {
			// Error handling
				if (this.cmfg('workflowIsStartActivityGet'))
					return CMDBuild.core.Message.warning(null, CMDBuild.Translation.warnings.canNotModifyNotesBeforeSavingTheActivity, false);
			// END: Error handling

			if (this.validate(this.view)) {
				var notesValue = this.view.htmlField.getValue();

				var params = {};
				params['ww'] = '{}';
				params[CMDBuild.core.constants.Proxy.ACTIVITY_INSTANCE_ID] = this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.ADVANCE] = false;
				params[CMDBuild.core.constants.Proxy.ATTRIBUTES] = Ext.encode({ Notes: notesValue });
				params[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.CLASS_ID] = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.CLASS_ID);

				CMDBuild.proxy.management.workflow.panel.form.tabs.Note.update({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						var recordStructure = {};
						recordStructure[CMDBuild.core.constants.Proxy.ACTIVITY_ID] = this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.ID);
						recordStructure[CMDBuild.core.constants.Proxy.CARD_ID] = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.ID);
						recordStructure[CMDBuild.core.constants.Proxy.CLASS_ID] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.ID);
						recordStructure[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);

						var record = Ext.create('CMDBuild.model.management.workflow.Node', recordStructure); // Fake node as parameter to read instance

						this.cmfg('onWorkflowInstanceSelect', {
							record: record,
							scope: this,
							callback: function () {
								this.cmfg('onWorkflowActivitySelect', {
									record: record,
									scope: this,
									callback: function () {
										this.cmfg('onWorkflowFormTabNoteShow');
									}
								});
							}
						});
					}
				});
			}
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowFormTabNoteShow: function () {
			this.view.reset();

			this.itemUnlock({
				scope: this,
				callback: function () {
					if (!this.cmfg('workflowFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenNote()))
						this.cmfg('workflowFormTabNoteToolbarBottomBuild');

					if (this.cmfg('workflowIsStartActivityGet')) {
						this.viewModeSet('edit');

						this.navigationChronologyRecordSave();

						return this.view.setDisabledModify(false);
					}

					if (!this.cmfg('workflowSelectedActivityIsEmpty')) {
						var notes = this.cmfg('workflowSelectedInstanceGet', [CMDBuild.core.constants.Proxy.VALUES, 'Notes']);

						this.view.htmlField.setValue(notes);
						this.view.displayField.setValue(notes);

						this.viewModeSet('read');

						this.navigationChronologyRecordSave();

						return this.view.setDisabledModify(
							true,
							true,
							(
								!this.cmfg('workflowFormWidgetExists', CMDBuild.core.constants.WidgetType.getOpenNote()) // Verify widget presence
								|| !this.cmfg('workflowSelectedActivityGet', CMDBuild.core.constants.Proxy.WRITABLE) // Verify workflow privileges
							)
						);
					}

					// By default disable tab
					this.cmfg('workflowFormPanelTabSelectionManage');

					this.view.disable();
				}
			});
		},

		/**
		 * @param {String} mode
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		viewModeSet: function (mode) {
			switch (mode) {
				case 'edit':
					return this.view.getLayout().setActiveItem(this.view.panelModeEdit);

				case 'read':
				default:
					return this.view.getLayout().setActiveItem(this.view.panelModeRead);
			}
		},

		/**
		 * @returns {Void}
		 */
		workflowFormTabNoteReset: function () {
			this.view.reset();
			this.view.disable();
		},

		/**
		 * Adds to toolbar items param otherwise adds a disabled save and abort placeholder buttons
		 *
		 * @param {Array} items
		 *
		 * @returns {Void}
		 */
		workflowFormTabNoteToolbarBottomBuild: function (items) {
			items = Ext.isArray(items) ? items : [];

			var componentToolbar = this.view.getDockedComponent(CMDBuild.core.constants.Proxy.TOOLBAR_BOTTOM);

			componentToolbar.removeAll();
			componentToolbar.add(
				!Ext.isEmpty(items) ? items : [
					Ext.create('CMDBuild.core.buttons.text.Save', {
						disablePanelFunctions: true,
						disabled: true
					}),
					Ext.create('CMDBuild.core.buttons.text.Abort', {
						disablePanelFunctions: true,
						disabled: true
					})
				]
			);
		},

		/**
		 * Adds to toolbar items param otherwise adds a disabled modify placeholder button
		 *
		 * @param {Array} items
		 *
		 * @returns {Void}
		 */
		workflowFormTabNoteToolbarTopBuild: function (items) {
			items = Ext.isArray(items) ? items : [];

			var componentToolbar = this.view.getDockedComponent(CMDBuild.core.constants.Proxy.TOOLBAR_TOP);

			componentToolbar.removeAll();
			componentToolbar.add(
				!Ext.isEmpty(items) ? items : Ext.create('CMDBuild.core.buttons.iconized.Modify', {
					text: CMDBuild.Translation.modifyNote,
					disablePanelFunctions: true,
					disabled: true
				})
			);
		}
	});

})();

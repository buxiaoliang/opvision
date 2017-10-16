(function () {

	Ext.define('CMDBuild.view.administration.taskManager.task.email.Step1', {
		extend: 'Ext.panel.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.taskManager.task.Email'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.task.email.Step1}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.form.field.Checkbox}
		 */
		activeField: undefined,

		/**
		 * @property {Ext.form.field.Text}
		 */
		descriptionField: undefined,

		/**
		 * @property {Ext.form.field.ComboBox}
		 */
		emailAccountCombo: undefined,

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.common.emailFilterForm.EmailFilterFormView}
		 */
		fromAddresFilter: undefined,

		/**
		 * @property {Ext.form.field.Hidden}
		 */
		idField: undefined,

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.common.emailFilterForm.EmailFilterFormView}
		 */
		subjectFilter: undefined,

		/**
		 * @property {Ext.form.field.Text}
		 */
		typeField: undefined,

		border: false,
		frame: true,
		overflowY: 'auto',

		layout: {
			type: 'vbox',
			align: 'stretch'
		},

		defaults: {
			maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG,
			anchor: '100%'
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			// Filter configuration
				this.fromAddresFilter = Ext.create('CMDBuild.view.administration.taskManager.task.common.emailFilterForm.EmailFilterFormView', {
					maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG - 5,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL - 5,

					fieldContainer: {
						fieldLabel: CMDBuild.Translation.sender
					},
					textarea: {
						name: CMDBuild.core.constants.Proxy.FILTER_FROM_ADDRESS,
						id: 'FromAddresFilterField'
					},
					button: {
						titleWindow: CMDBuild.Translation.sender
					}
				});
				this.subjectFilter = Ext.create('CMDBuild.view.administration.taskManager.task.common.emailFilterForm.EmailFilterFormView', {
					maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG - 5,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL - 5,

					fieldContainer: {
						fieldLabel: CMDBuild.Translation.subject
					},
					textarea: {
						name: CMDBuild.core.constants.Proxy.FILTER_SUBJECT,
						id: 'SubjectFilterField'
					},
					button: {
						titleWindow: CMDBuild.Translation.subject
					}
				});
				this.filterFunctionCombobox = Ext.create('Ext.form.field.ComboBox', {
					name: CMDBuild.core.constants.Proxy.FILTER_FUNCTION,
					fieldLabel: CMDBuild.Translation.functionLabel,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL - 5,
					maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG - 5,
					valueField: 'name',
					displayField: 'name',
					editable: false,
					allowBlank: false,

					store: _CMCache.getAvailableDataSourcesStore(),
					queryMode: 'local'
				});
			// END: Filter configuration

			// Rejected configuration
				this.rejectedFolder = Ext.create('Ext.form.field.Text', {
					name: CMDBuild.core.constants.Proxy.REJECTED_FOLDER,
					fieldLabel: CMDBuild.Translation.rejectedFolder,
					labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
					maxWidth: CMDBuild.core.constants.FieldWidths.CONFIGURATION_BIG - 10, // FIX: field with inside FieldSet is narrow
					anchor: '100%'
				});

				this.rejectedFieldset = Ext.create('Ext.form.FieldSet', {
					checkboxName: CMDBuild.core.constants.Proxy.REJECT_NOT_MATCHING,
					title: CMDBuild.Translation.enableMoveRejectedNotMatching,
					checkboxToggle: true,
					collapsed: true,
					collapsible: true,
					toggleOnTitleClick: true,
					overflowY: 'auto',
					maxWidth: 'auto',

					layout: {
						type: 'vbox',
						align: 'stretch'
					},

					items: [this.rejectedFolder]
				});

				this.rejectedFieldset.fieldWidthsFix();
			// END: Rejected configuration

			Ext.apply(this, {
				items: [
					this.typeField = Ext.create('Ext.form.field.Text', {
						fieldLabel: CMDBuild.Translation.type,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						name: CMDBuild.core.constants.Proxy.TYPE,
						value: CMDBuild.Translation.email,
						disabled: true,
						cmImmutable: true,
						readOnly: true,
						submitValue: false
					}),
					this.descriptionField = Ext.create('Ext.form.field.Text', {
						name: CMDBuild.core.constants.Proxy.DESCRIPTION,
						fieldLabel: CMDBuild.Translation.descriptionLabel,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						allowBlank: false
					}),
					this.activeField = Ext.create('Ext.form.field.Checkbox', {
						name: CMDBuild.core.constants.Proxy.ACTIVE,
						fieldLabel: CMDBuild.Translation.startOnSave,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL
					}),
					this.emailAccountCombo = Ext.create('Ext.form.field.ComboBox', {
						name: CMDBuild.core.constants.Proxy.EMAIL_ACCOUNT,
						fieldLabel: CMDBuild.Translation.emailAccount,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						displayField: CMDBuild.core.constants.Proxy.NAME,
						valueField: CMDBuild.core.constants.Proxy.NAME,
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
						forceSelection: true,
						editable: false,

						store: CMDBuild.proxy.administration.taskManager.task.Email.getStoreAccount(),
						queryMode: 'local'
					}),
					this.incomingFolder = Ext.create('Ext.form.field.Text', {
						name: CMDBuild.core.constants.Proxy.INCOMING_FOLDER,
						fieldLabel: CMDBuild.Translation.incomingFolder,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL
					}),
					this.filterDefinitionFieldset = Ext.create('Ext.form.FieldSet', {
						title: CMDBuild.Translation.filter,
						maxWidth: 'auto',
						overflowY: 'auto',
						padding: '0 5 5 5',

						layout: {
							type: 'vbox',
							align: 'stretch'
						},

						items: [
							this.filterTypeCombobox = Ext.create('Ext.form.field.ComboBox', {
								name: CMDBuild.core.constants.Proxy.FILTER_TYPE,
								fieldLabel: CMDBuild.Translation.type,
								labelWidth: CMDBuild.core.constants.FieldWidths.LABEL - 5,
								displayField: CMDBuild.core.constants.Proxy.DESCRIPTION,
								valueField: CMDBuild.core.constants.Proxy.VALUE,
								maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG - 5,
								value: CMDBuild.core.constants.Proxy.NONE, // Default value
								forceSelection: true,
								editable: false,

								store: Ext.create('Ext.data.ArrayStore', { // TODO: move to proxy
									fields: [CMDBuild.core.constants.Proxy.DESCRIPTION, CMDBuild.core.constants.Proxy.VALUE],
									data: [
										[CMDBuild.Translation.none, CMDBuild.core.constants.Proxy.NONE],
										[CMDBuild.Translation.regex, CMDBuild.core.constants.Proxy.REGEX],
										[CMDBuild.Translation.functionLabel, CMDBuild.core.constants.Proxy.FUNCTION]
									]
								}),
								queryMode: 'local',

								listeners: {
									scope: this,
									change: function (field, newValue, oldValue, eOpts) {
										this.delegate.cmfg('onFilterTypeComboChange');
									}
								}
							}),
							this.filterDefinitionContainer = Ext.create('Ext.container.Container', {
								layout: {
									type: 'vbox',
									align: 'stretch'
								},

								items: []
							})
						]
					}),
					this.processedFolder = Ext.create('Ext.form.field.Text', {
						name: CMDBuild.core.constants.Proxy.PROCESSED_FOLDER,
						fieldLabel: CMDBuild.Translation.processedFolder,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL
					}),
					this.rejectedFieldset,
					this.idField = Ext.create('Ext.form.field.Hidden', {
						name: CMDBuild.core.constants.Proxy.ID
					})
				]
			});

			this.callParent(arguments);
		}
	});

})();

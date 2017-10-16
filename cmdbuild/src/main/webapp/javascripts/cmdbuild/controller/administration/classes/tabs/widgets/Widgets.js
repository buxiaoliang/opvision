(function () {

	Ext.define('CMDBuild.controller.administration.classes.tabs.widgets.Widgets', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.classes.tabs.widgets.Widgets'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.classes.Classes}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'classesTabWidgetsTypeRenderer',
			'onClassesTabWidgetsAbortButtonClick',
			'onClassesTabWidgetsAddButtonClick',
			'onClassesTabWidgetsAddClassButtonClick',
			'onClassesTabWidgetsClassSelected',
			'onClassesTabWidgetsItemDrop',
			'onClassesTabWidgetsModifyButtonClick = onClassesTabWidgetsItemDoubleClick',
			'onClassesTabWidgetsRemoveButtonClick',
			'onClassesTabWidgetsRowSelected',
			'onClassesTabWidgetsSaveButtonClick',
			'onClassesTabWidgetsShow',
			'validate = classesTabWidgetsValidateForm'
		],

		/**
		 * @property {Object}
		 */
		controllerWidgetForm: undefined,

		/**
		 * @property {Mixed}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.widgets.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {Mixed}
		 *
		 * @private
		 */
		selectedWidget: undefined,

		/**
		 * @cfg {CMDBuild.view.administration.classes.tabs.widgets.WidgetsView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.classes.Classes} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.classes.tabs.widgets.WidgetsView', { delegate: this });

			// Shorthands
			this.form = this.view.form;
			this.grid = this.view.grid;
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		buildForm: function () {
			if (!Ext.isEmpty(this.form))
				this.view.remove(this.form);

			if (!Ext.isEmpty(this.controllerWidgetForm)) {
				// Shorthands
				this.form = this.controllerWidgetForm.getView();
				this.view.form = this.form;

				this.view.add(this.form);
			}
		},

		/**
		 * @param {String} type
		 *
		 * @returns {Object}
		 *
		 * @private
		 */
		buildFormController: function (type) {
			switch (type) {
				case '.Calendar':
					return Ext.create('CMDBuild.controller.administration.classes.tabs.widgets.form.Calendar', { parentDelegate: this });

				case '.CreateModifyCard':
					return Ext.create('CMDBuild.controller.administration.classes.tabs.widgets.form.CreateModifyCard', { parentDelegate: this });

				case '.OpenReport':
					return Ext.create('CMDBuild.controller.administration.classes.tabs.widgets.form.OpenReport', { parentDelegate: this });

				case '.Ping':
					return Ext.create('CMDBuild.controller.administration.classes.tabs.widgets.form.Ping', { parentDelegate: this });

				case '.Workflow':
					return Ext.create('CMDBuild.controller.administration.classes.tabs.widgets.form.Workflow', { parentDelegate: this });

				default:
					return Ext.create('CMDBuild.controller.administration.classes.tabs.widgets.form.Empty', { parentDelegate: this });
			}
		},

		/**
		 * Act as renderer for text field
		 *
		 * @param {String} value
		 *
		 * @returns {String}
		 */
		classesTabWidgetsTypeRenderer: function (value) {
			switch (value) {
				case '.Calendar':
					return CMDBuild.Translation.calendar;

				case '.CreateModifyCard':
					return CMDBuild.Translation.createModifyCard;

				case '.OpenReport':
					return CMDBuild.Translation.createReport;

				case '.Ping':
					return CMDBuild.Translation.ping;

				case '.Workflow':
					return CMDBuild.Translation.startWorkflow;

				default:
					return value;
			}
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabWidgetsAbortButtonClick: function () {
			if (!this.cmfg('classesSelectedClassIsEmpty')) {
				this.cmfg('onClassesTabWidgetsShow');
			} else {
				this.form.reset();
				this.form.setDisabledModify(true, true, true);
			}
		},

		/**
		 * @param {String} type
		 *
		 * @returns {Void}
		 */
		onClassesTabWidgetsAddButtonClick: function (type) {
			if (Ext.isString(type) && !Ext.isEmpty(type)) {
				this.grid.getSelectionModel().deselectAll();

				this.classesTabWidgetsSelectedWidgetReset();

				this.controllerWidgetForm = this.buildFormController(type);
				this.buildForm();

				if (!Ext.isEmpty(this.controllerWidgetForm) && Ext.isFunction(this.controllerWidgetForm.cmfg))
					this.controllerWidgetForm.cmfg('classesTabWidgetsWidgetAdd');
			}
		},

		/**
		 * Invoked from parentDelegate
		 *
		 * @returns {Void}
		 */
		onClassesTabWidgetsAddClassButtonClick: function () {
			this.view.disable();
		},

		/**
		 * Enable/Disable tab on class selection
		 * BUSINESS RULE: currently the widgets are not inherited so, deny the definition on superClasses
		 *
		 * @param {Number} classId
		 *
		 * @returns {Void}
		 */
		onClassesTabWidgetsClassSelected: function () {
			this.view.setDisabled(
				this.cmfg('classesSelectedClassIsEmpty')
				|| this.cmfg('classesSelectedClassGet', CMDBuild.core.constants.Proxy.IS_SUPER_CLASS)
			);
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabWidgetsItemDrop: function () {
			if (Ext.isArray(this.grid.getStore().getRange()) && !Ext.isEmpty(this.grid.getStore().getRange())) {
				var params = {};
				params['sortedArray'] = [];

				Ext.Array.each(this.grid.getStore().getRange(), function (widgetRowModel, i, allWidgetRowModels) {
					if (!Ext.isEmpty(widgetRowModel))
						params['sortedArray'].push(widgetRowModel.get(CMDBuild.core.constants.Proxy.ID));
				}, this);

				CMDBuild.proxy.administration.classes.tabs.widgets.Widgets.setSorting({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						this.cmfg('onClassesTabWidgetsShow');
					}
				});
			}
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabWidgetsModifyButtonClick: function () {
			if (!Ext.isEmpty(this.form))
				this.form.setDisabledModify(false);
		},

		/**
		 * Loads store passing selected class name and selects first or with idToSelect id value card
		 *
		 * @param {Number} idToSelect
		 *
		 * @returns {Void}
		 */
		onClassesTabWidgetsShow: function (idToSelect) {
			idToSelect = Ext.isString(idToSelect) ? parseInt(idToSelect) : null;
			idToSelect = Ext.isNumber(idToSelect) ? idToSelect : 0;

			var params = {};
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('classesSelectedClassGet', CMDBuild.core.constants.Proxy.NAME);

			this.grid.getStore().load({
				params: params,
				scope: this,
				callback: function (records, operation, success) {
					var selectedRecordIndex = this.grid.getStore().find(CMDBuild.core.constants.Proxy.ID, idToSelect);

					this.grid.getSelectionModel().select(
						selectedRecordIndex > 0 ? selectedRecordIndex : 0,
						true
					);

					this.cmfg('onClassesTabWidgetsRowSelected');
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabWidgetsRemoveButtonClick: function () {
			Ext.Msg.show({
				title: CMDBuild.Translation.common.confirmpopup.title,
				msg: CMDBuild.Translation.common.confirmpopup.areyousure,
				buttons: Ext.Msg.YESNO,
				scope: this,

				fn: function (buttonId, text, opt) {
					if (buttonId == 'yes')
						this.removeItem();
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabWidgetsRowSelected: function () {
			if (this.grid.getSelectionModel().hasSelection()) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('classesSelectedClassGet', CMDBuild.core.constants.Proxy.NAME);
				params[CMDBuild.core.constants.Proxy.ID] = this.grid.getSelectionModel().getSelection()[0].get(CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.administration.classes.tabs.widgets.Widgets.read({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE] || [];

						this.controllerWidgetForm = this.buildFormController(decodedResponse[CMDBuild.core.constants.Proxy.TYPE]);

						this.classesTabWidgetsSelectedWidgetSet({ value: decodedResponse });

						if (!this.classesTabWidgetsSelectedWidgetIsEmpty()) {
							this.buildForm();

							if (!Ext.isEmpty(this.controllerWidgetForm))
								this.controllerWidgetForm.cmfg('classesTabWidgetsWidgetLoadRecord', this.classesTabWidgetsSelectedWidgetGet());

							this.form.setDisabledModify(true, true);
						}
					}
				});
			} else {
				this.controllerWidgetForm = this.buildFormController();

				this.buildForm();

				this.form.setDisabledModify(true, true, true);
			}
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabWidgetsSaveButtonClick: function () {
			if (this.controllerWidgetForm.cmfg('classesTabWidgetsValidateForm', this.form)) {
				var widgetDefinition = this.controllerWidgetForm.cmfg('classesTabWidgetsWidgetDefinitionGet');

				var params = {};
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('classesSelectedClassGet', CMDBuild.core.constants.Proxy.NAME);
				params[CMDBuild.core.constants.Proxy.WIDGET] = Ext.encode(widgetDefinition);

				if (Ext.isEmpty(widgetDefinition[CMDBuild.core.constants.Proxy.ID])) {
					CMDBuild.proxy.administration.classes.tabs.widgets.Widgets.create({
						params: params,
						scope: this,
						success: function (response, options, decodedResponse) {
							decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

							this.cmfg('onClassesTabWidgetsShow', decodedResponse[CMDBuild.core.constants.Proxy.ID]);
						}
					});
				} else {
					CMDBuild.proxy.administration.classes.tabs.widgets.Widgets.update({
						params: params,
						scope: this,
						success: function (response, options, decodedResponse) {
							this.cmfg('onClassesTabWidgetsShow', this.form.idField.getValue());
						}
					});
				}
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		removeItem: function () {
			if (!this.classesTabWidgetsSelectedWidgetIsEmpty()) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('classesSelectedClassGet', CMDBuild.core.constants.Proxy.NAME);
				params[CMDBuild.core.constants.Proxy.ID] = this.classesTabWidgetsSelectedWidgetGet(CMDBuild.core.constants.Proxy.ID);

				CMDBuild.proxy.administration.classes.tabs.widgets.Widgets.remove({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						this.form.reset();

						this.cmfg('onClassesTabWidgetsShow');
					}
				});
			}
		},

		// SelectedWidget property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 *
			 * @private
			 */
			classesTabWidgetsSelectedWidgetGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedWidget';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 *
			 * @private
			 */
			classesTabWidgetsSelectedWidgetIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedWidget';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			classesTabWidgetsSelectedWidgetReset: function () {
				this.propertyManageReset('selectedWidget');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			classesTabWidgetsSelectedWidgetSet: function (parameters) {
				if (
					Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)
					&& !Ext.isEmpty(this.controllerWidgetForm) && Ext.isFunction(this.controllerWidgetForm.cmfg)
				) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = this.controllerWidgetForm.cmfg('classesTabWidgetsWidgetDefinitionModelNameGet');
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedWidget';

					this.propertyManageSet(parameters);
				}
			}
	});

})();

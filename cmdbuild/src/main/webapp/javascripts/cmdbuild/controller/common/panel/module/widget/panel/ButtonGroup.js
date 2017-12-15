(function () {

	/**
	 * Required managed functions from upper structure:
	 * 	- panelGridAndFormSelectedItemWidgetsGet
	 * 	- panelGridAndFormSelectedItemWidgetsIsEmpty
	 * 	- panelGridAndFormTabPanelGet
	 * 	- panelGridAndFormViewModeGet
	 */
	Ext.define('CMDBuild.controller.common.panel.module.widget.panel.ButtonGroup', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'panelModuleWidgetButtonGroupAdd',
			'panelModuleWidgetButtonGroupReset',
			'panelModuleWidgetButtonGroupSave',
			'panelModuleWidgetButtonGroupUiUpdate',
			'panelModuleWidgetButtonGroupValuesGet'
		],

		/**
		 * Definitions of all sub controller classes names
		 *
		 * @cfg {Object}
		 */
		subClassesNames: {
			view: 'CMDBuild.view.common.panel.module.widget.panel.ButtonGroupView'
		},

		/**
		 * @property {CMDBuild.view.common.panel.module.widget.panel.ButtonGroupView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {Object} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create(this.subClassesNames.view, { delegate: this });
			/**
			 * Build sub-components
			 *
			 * @legacy
			 */
			this.controllerWidgetManager = Ext.create('CMDBuild.controller.management.common.CMWidgetManagerController',
				new CMDBuild.view.management.common.widgets.CMWidgetManager(
					this.parentDelegate.getView(),
					this.cmfg('panelGridAndFormTabPanelGet')
				)
			);

			this.controllerWidgetManager.setDelegate(this);
		},

		/**
		 * @param {Object} definition
		 *
		 * @returns {Void}
		 *
		 * FIXME: waiting for refactor (use models in CMWidgetManagerController)
		 */
		panelModuleWidgetButtonGroupAdd: function (definition) {
			this.view.add(
				Ext.create('CMDBuild.core.buttons.text.Widget', {
					disabled: !definition['alwaysenabled'],
					text: definition.label,
					widgetDefinition: Ext.clone(definition),
					scope: this,

					handler: function (button, e) {
						this.controllerWidgetManager.onWidgetButtonClick(button.widgetDefinition);
					}
				})
			);
			
			var me = this;
			setTimeout(function(){
				me.setupVisibleState();
			}, 0)
		},

		/**
		 * @returns {Void}
		 */
		panelModuleWidgetButtonGroupReset: function () {
			this.controllerWidgetManager.removeAll();

			CMDBuild.clearComponent(this.view);

			this.setupVisibleState();
		},

		/**
		 * @returns {Void}
		 */
		panelModuleWidgetButtonGroupUiUpdate: function () {
			// UI reset
			this.cmfg('panelModuleWidgetButtonGroupReset');

			// Forward to sub-controllers
			if (!this.cmfg('panelGridAndFormSelectedItemWidgetsIsEmpty'))
				this.controllerWidgetManager.buildControllers(this.cmfg('panelGridAndFormSelectedItemWidgetsGet'));

			switch (this.cmfg('panelGridAndFormViewModeGet')) {
				case 'add':
				case 'edit': {
					this.onCardGoesInEdit();

					this.view.items.each(function (button, i, len) {
						button.enable();
					});
				} break;

				case 'read':
				case 'readOnly':
				default: {
					this.view.items.each(function (button, i, len) {
						button.disable();
					});
				}
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		setupVisibleState: function () {
			this.view.setVisible(
				this.view.items.getCount() > 0
			);
		},

		/**
		 * Forwarder methods
		 *
		 * FIXME: waiting for refactor (CMWidgetManagerController, CMWidgetManager)
		 */
			/**
			 * @param {Object} definition
			 *
			 * @returns {Void}
			 *
			 * @public
			 */
			addWidget: function (definition) {
				this.cmfg('panelModuleWidgetButtonGroupAdd', definition);
			},

			/**
			 * Legacy method to create related edit panel to correctly work with old form structure, no more necessary
			 *
			 * @returns {Void}
			 *
			 * @public
			 */
			ensureEditPanel: Ext.emptyFn,

			/**
			 * @returns {Void}
			 *
			 * @public
			 */
			onCardGoesInEdit: function () {
				this.controllerWidgetManager.onCardGoesInEdit();
			},

			/**
			 * @param {Object} parameters
			 * @param {Function} parameters.callback
			 * @param {Object} parameters.scope
			 *
			 * @returns {Void}
			 */
			panelModuleWidgetButtonGroupSave: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};
				parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : Ext.emptyFn;
				parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

				this.controllerWidgetManager.waitForBusyWidgets(parameters.callback, parameters.scope);
			},

			/**
			 * @param {Boolean} isAdvance
			 *
			 * @returns {Object}
			 *
			 * @legacy
			 */
			panelModuleWidgetButtonGroupValuesGet: function (isAdvance) {
				isAdvance = Ext.isBoolean(isAdvance) ? isAdvance : false;

				return this.controllerWidgetManager.getData(isAdvance);
			},

			/**
			 * @returns {Void}
			 *
			 * @public
			 */
			removeAllButtons: function () {
			    CMDBuild.clearComponent(this.view);
			}
	});

})();

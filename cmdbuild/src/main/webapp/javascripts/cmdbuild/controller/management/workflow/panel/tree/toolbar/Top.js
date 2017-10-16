(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.tree.toolbar.Top', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.constants.WorkflowStates',
			'CMDBuild.core.Utils'
		],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.tree.Tree}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onWorkflowTreeToolbarTopStateComboChange',
			'onWorkflowTreeToolbarTopWokflowSelect',
			'workflowTreeToolbarTopStatusValueGet',
			'workflowTreeToolbarTopStatusValueSet'
		],

		/**
		 * @cfg {Boolean}
		 *
		 * @private
		 */
		disableNextStatusSelectionChangeEvent: false,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.tree.toolbar.TopView}
		 */
		view: undefined,

		/**
		 * @property {Object}
		 *
		 * @private
		 */
		workflowRelationshipTree: {},

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.workflow.Workflow} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.tree.toolbar.TopView', { delegate: this });
		},

		/**
		 * @param {Array} type
		 *
		 * @returns {CMDBuild.core.buttons.iconized.split.add.Workflow or CMDBuild.core.buttons.iconized.add.Workflow}
		 *
		 * @private
		 */
		buildButtonAdd: function () {
			// Error handling
				if (this.cmfg('workflowSelectedWorkflowIsEmpty'))
					return _error('buildButtonAdd(): empty selected workflow', this, this.cmfg('workflowSelectedWorkflowGet'));
			// END: Error handling

			if (this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.IS_SUPER_CLASS)) {
				var menuItems = [],
					selectedWorkflowDescendants = this.workflowToolbarTopWorkflowRelationshipTreeGet(
						this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.ID),
						CMDBuild.core.constants.Proxy.CHILDREN
					);

				this.buildMenuChildren(selectedWorkflowDescendants, menuItems);

				return Ext.create('CMDBuild.core.buttons.iconized.split.add.Workflow', {
					text: CMDBuild.Translation.start + ' ' + this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
					itemId: 'addButton',
					disabled: this.isAddButtonDisabled(menuItems),
					scope: this,

					menu: Ext.create('Ext.menu.Menu', {
						items: menuItems
					}),

					/**
					 * @returns {Boolean}
					 *
					 * @override
					 */
					isEnableActionEnabled: this.isEnableActionEnabled
				});
			} else {
				return Ext.create('CMDBuild.core.buttons.iconized.add.Workflow', {
					text: CMDBuild.Translation.start + ' ' + this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.DESCRIPTION),
					itemId: 'addButton',
					disabled: this.isAddButtonDisabled(),
					scope: this,

					handler: function (button, e) {
						this.cmfg('onWorkflowAddButtonClick');
					},

					/**
					 * @returns {Boolean}
					 *
					 * @override
					 */
					isEnableActionEnabled: this.isEnableActionEnabled
				});
			}
		},

		/**
		 * @param {Array} childrenArray
		 * @param {Object} parent
		 *
		 * @returns {void}
		 *
		 * @private
		 */
		buildMenuChildren: function (childrenArray, parent) {
			if (Ext.isArray(childrenArray) && !Ext.isEmpty(childrenArray))
				Ext.Array.forEach(childrenArray, function (childrenObject, i, allChildrenObjects) {
					if (Ext.isObject(childrenObject) && !Ext.Object.isEmpty(childrenObject))
						this.buildMenuItem(childrenObject, parent);
				}, this);
		},

		/**
		 * @param {CMDBuild.model.management.workflow.panel.tree.toolbar.top.Parent} workflowObject
		 * @param {Object} parent
		 *
		 * @returns {void}
		 *
		 * @private
		 */
		buildMenuItem: function (workflowObject, parent) {
			if (Ext.isObject(workflowObject) && !Ext.Object.isEmpty(workflowObject)) {
				var menuObject = {
					disabled: (
						!workflowObject.get(CMDBuild.core.constants.Proxy.IS_STARTABLE)
						&& !workflowObject.get(CMDBuild.core.constants.Proxy.IS_SUPER_CLASS)
					),
					text: workflowObject.get(CMDBuild.core.constants.Proxy.DESCRIPTION),
					workflowId: workflowObject.get(CMDBuild.core.constants.Proxy.ID),
					scope: this
				};

				// Add handler function based on isSuperClass, isStartable, capabilities parameters
				if (
					!workflowObject.get(CMDBuild.core.constants.Proxy.IS_SUPER_CLASS)
					&& workflowObject.get(CMDBuild.core.constants.Proxy.IS_STARTABLE)
					&& !workflowObject.get(CMDBuild.core.constants.Proxy.CAPABILITIES).create
				) {
					menuObject.handler = function (button, e) {
						this.cmfg('onWorkflowAddButtonClick', button.workflowId);
					};
				}

				if (Ext.isArray(parent)) {
					parent.push(menuObject);
				} else if (Ext.isObject(parent)) {
					parent.menu = Ext.isArray(parent.menu) ? parent.menu : [];
					parent.menu.push(menuObject);
				} else {
					_error('buildMenuItem(): unmanaged parent parameter type', this, parent);
				}

				this.buildMenuChildren(workflowObject.get(CMDBuild.core.constants.Proxy.CHILDREN), menuObject);
			}
		},

		/**
		 * @param {Array} menuItems
		 *
		 * @returns {Boolean}
		 *
		 * @private
		 */
		isAddButtonDisabled: function (menuItems) {
			if (this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.IS_SUPER_CLASS))
				return Ext.isEmpty(menuItems) || this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.CAPABILITIES).create;

			return (
				!this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.IS_STARTABLE)
				|| this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.CAPABILITIES).create
			);
		},

		/**
		 * @param {Array} menuItems
		 *
		 * @returns {Boolean}
		 *
		 * @private
		 */
		isEnableActionEnabled: function (menuItems) {
			return (
				!this.cmfg('workflowSelectedWorkflowIsEmpty')
				&& (
					!this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.IS_SUPER_CLASS)
					|| (
						this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.IS_SUPER_CLASS)
						&& Ext.isEmpty(menuItems)
					)
				)
			);
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTreeToolbarTopStateComboChange: function () {
			if (!this.disableNextStatusSelectionChangeEvent) {
				this.cmfg('workflowSelectedActivityReset');
				this.cmfg('workflowSelectedInstanceReset');
				this.cmfg('workflowSelectedPreviousActivityReset');

				this.cmfg('workflowTreeStoreLoad');
			}

			this.disableNextStatusSelectionChangeEvent = false; // Reset flag value
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTreeToolbarTopWokflowSelect: function () {
			this.workflowToolbarTopWorkflowRelationshipTreeReset();

			// Build workflow map
			Ext.Array.each(this.cmfg('workflowLocalCacheWorkflowGetAll'), function (workflowObject, i, allWorkflowObjects) {
				if (Ext.isObject(workflowObject) && !Ext.Object.isEmpty(workflowObject))
					this.workflowToolbarTopWorkflowRelationshipTreeSet({ value: workflowObject.getData() });
			}, this);

			// Build relationship tree
			Ext.Object.each(this.workflowToolbarTopWorkflowRelationshipTreeGet(), function (id, workflowObject, myself) {
				if (
					Ext.isObject(workflowObject) && !Ext.Object.isEmpty(workflowObject)
					&& !Ext.isEmpty(workflowObject.get(CMDBuild.core.constants.Proxy.PARENT))
					&& workflowObject.get(CMDBuild.core.constants.Proxy.NAME) != CMDBuild.core.constants.Global.getRootNameWorkflows()
				){
					this.workflowToolbarTopWorkflowRelationshipTreeAppendChild(workflowObject.get(CMDBuild.core.constants.Proxy.PARENT), workflowObject);
				}
			}, this);

			// Build toolbar add button
			this.view.remove('addButton');
			this.view.insert(0, this.buildButtonAdd());
		},

		// WorkflowRelationshipTree property functions
			/**
			 * @param {Number} id
			 * @param {CMDBuild.model.management.workflow.panel.tree.toolbar.top.Parent} child
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowToolbarTopWorkflowRelationshipTreeAppendChild: function (id, child) {
				if (
					Ext.isNumber(id) && !Ext.isEmpty(id)
					&& !Ext.isEmpty(this.workflowRelationshipTree[id])
					&& Ext.isObject(child) && !Ext.Object.isEmpty(child)
					&& Ext.getClassName(child) == 'CMDBuild.model.management.workflow.panel.tree.toolbar.top.Parent'
				) {
					var children = this.workflowRelationshipTree[id].get(CMDBuild.core.constants.Proxy.CHILDREN);
					children = Ext.Array.merge(children, [child]); // Merge with unique items
					children = CMDBuild.core.Utils.objectArraySort(children); // Sort children by description ASC

					this.workflowRelationshipTree[id].set(CMDBuild.core.constants.Proxy.CHILDREN, children);
				}
			},

			/**
			 * @param {Number} id
			 * @param {String} attributeName
			 *
			 * @returns {Mixed or undefined}
			 *
			 * @private
			 */
			workflowToolbarTopWorkflowRelationshipTreeGet: function (id, attributeName) {
				if (
					Ext.isNumber(id) && !Ext.isEmpty(id)
					&& !Ext.isEmpty(this.workflowRelationshipTree[id])
				) {
					if (Ext.isString(attributeName) && !Ext.isEmpty(attributeName))
						return this.workflowRelationshipTree[id].get(attributeName);

					return this.workflowRelationshipTree[id];
				}

				return this.workflowRelationshipTree;
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowToolbarTopWorkflowRelationshipTreeReset: function () {
				this.workflowRelationshipTree = {};
			},

			/**
			 * @param {Object} parameters
			 * @param {Object} parameters.value
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowToolbarTopWorkflowRelationshipTreeSet: function (parameters) {
				if (
					Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)
					&& !Ext.isEmpty(parameters.value[CMDBuild.core.constants.Proxy.ID])
					&& Ext.isObject(parameters.value) && !Ext.Object.isEmpty(parameters.value)
				) {
					this.workflowRelationshipTree[parameters.value[CMDBuild.core.constants.Proxy.ID]] = Ext.create(
						'CMDBuild.model.management.workflow.panel.tree.toolbar.top.Parent',
						parameters.value
					);
				}
			},

		// StatusCombo methods
			/**
			 * @returns {String}
			 */
			workflowTreeToolbarTopStatusValueGet: function () {
				if (!Ext.isEmpty(this.view.statusCombo))
					return this.view.statusCombo.getValue();

				return CMDBuild.core.constants.WorkflowStates.getOpen();
			},

			/**
			 * @param {Object} parameters
			 * @param {Object} parameters.silently
			 * @param {Object} parameters.value
			 *
			 * @returns {Void}
			 */
			workflowTreeToolbarTopStatusValueSet: function (parameters) {
				this.disableNextStatusSelectionChangeEvent = Ext.isBoolean(parameters.silently) ? parameters.silently : false;

				this.view.statusCombo.setValue(parameters.value);
			}
	});

})();

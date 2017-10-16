(function () {

	Ext.define('CMDBuild.controller.management.workflow.panel.tree.Tree', {
		extend: 'CMDBuild.controller.common.panel.gridAndForm.panel.tree.Tree',

		requires: [
			'CMDBuild.controller.management.workflow.Utils',
			'CMDBuild.core.constants.Metadata',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.constants.WorkflowStates',
			'CMDBuild.core.interfaces.service.LoadMask',
			'CMDBuild.core.Message',
			'CMDBuild.core.Utils',
			'CMDBuild.proxy.management.workflow.panel.tree.Tree'
		],

		/**
		 * @cfg {CMDBuild.controller.management.workflow.Workflow}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter}
		 *
		 * @private
		 */
		appliedFilter: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'getView = workflowTreeViewGet',
			'onWorkflowTreeAbortButtonClick',
			'onWorkflowTreeAddButtonClick',
			'onWorkflowTreeBeforeItemClick',
			'onWorkflowTreeColumnChanged',
			'onWorkflowTreePrintButtonClick',
			'onWorkflowTreeRecordSelect',
			'onWorkflowTreeSaveFailure',
			'onWorkflowTreeSortChange',
			'onWorkflowTreeWokflowSelect = onWorkflowWokflowSelect',
			'workflowTreeActivitySelect',
			'workflowTreeAppliedFilterGet',
			'workflowTreeApplyStoreEvent',
			'workflowTreeFilterApply = panelGridAndFormGridFilterApply',
			'workflowTreeFilterClear = panelGridAndFormGridFilterClear',
			'workflowTreeRendererTreeColumn',
			'workflowTreeReset',
			'workflowTreeStoreGet',
			'workflowTreeStoreLoad',
			'workflowTreeToolbarTopStatusValueSet -> controllerToolbarTop',
			'workflowTreeGetFirstNodeId'
		],

		/**
		 * @property {CMDBuild.controller.common.panel.gridAndForm.panel.common.print.Window}
		 */
		controllerPrintWindow: undefined,

		/**
		 * @property {CMDBuild.controller.common.field.filter.runtimeParameters.RuntimeParameters}
		 */
		controllerRuntimeParameters: undefined,

		/**
		 * @proeprty {CMDBuild.controller.management.workflow.panel.tree.toolbar.Paging}
		 */
		controllerToolbarPaging: undefined,

		/**
		 * @property {CMDBuild.controller.management.workflow.panel.tree.toolbar.Top}
		 */
		controllerToolbarTop: undefined,

		/**
		 * Last execution of store load Ajax call
		 *
		 * @property {Object}
		 *
		 * @private
		 */
		lastLoadCall: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.tree.TreePanel}
		 */
		view: undefined,

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

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.tree.TreePanel', { delegate: this });

			// Build sub-controllers
			this.controllerPrintWindow = Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.print.Window', { parentDelegate: this });
			this.controllerRuntimeParameters = Ext.create('CMDBuild.controller.common.field.filter.runtimeParameters.RuntimeParameters', { parentDelegate: this });
			this.controllerToolbarPaging = Ext.create('CMDBuild.controller.management.workflow.panel.tree.toolbar.Paging', {
				parentDelegate: this,
				enableFilterAdvanced: true,
				enableFilterBasic: true,
				enableButtonPrint: true
			});
			this.controllerToolbarTop = Ext.create('CMDBuild.controller.management.workflow.panel.tree.toolbar.Top', { parentDelegate: this });

			// Add docked
			this.view.addDocked(this.controllerToolbarTop.getView(), 'top');
			this.view.addDocked(this.controllerToolbarPaging.getView(), 'bottom');
		},

		/**
		 * @param {Object} header
		 *
		 * @returns {String} value
		 *
		 * @legacy
		 * @private
		 *
		 * FIXME: delete when old FieldManager will be replaced (applyCustomRenderer)
		 */
		addRendererToHeader: function (header) {
			header.renderer = function (value, metadata, record, rowIndex, colIndex, store, view) {
				value = record.get(header.dataIndex);

				if (typeof value == 'undefined' || value == null) {
					return '';
				} else if (typeof value == 'object') {
					/**
					 * Some values (like reference or lookup) are serialized as object {id: "", description:""}.
					 * Here we display the description
					 */
					value = value.description;
				} else if (typeof value == 'boolean') { // Localize the boolean values
					value = value ? Ext.MessageBox.buttonText.yes : Ext.MessageBox.buttonText.no;
				} else if (typeof value == 'string') { // Strip HTML tags from strings in grid
					value = Ext.util.Format.stripTags(value);
				}

				return value;
			};
		},

		/**
		 * Custom renderer to work with "CMDBuild.model.management.workflow.Node" custom get method
		 *
		 * @param {Object} column
		 * @param {CMDBuild.model.management.workflow.Attribute} columnModel
		 *
		 * @returns {Object} column
		 *
		 * @private
		 */
		applyCustomRenderer: function (column, columnModel) {
			switch (columnModel.get(CMDBuild.core.constants.Proxy.TYPE)) {
				case 'boolean':
					return Ext.apply(column, {
						renderer: function (value, metadata, record, rowIndex, colIndex, store, view) {
							value = record.get(column.dataIndex);

							return value ? CMDBuild.Translation.yes : CMDBuild.Translation.no; // Translate value
						}
					});

				default:
					return Ext.apply(column, {
						renderer: function (value, metadata, record, rowIndex, colIndex, store, view) {
							return Ext.util.Format.stripTags(record.get(column.dataIndex));
						}
					});
			}
		},

		/**
		 * Apply interceptor with default store load callback actions, if callback is empty will be replaced with Ext.emptyFn
		 *
		 * @param {Function} callback
		 *
		 * @returns {Function}
		 *
		 * @private
		 */
		buildLoadCallback: function (callback) {
			callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;

			return Ext.Function.createInterceptor(callback, function (records, options, success) {
				this.cmfg('workflowFormReset');

				if (this.workflowTreeAppliedFilterIsEmpty())
					this.controllerToolbarPaging.cmfg('workflowTreeToolbarPagingFilterAdvancedReset');
			}, this);
		},

		/**
		 * @returns {Array} visibleColumnNames
		 *
		 * @private
		 */
		displayedParametersNamesGet: function () {
			var visibleColumns = Ext.Array.slice(this.view.query('gridcolumn:not([hidden])'), 1), // Discard expander column
				visibleColumnNames = [];

			// Build columns dataIndex array
			if (Ext.isArray(visibleColumns) && !Ext.isEmpty(visibleColumns))
				Ext.Array.each(visibleColumns, function (columnObject, i, allColumnObjects) {
					if (
						Ext.isObject(columnObject) && !Ext.Object.isEmpty(columnObject)
						&& !Ext.isEmpty(columnObject.dataIndex)
					) {
						visibleColumnNames.push(columnObject.dataIndex);
					}
				}, this);

			return visibleColumnNames;
		},

		/**
		 * @param {CMDBuild.model.management.workflow.Node} node
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		nodeRecursiveAnchestorsExpand: function (node) {
			// Error handling
				if (!Ext.isObject(node) || Ext.Object.isEmpty(node) || !Ext.isFunction(node.bubble))
					return _error('nodeRecursiveAnchestorsExpand(): unmanaged node parameter', this, node);
			// END: Error handling

			node.bubble(function () {
				this.expand();
			});
		},

		/**
		 * Evaluates if node is an activity or instance
		 *
		 * @param {CMDBuild.model.management.workflow.Node} node
		 *
		 * @returns {String}
		 *
		 * @private
		 */
		nodeTypeOf: function (node) {
			// Error handling
				if (!Ext.isObject(node) || Ext.Object.isEmpty(node))
					return _error('nodeTypeOf(): unmanaged node parameter', this, node);
			// END: Error handling

			var activityId = node.get(CMDBuild.core.constants.Proxy.ACTIVITY_ID),
				cardId = node.get(CMDBuild.core.constants.Proxy.CARD_ID),
				classId = node.get(CMDBuild.core.constants.Proxy.CLASS_ID);

			if (
				Ext.isString(activityId) && !Ext.isEmpty(activityId)
				&& Ext.isNumber(cardId) && !Ext.isEmpty(cardId)
				&& Ext.isNumber(classId) && !Ext.isEmpty(classId)
			) {
				return 'activity';
			}

			if ( // Instance node selected
				Ext.isNumber(cardId) && !Ext.isEmpty(cardId)
				&& Ext.isNumber(classId) && !Ext.isEmpty(classId)
			) {
				return 'instance';
			}

			return '';
		},

		/**
		 * Manage previous selected activity
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeAbortButtonClick: function () {
			if (this.cmfg('workflowSelectedActivityIsEmpty')) {
				var instanceId, metadata;
				if (!this.cmfg('workflowSelectedPreviousActivityIsEmpty')) {
					instanceId = this.cmfg('workflowSelectedPreviousActivityGet', CMDBuild.core.constants.Proxy.INSTANCE_ID);
					metadata = this.cmfg('workflowSelectedPreviousActivityGet', CMDBuild.core.constants.Proxy.METADATA);
				} else {
					instanceId = this.cmfg('workflowTreeGetFirstNodeId');
					metadata = [];
				}
				if (instanceId) {
					this.cmfg('workflowTreeActivitySelect', {
						forceFilter: false,
						instanceId: instanceId,
						metadata: metadata
					});
				}
			}
		},

		/**
		 * @param {Number} id
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeAddButtonClick: function (id) {
			this.view.getSelectionModel().deselectAll();
			this.view.collapseAll();
		},

		/**
		 * Auto-select expanded node (only for graphical behaviour)
		 *
		 * @param {CMDBuild.model.management.workflow.Node} record
		 *
		 * @returns {Boolean}
		 */
		onWorkflowTreeBeforeItemClick: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('onWorkflowTreeBeforeItemClick(): unmanaged record parameter', this, record);
			// END: Error handling

			this.view.getSelectionModel().select(record);
		},

		/**
		 * @returns {Void}
		 */
		onWorkflowTreeColumnChanged: function () {
			this.cmfg('workflowTreeStoreLoad');
		},

		/**
		 * @param {String} format
		 *
		 * @returns {Void}
		 */
		onWorkflowTreePrintButtonClick: function (format) {
			// Error handling
				if (!Ext.isString(format) || Ext.isEmpty(format))
					return _error('onWorkflowTreePrintButtonClick(): unmanaged format parameter', this, format);
			// END: Error handling

			var sorters = this.cmfg('workflowTreeStoreGet').getSorters();

			var params = Ext.clone(this.storeExtraParamsGet());
			params[CMDBuild.core.constants.Proxy.TYPE] = format;

			if (Ext.isArray(sorters) && !Ext.isEmpty(sorters))
				params[CMDBuild.core.constants.Proxy.SORT] = Ext.encode(sorters);

			// Removes unwanted params to print all workflow data
			delete params[CMDBuild.core.constants.Proxy.PAGE];
			delete params[CMDBuild.core.constants.Proxy.LIMIT];

			this.controllerPrintWindow.cmfg('panelGridAndFormPrintWindowShow', {
				format: format,
				mode: 'view',
				params: params
			});
		},

		/**
		 * @param {CMDBuild.model.management.workflow.Node} record
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeRecordSelect: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record) || !Ext.isFunction(record.get))
					return _error('onWorkflowTreeRecordSelect(): unmanaged record parameter', this, record);
			// END: Error handling

			CMDBuild.core.interfaces.service.LoadMask.manage(true, true); // Manually manage LoadMask (show)

			switch (this.nodeTypeOf(record)) {
				case 'activity':
					return this.cmfg('onWorkflowInstanceSelect', {
						record: record,
						loadMask: false,
						scope: this,
						callback: function () {
							this.cmfg('onWorkflowActivitySelect', {
								record: record,
								loadMask: false,
								scope: this,
								callback: Ext.bind(this.recordSelectionCallback, this, [record])
							});
						}
					});

				case 'instance': {
					this.cmfg('workflowSelectedActivityReset');

					return this.cmfg('onWorkflowInstanceSelect', {
						record: record,
						loadMask: false,
						scope: this,
						callback: Ext.bind(this.recordSelectionCallback, this, [record])
					});
				}

				default:
					return _error('onWorkflowTreeRecordSelect(): unmanaged record type', this, record);
			}

			return _error('onWorkflowTreeRecordSelect(): not correctly filled record model', this, record);
		},

		/**
		 * Reload store on save failure
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeSaveFailure: function () {
			this.cmfg('workflowTreeStoreLoad', { disableFirstRowSelection: true });
		},

		/**
		 * Reset tree and form on column sort change
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeSortChange: function () {
			this.cmfg('workflowFormReset');
			this.cmfg('workflowTreeReset');
		},

		/**
		 * Setup store, columns and sorters
		 *
		 * NOTE: store loading is called by paging toolbar
		 *
		 * @param {CMDBuild.model.common.Accordion} node
		 *
		 * @returns {Void}
		 */
		onWorkflowTreeWokflowSelect: function (node) {
			this.view.reconfigure(this.storeSortersSet(this.cmfg('workflowTreeStoreGet')), this.workflowTreeBuildColumns());

			// Forward to sub controllers
			this.controllerToolbarPaging.cmfg('onWorkflowTreeToolbarPagingWokflowSelect', node.get(CMDBuild.core.constants.Proxy.FILTER));
			this.controllerToolbarTop.cmfg('onWorkflowTreeToolbarTopWokflowSelect');
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.failure
		 * @param {Object} parameters.params
		 * @param {String} parameters.params.filter
		 * @param {String} parameters.params.flowStatus
		 * @param {Number} parameters.params.instanceId
		 * @param {Object} parameters.scope
		 * @param {Function} parameters.success
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		positionActivityGet: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.params = Ext.isObject(parameters.params) ? parameters.params : {};

			var filter = parameters.params[CMDBuild.core.constants.Proxy.FILTER],
				flowStatus = parameters.params[CMDBuild.core.constants.Proxy.FLOW_STATUS],
				instanceId = parameters.params[CMDBuild.core.constants.Proxy.INSTANCE_ID],
				sort = this.cmfg('workflowTreeStoreGet').getSorters();

			// Error handling
				if (this.cmfg('workflowSelectedWorkflowIsEmpty'))
					return _error('positionActivityGet(): empty selected workflow', this);

				if (!Ext.isFunction(parameters.failure))
					return _error('positionActivityGet(): wrong failure function parameter', this, parameters.failure);

				if (!Ext.isFunction(parameters.success))
					return _error('positionActivityGet(): wrong success function parameter', this, parameters.success);

				if (!Ext.isNumber(instanceId) || Ext.isEmpty(instanceId))
					return _error('positionActivityGet(): wrong instanceId parameter', this, instanceId);
			// END: Error handling

			var params = {};
			params[CMDBuild.core.constants.Proxy.CARD_ID] = instanceId;
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);

			if (Ext.isString(filter) && !Ext.isEmpty(filter))
				params[CMDBuild.core.constants.Proxy.FILTER] = filter;

			if (Ext.isString(flowStatus) && !Ext.isEmpty(flowStatus))
				params[CMDBuild.core.constants.Proxy.FLOW_STATUS] = CMDBuild.controller.management.workflow.Utils.translateStatusFromCapitalizedMode(flowStatus);

			if (Ext.isArray(sort) && !Ext.isEmpty(sort))
				params[CMDBuild.core.constants.Proxy.SORT] = Ext.encode(sort);

			CMDBuild.proxy.management.workflow.panel.tree.Tree.readPosition({
				params: params,
				scope: Ext.isObject(parameters.scope) ? parameters.scope : this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					// Error handling
					if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
						return _error('positionActivityGet(): unmanaged response', this, decodedResponse);

					// Card found
					if (Ext.isBoolean(decodedResponse[CMDBuild.core.constants.Proxy.HAS_POSITION]) && decodedResponse[CMDBuild.core.constants.Proxy.HAS_POSITION]) {
						Ext.callback(
							parameters.success,
							Ext.isObject(parameters.scope) ? parameters.scope : this,
							[response, options, decodedResponse]
						);
					} else { // Card not found
						Ext.callback(
							parameters.failure,
							Ext.isObject(parameters.scope) ? parameters.scope : this,
							[response, options, decodedResponse]
						);
					}
				}
			});
		},

		/**
		 * @param {Object} response
		 * @param {Object} options
		 * @param {Object} decodedResponse
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		positionActivityGetFailure: function (response, options, decodedResponse) {
			// Error handling
				if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
					return _error('positionActivityGetFailure(): unmanaged decodedResponse parameter', this, decodedResponse);
			// END: Error handling

			var flowStatus = decodedResponse[CMDBuild.core.constants.Proxy.FLOW_STATUS];

			CMDBuild.core.Message.error(
				CMDBuild.Translation.common.failure,
				Ext.String.format(
					CMDBuild.Translation.errors.reasons.CARD_NOTFOUND,
					this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.DESCRIPTION)
					+ ' [' +this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME) + ']'
				)
			);

			// Sync UI with parameter filter property value
			if (Ext.isEmpty(options.params[CMDBuild.core.constants.Proxy.FILTER])) {
				this.controllerToolbarPaging.cmfg('workflowTreeToolbarPagingFilterBasicReset');
				this.cmfg('workflowTreeFilterClear', { disableStoreLoad: true });
			}

			// Sync UI with flow status returned value
			if (Ext.isString(flowStatus) && !Ext.isEmpty(flowStatus) && flowStatus != CMDBuild.core.constants.WorkflowStates.getOpenCapitalized())
				this.cmfg('workflowTreeToolbarTopStatusValueSet', {
					silently: true,
					value: CMDBuild.core.constants.WorkflowStates.getAll()
				});

			this.cmfg('workflowFormReset');
			this.cmfg('workflowTreeReset');
			this.cmfg('workflowTreeStoreLoad', { disableFirstRowSelection: true });
		},

		/**
		 * @param {Object} response
		 * @param {Object} options
		 * @param {Object} decodedResponse
		 * @param {Object} metadata
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		positionActivityGetSuccess: function (response, options, decodedResponse, metadata) {
			// Error handling
				if (!Ext.isObject(decodedResponse) || Ext.Object.isEmpty(decodedResponse))
					return _error('positionActivityGetSuccess(): unmanaged response', this, decodedResponse);
			// END: Error handling

			var flowStatus = decodedResponse[CMDBuild.core.constants.Proxy.FLOW_STATUS],
				filter = options.params[CMDBuild.core.constants.Proxy.FILTER],
				position = decodedResponse[CMDBuild.core.constants.Proxy.POSITION];

			// Sync UI with parameter filter property value
			if (!Ext.isString(filter) || Ext.isEmpty(filter)) {
				this.controllerToolbarPaging.cmfg('workflowTreeToolbarPagingFilterBasicReset');
				this.cmfg('workflowTreeFilterClear', { disableStoreLoad: true });
			}

			// Sync UI with flowStatus returned value
			if (Ext.isString(flowStatus) && !Ext.isEmpty(flowStatus) && flowStatus != CMDBuild.core.constants.WorkflowStates.getOpenCapitalized())
				this.cmfg('workflowTreeToolbarTopStatusValueSet', {
					silently: true,
					value: CMDBuild.core.constants.WorkflowStates.getAll()
				});

			this.cmfg('workflowTreeStoreLoad', {
				page: CMDBuild.core.Utils.getPageNumber(position),
				scope: this,
				callback: function (records, operation, success) {
					this.view.getSelectionModel().deselectAll();

					this.selectByMetadata(position, metadata);
					this.selectByPosition(position % CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.ROW_LIMIT));
				}
			});
		},

		/**
		 * @param {CMDBuild.model.management.workflow.Node} record
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		recordSelectionCallback: function (record) {
			// Error handling
				if (!Ext.isObject(record) || Ext.Object.isEmpty(record))
					return _error('recordSelectionCallback(): unmanaged record parameter', this, record);
			// END: Error handling

			var instanceValues = this.cmfg('workflowSelectedInstanceGet', CMDBuild.core.constants.Proxy.VALUES);

			switch (this.nodeTypeOf(record)) {
				// Complete brother node models with additional values (to correctly manage AdditionalActivityLabel metadata also if relative column is not displayed)
				case 'activity': {
					var parent = record.parentNode;

					if (
						Ext.isObject(parent) && !Ext.Object.isEmpty(parent)
						&& Ext.isFunction(parent.isRoot) && !parent.isRoot()
					) {
						parent.eachChild(function (childNode) {
							childNode.set(CMDBuild.core.constants.Proxy.VALUES, instanceValues);
						}, this);
					}
				} break;

				// Complete record and children models with additional values (to correctly manage AdditionalActivityLabel metadata also if relative column is not displayed)
				case 'instance': {
					record.set(CMDBuild.core.constants.Proxy.VALUES, instanceValues);

					if (record.hasChildNodes())
						record.eachChild(function (childNode) {
							childNode.set(CMDBuild.core.constants.Proxy.VALUES, instanceValues);
						}, this);
				} break;

				default:
					return _error('recordSelectionCallback(): unmanaged record type', this, record);
			}

			CMDBuild.core.interfaces.service.LoadMask.manage(true, false); // Manually manage LoadMask (hide)

			if (record.get("openInEditMode")) {
				this.cmfg('onWorkflowActivityItemDoubleClick');
			}
		},

		// Tree selection methods
			/**
			 * Select position instance's activity by metadata
			 *
			 * @param {Number} position
			 * @param {String} metadata
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			selectByMetadata: function (position, metadata) {
				if (Ext.isArray(metadata) && !Ext.isEmpty(metadata)) {
					var metadataValueActivitySubsetId = undefined,
						metadataValueNextActivitySubsetId = undefined;

					// Manual search as optimization to reduce loops number
					Ext.Array.forEach(metadata, function (metadata, i, allMetadata) {
						switch (metadata[CMDBuild.core.constants.Proxy.NAME]) {
							case CMDBuild.core.constants.Metadata.getActivitySubsetId(): {
								metadataValueActivitySubsetId = metadata[CMDBuild.core.constants.Proxy.VALUE];
							} break;

							case CMDBuild.core.constants.Metadata.getNextActivitySubsetId(): {
								metadataValueNextActivitySubsetId = metadata[CMDBuild.core.constants.Proxy.VALUE];
							} break;
						}
					}, this)

					this.selectByMetadataActivitySubsetId(position, metadataValueActivitySubsetId);
					this.selectByMetadataActivitySubsetId(position, metadataValueNextActivitySubsetId);
				}
			},

			/**
			 * Manage selection by ActivitySubsetId value
			 *
			 * @param {Number} position
			 * @param {String} metadataValue
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			selectByMetadataActivitySubsetId: function (position, metadataValue) {
				if (
					Ext.isString(metadataValue) && !Ext.isEmpty(metadataValue)
					&& Ext.isNumber(position) && !Ext.isEmpty(position)
					&& !this.view.getSelectionModel().hasSelection()
				) {
					var nodeToSelect = this.cmfg('workflowTreeStoreGet').getRootNode().getChildAt(position).findChildBy(function (node) {
						var nodeMetadata = node.get(CMDBuild.core.constants.Proxy.ACTIVITY_METADATA),
							activitySubsetIdObject = Ext.Array.findBy(nodeMetadata, function (metadata, i, allMetadata) {
								return metadata[CMDBuild.core.constants.Proxy.NAME] == CMDBuild.core.constants.Metadata.getActivitySubsetId();
							}, this);

						if (Ext.isObject(activitySubsetIdObject) && !Ext.Object.isEmpty(activitySubsetIdObject))
							return activitySubsetIdObject[CMDBuild.core.constants.Proxy.VALUE] == metadataValue;

						return false;
					}, this, true);

					if (Ext.isObject(nodeToSelect) && !Ext.Object.isEmpty(nodeToSelect)) {
						this.view.getSelectionModel().on('selectionchange', function (selectionModel, selected, eOpts) {
							this.nodeRecursiveAnchestorsExpand(nodeToSelect);
						}, this, { single: true });

						this.view.getSelectionModel().select(nodeToSelect);
					}
				}
			},

			/**
			 * @param {Number} position
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			selectByPosition: function (position) {
				if (
					Ext.isNumber(position) && !Ext.isEmpty(position)
					&& !this.view.getSelectionModel().hasSelection()
				) {
					this.view.getSelectionModel().on('selectionchange', function (selectionModel, selected, eOpts) {
						this.nodeRecursiveAnchestorsExpand(selected[0]);
					}, this, { single: true });

					this.view.getSelectionModel().select(position);
				}
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			selectFirst: function () {
				if (!this.view.getSelectionModel().hasSelection())
					this.view.getSelectionModel().select(0);
			},

		// Store extra params methods
			/**
			 * @param {String} name
			 *
			 * @returns {Mixed}
			 *
			 * @private
			 */
			storeExtraParamsGet: function (name) {
				var extraParams = this.cmfg('workflowTreeStoreGet').getProxy().extraParams;

				if (Ext.isString(name) && !Ext.isEmpty(name))
					return extraParams[name];

				return extraParams;
			},

			/**
			 * @param {String} name
			 *
			 * @returns {Mixed}
			 *
			 * @private
			 */
			storeExtraParamsRemove: function (name) {
				if (Ext.isString(name) && !Ext.isEmpty(name))
					delete this.storeExtraParamsGet()[name];
			},

			/**
			 * @param {Object} valueObject
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			storeExtraParamsSet: function (valueObject) {
				if (Ext.isObject(valueObject))
					this.cmfg('workflowTreeStoreGet').getProxy().extraParams = valueObject;
			},

		// Store sorters
			/**
			 * @param {Ext.data.TreeStore} store
			 * @param {Object} sorter
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			storeSortersAdd: function (store, sorter) {
				// Error handling
					if (Ext.isEmpty(store) || Ext.isEmpty(store.sorters) || !Ext.isFunction(store.sorters.add))
						return _error('storeSortersAdd(): unable to add store sorters', this, store, sorter);

					if (
						!Ext.isObject(sorter) || Ext.Object.isEmpty(sorter)
						|| Ext.isEmpty(sorter.property)
						|| Ext.isEmpty(sorter.direction)
					) {
						return _error('storeSortersAdd(): unmanaged sorter object', this, store, sorter);
					}
				// END: Error handling

				store.sorters.add(sorter);
			},

			/**
			 * @param {Ext.data.TreeStore} store
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			storeSortersClear: function (store) {
				if (!Ext.isEmpty(store) && !Ext.isEmpty(store.sorters) && Ext.isFunction(store.sorters.clear))
					return store.sorters.clear();

				return _error('storeSortersClear(): unable to clear store sorters', this, store);
			},

			/**
			 * @param {Ext.data.TreeStore} store
			 *
			 * @returns {Ext.data.TreeStore} store
			 *
			 * @private
			 */
			storeSortersSet: function (store) {
				var attributes = CMDBuild.core.Utils.objectArraySort(this.cmfg('workflowSelectedWorkflowAttributesGet'), CMDBuild.core.constants.Proxy.SORT_INDEX);

				// Setup store sorters
				this.storeSortersClear(store);

				if (Ext.isArray(attributes) && !Ext.isEmpty(attributes))
					Ext.Array.each(attributes, function (attributeModel, i, allAttributeModels) {
						if (
							Ext.isObject(attributeModel) && !Ext.Object.isEmpty(attributeModel)
							&& !Ext.isEmpty(attributeModel.get(CMDBuild.core.constants.Proxy.SORT_DIRECTION))
						) {
							this.storeSortersAdd(store, {
								property: attributeModel.get(CMDBuild.core.constants.Proxy.NAME),
								direction: attributeModel.get(CMDBuild.core.constants.Proxy.SORT_DIRECTION)
							});
						}
					}, this);
			},

		/**
		 * Find an Activity in store and open, follows 3 steps:
		 * 	1. full call
		 * 	2. without filter
		 * 	3. without filter and flow status
		 *
		 * @param {Object} parameters
		 * @param {String} parameters.enableForceFlowStatus
		 * @param {String} parameters.forceFilter - only for internal use, false as default
		 * @param {String} parameters.forceFlowStatus - only for internal use, false as default
		 * @param {Number} parameters.instanceId
		 * @param {String} parameters.metadata
		 *
		 * @returns {Void}
		 */
		workflowTreeActivitySelect: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.enableForceFlowStatus = Ext.isBoolean(parameters.enableForceFlowStatus) ? parameters.enableForceFlowStatus : false;
			parameters.forceFilter = Ext.isBoolean(parameters.forceFilter) ? parameters.forceFilter : false;
			parameters.forceFlowStatus = Ext.isBoolean(parameters.forceFlowStatus) ? parameters.forceFlowStatus : false;
			parameters.metadata = Ext.isArray(parameters.metadata) ? parameters.metadata : [];

			// Error handling
				if (this.cmfg('workflowSelectedWorkflowIsEmpty'))
					return _error('workflowTreeActivitySelect(): no selected workflow found', this);

				if (!Ext.isNumber(parameters[CMDBuild.core.constants.Proxy.INSTANCE_ID]) || Ext.isEmpty(parameters[CMDBuild.core.constants.Proxy.INSTANCE_ID]))
					return _error('workflowTreeActivitySelect(): unmanaged instanceId parameter', this, parameters[CMDBuild.core.constants.Proxy.INSTANCE_ID]);
			// END: Error handling

			var flowStatusComboBoxValue = this.controllerToolbarTop.cmfg('workflowTreeToolbarTopStatusValueGet');

			var params = {};
			params[CMDBuild.core.constants.Proxy.INSTANCE_ID] = parameters[CMDBuild.core.constants.Proxy.INSTANCE_ID];

			if (!parameters.forceFilter && !this.workflowTreeAppliedFilterIsEmpty())
				params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode(this.cmfg('workflowTreeAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION));

			if (parameters.enableForceFlowStatus) {
				if (!parameters.forceFlowStatus && flowStatusComboBoxValue != CMDBuild.core.constants.WorkflowStates.getAll())
					params[CMDBuild.core.constants.Proxy.FLOW_STATUS] = flowStatusComboBoxValue;
			} else {
				if (flowStatusComboBoxValue != CMDBuild.core.constants.WorkflowStates.getAll())
					params[CMDBuild.core.constants.Proxy.FLOW_STATUS] = flowStatusComboBoxValue;
			}

			this.positionActivityGet({ // Full call: with flow status and filter
				params: params,
				scope: this,
				failure: function (response, options, decodedResponse) {
					if (Ext.isString(params[CMDBuild.core.constants.Proxy.FILTER]) && !Ext.isEmpty(params[CMDBuild.core.constants.Proxy.FILTER])) {
						parameters.forceFilter = true;

						return this.cmfg('workflowTreeActivitySelect', parameters);
					} else if (
						Ext.isString(params[CMDBuild.core.constants.Proxy.FLOW_STATUS]) && !Ext.isEmpty(params[CMDBuild.core.constants.Proxy.FLOW_STATUS])
						&& params[CMDBuild.core.constants.Proxy.FLOW_STATUS] != CMDBuild.core.constants.WorkflowStates.getAll()
						&& parameters.enableForceFlowStatus
					) {
						parameters.forceFlowStatus = true;

						return this.cmfg('workflowTreeActivitySelect', parameters);
					} else {
						return Ext.callback(this.positionActivityGetFailure, this, [response, options, decodedResponse]); // Card not found and store reload
					}
				},
				success: function (response, options, decodedResponse) {
					Ext.callback(this.positionActivityGetSuccess, this, [response, options, decodedResponse, parameters.metadata]);
				}
			});
		},

		// AppliedFilter property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			workflowTreeAppliedFilterGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'appliedFilter';
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
			workflowTreeAppliedFilterIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'appliedFilter';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowTreeAppliedFilterReset: function () {
				this.propertyManageReset('appliedFilter');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowTreeAppliedFilterSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'appliedFilter';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @param {Object} parameters
		 * @param {String} parameters.eventName
		 * @param {Function} parameters.fn
		 * @param {Object} parameters.scope
		 * @param {Object} parameters.options
		 *
		 * @returns {Void}
		 */
		workflowTreeApplyStoreEvent: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (!Ext.isString(parameters.eventName) || Ext.isEmpty(parameters.eventName))
					return _error('workflowTreeApplyStoreEvent(): unmanaged eventName parameter', this, parameters.eventName);

				if (!Ext.isFunction(parameters.fn))
					return _error('workflowTreeApplyStoreEvent(): unmanaged fn parameter', this, parameters.fn);
			// END: Error handling

			this.cmfg('workflowTreeStoreGet').on(
				parameters.eventName,
				parameters.fn,
				Ext.isObject(parameters.scope) ? parameters.scope : this,
				Ext.isObject(parameters.options) ? parameters.options : {}
			);
		},

		/**
		 * @returns {Array} columnsDefinition
		 *
		 * @private
		 */
		workflowTreeBuildColumns: function () {
			var columnsDefinition = [
				Ext.create('CMDBuild.view.management.workflow.panel.tree.TreeColumn', {
					dataIndex: CMDBuild.core.constants.Proxy.ACTIVITY_DESCRIPTION,
					scope: this
				})
			];

			if (!this.cmfg('workflowSelectedWorkflowIsEmpty') && !this.cmfg('workflowSelectedWorkflowAttributesIsEmpty')) {
				var fieldManager = Ext.create('CMDBuild.core.fieldManager.FieldManager', { parentDelegate: this }),
					attributes = CMDBuild.core.Utils.objectArraySort(this.cmfg('workflowSelectedWorkflowAttributesGet'), CMDBuild.core.constants.Proxy.INDEX);

				if (this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.IS_SUPER_CLASS))
					columnsDefinition.push({
						dataIndex: CMDBuild.core.constants.Proxy.CLASS_DESCRIPTION,
						text: CMDBuild.Translation.subClass
					});

				Ext.Array.each(attributes, function (attributeModel, i, allAttributeModels) {
					if (
						Ext.isObject(attributeModel) && !Ext.Object.isEmpty(attributeModel)
						&& attributeModel.get(CMDBuild.core.constants.Proxy.NAME) != CMDBuild.core.constants.Proxy.CLASS_DESCRIPTION
					) {
						if (fieldManager.isAttributeManaged(attributeModel.get(CMDBuild.core.constants.Proxy.TYPE))) {
							fieldManager.attributeModelSet(attributeModel);
							fieldManager.push(
								columnsDefinition,
								this.applyCustomRenderer(fieldManager.buildColumn(), attributeModel)
							);
						} else if (attributeModel.get(CMDBuild.core.constants.Proxy.TYPE) != 'ipaddress') { // FIXME: future implementation - @deprecated - Old field manager
							var column = CMDBuild.Management.FieldManager.getHeaderForAttr(attributeModel.get(CMDBuild.core.constants.Proxy.SOURCE_OBJECT));

							if (Ext.isObject(column) && !Ext.Object.isEmpty(column)) {
								column.text = column.header; // Create alias of header property because it's deprecated

								// Remove width properties by default to be compatible with forceFit property
								delete column.flex;
								delete column.width;
								delete column.minWidth;

								this.addRendererToHeader(column);

								fieldManager.push(columnsDefinition, column);
							}
						}
					}
				}, this);
			}

			return columnsDefinition;
		},

		// Filter management methods
			/**
			 * @param {Object} parameters
			 * @param {CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter} parameters.filter
			 * @param {Boolean} parameters.type
			 *
			 * @returns {Void}
			 */
			workflowTreeFilterApply: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};

				// Error handling
					if (!Ext.isObject(parameters.filter) || Ext.Object.isEmpty(parameters.filter))
						return _error('workflowTreeFilterApply(): unmanaged filter object parameter', this, parameters.filter);
				// END: Error handling

				switch (parameters.type) {
					case 'advanced':
						return this.workflowTreeFilterApplyAdvanced(parameters.filter);

					case 'basic':
						return this.workflowTreeFilterApplyBasic(parameters.filter);

					default:
						return _error('workflowTreeFilterApply(): unmanaged type parameter', this, parameters.type);
				}
			},

			/**
			 * @param {CMDBuild.model.management.workflow.panel.tree.filter.advanced.Filter} filter
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowTreeFilterApplyAdvanced: function (filter) {
				// Error handling
					if (!Ext.isObject(filter) || Ext.Object.isEmpty(filter) || !Ext.isFunction(filter.get) || !Ext.isFunction(filter.set))
						return _error('workflowTreeFilterApplyAdvanced(): unmanaged filter object parameter', this, filter);

					if (!Ext.isFunction(filter.getEmptyRuntimeParameters) || !Ext.isFunction(filter.resolveCalculatedParameters))
						return _error('workflowTreeFilterApplyAdvanced(): unsupported filter object functions', this, filter);
				// END: Error handling

				var emptyRuntimeParameters = filter.getEmptyRuntimeParameters(),
					filterConfigurationObject = filter.get(CMDBuild.core.constants.Proxy.CONFIGURATION);

				if (Ext.isArray(emptyRuntimeParameters) && !Ext.isEmpty(emptyRuntimeParameters))
					return this.controllerRuntimeParameters.cmfg('fieldFilterRuntimeParametersShow', filter);

				filter.resolveCalculatedParameters();

				// Merge applied filter query parameter to filter object
				if (!this.workflowTreeAppliedFilterIsEmpty()) {
					var appliedFilterConfigurationObject = this.cmfg('workflowTreeAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION);

					if (!Ext.isEmpty(appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY]))
						filter.set(CMDBuild.core.constants.Proxy.CONFIGURATION, Ext.apply(filterConfigurationObject, {
							query: appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY]
						}));
				}

				this.workflowTreeAppliedFilterSet({ value: filter.getData() });

				this.cmfg('workflowTreeStoreLoad');
			},

			/**
			 * @param {CMDBuild.model.common.field.filter.basic.Filter} filter
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			workflowTreeFilterApplyBasic: function (filter) {
				// Error handling
					if (!Ext.isObject(filter) || Ext.Object.isEmpty(filter) || !Ext.isFunction(filter.get) || !Ext.isFunction(filter.set))
						return _error('workflowTreeFilterApplyBasic(): unmanaged filter object parameter', this, filter);
				// END: Error handling

				var newConfigurationObject = {},
					filterConfigurationObject = filter.get(CMDBuild.core.constants.Proxy.CONFIGURATION);

				// Merge filters objects
				if (this.workflowTreeAppliedFilterIsEmpty()) {
					newConfigurationObject[CMDBuild.core.constants.Proxy.CONFIGURATION] = {};
					newConfigurationObject[CMDBuild.core.constants.Proxy.CONFIGURATION][CMDBuild.core.constants.Proxy.QUERY] = filterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY];

					this.workflowTreeAppliedFilterSet({ value: newConfigurationObject });
				} else {
					newConfigurationObject = this.cmfg('workflowTreeAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION);
					newConfigurationObject[CMDBuild.core.constants.Proxy.QUERY] = filterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY];

					this.workflowTreeAppliedFilterSet({
						propertyName: CMDBuild.core.constants.Proxy.CONFIGURATION,
						value: newConfigurationObject
					});
				}

				this.cmfg('workflowTreeStoreLoad');
			},

			/**
			 * @param {Object} parameters
			 * @param {Boolean} parameters.disableStoreLoad
			 * @param {Boolean} parameters.type
			 *
			 * @returns {Void}
			 */
			workflowTreeFilterClear: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};
				parameters.disableStoreLoad = Ext.isBoolean(parameters.disableStoreLoad) ? parameters.disableStoreLoad : false;

				if (!this.workflowTreeAppliedFilterIsEmpty()) {
					var appliedFilterConfigurationObject = Ext.clone(this.cmfg('workflowTreeAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION));

					switch (parameters.type) {
						case 'advanced': {
							this.workflowTreeAppliedFilterReset();

							if (!Ext.isEmpty(appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY])) {
								var newConfigurationObject = {};
								newConfigurationObject[CMDBuild.core.constants.Proxy.CONFIGURATION] = {};
								newConfigurationObject[CMDBuild.core.constants.Proxy.CONFIGURATION][CMDBuild.core.constants.Proxy.QUERY] = appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY];

								this.workflowTreeAppliedFilterSet({ value: newConfigurationObject });
							}
						} break;

						case 'basic': {
							delete appliedFilterConfigurationObject[CMDBuild.core.constants.Proxy.QUERY];

							if (Ext.Object.isEmpty(appliedFilterConfigurationObject)) {
								this.workflowTreeAppliedFilterReset();
							} else {
								this.workflowTreeAppliedFilterSet({
									propertyName: CMDBuild.core.constants.Proxy.CONFIGURATION,
									value: appliedFilterConfigurationObject
								});
							}
						} break;

						default: {
							this.workflowTreeAppliedFilterReset();
						}
					}
				}

				if (!parameters.disableStoreLoad)
					this.cmfg('workflowTreeStoreLoad');
			},

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.metadata
		 * @param {CMDBuild.model.management.workflow.Node} parameters.record
		 * @param {String} parameters.value
		 *
		 * @returns {String}
		 */
		workflowTreeRendererTreeColumn: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			var metadata = parameters.metadata,
				record = parameters.record;

			if (
				Ext.isObject(metadata) && !Ext.Object.isEmpty(metadata)
				&& Ext.isObject(record) && !Ext.Object.isEmpty(record)
				&& !record.parentNode.isRoot()
			) {
				// Apply colspan property to be visually equal to old grid
				metadata.tdAttr = 'colspan="' + this.view.columns.length + '"' ;

				// Build activities node description
				var activityMetadata = record.get(CMDBuild.core.constants.Proxy.ACTIVITY_METADATA),
					description = '<b>'+ record.get(CMDBuild.core.constants.Proxy.ACTIVITY_PERFORMER_NAME) + ':</b> '
						+ record.get(CMDBuild.core.constants.Proxy.ACTIVITY_DESCRIPTION);

				if (Ext.isArray(activityMetadata) && !Ext.isEmpty(activityMetadata))
					Ext.Array.forEach(activityMetadata, function (metadataObject, i, allMetadataObjects) {
						if (Ext.isObject(metadataObject) && !Ext.Object.isEmpty(metadataObject))
							switch (metadataObject[CMDBuild.core.constants.Proxy.NAME]) {
								case CMDBuild.core.constants.Metadata.getAdditionalActivityLabel(): {
									if (!Ext.isEmpty(record.get(metadataObject[CMDBuild.core.constants.Proxy.VALUE])))
										description += this.workflowTreeRendererTreeColumnManageMetadataAdditionalActivityLabel(
											record.get(metadataObject[CMDBuild.core.constants.Proxy.VALUE])
										);
								} break;
							}
					}, this);

				return description;
			}

			return parameters.value;
		},

		/**
		 * @param {Object or String} additionalLabelValue
		 *
		 * @returns {String}
		 *
		 * @private
		 */
		workflowTreeRendererTreeColumnManageMetadataAdditionalActivityLabel: function (additionalLabelValue) {
			switch (Ext.typeOf(additionalLabelValue)) {
				case 'object':
					if (!Ext.Object.isEmpty(additionalLabelValue))
						if (Ext.isString(additionalLabelValue[CMDBuild.core.constants.Proxy.DESCRIPTION]) && !Ext.isEmpty(additionalLabelValue[CMDBuild.core.constants.Proxy.DESCRIPTION])) {
							return ' - ' + additionalLabelValue[CMDBuild.core.constants.Proxy.DESCRIPTION];
						} else if (Ext.isNumber(additionalLabelValue[CMDBuild.core.constants.Proxy.ID]) && !Ext.isEmpty(additionalLabelValue[CMDBuild.core.constants.Proxy.ID])) {
							return ' - ' + additionalLabelValue[CMDBuild.core.constants.Proxy.ID];
						}

				case 'string':
				default:
					if (!Ext.isEmpty(additionalLabelValue))
						return ' - ' + additionalLabelValue;
			}

			return '';
		},

		/**
		 * @returns {Void}
		 */
		workflowTreeReset: function () {
			this.view.getSelectionModel().deselectAll();

			this.cmfg('workflowSelectedActivityReset');

			_CMWFState.setProcessInstanceSynchronous(Ext.create('CMDBuild.model.CMProcessInstance', this.cmfg('workflowSelectedInstanceGet', 'rawData')));
		},

		/**
		 * @returns {Ext.data.TreeStore}
		 */
		workflowTreeStoreGet: function () {
			return this.view.getStore();
		},

		/**
		 * On load action sends by default node parameter witch isn't managed by server
		 * Manages store configurations like: filter, sorters, attributes, class name and state (flowStatus)
		 *
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Boolean} parameters.disableFirstRowSelection
		 * @param {Number} parameters.page
		 * @param {Object} parameters.params - additional load custom parameters
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 */
		workflowTreeStoreLoad: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.callback = Ext.isFunction(parameters.callback) ? parameters.callback : undefined;
			parameters.disableFirstRowSelection = Ext.isBoolean(parameters.disableFirstRowSelection) ? parameters.disableFirstRowSelection : false;
			parameters.page = Ext.isNumber(parameters.page) ? parameters.page : 1;

			// Error handling
				if (this.cmfg('workflowSelectedWorkflowIsEmpty'))
					return _error('workflowTreeStoreLoad(): selected workflow object empty', this, this.cmfg('workflowSelectedWorkflowGet'));
			// END: Error handling

			// Manage callback
			if (!parameters.disableFirstRowSelection)
				parameters.callback = Ext.isEmpty(parameters.callback) ? this.selectFirst : parameters.callback;

			this.cmfg('workflowTreeStoreGet').getRootNode().removeAll();

			var params = Ext.isObject(parameters.params) ? parameters.params : {};
			params[CMDBuild.core.constants.Proxy.ATTRIBUTES] = Ext.encode(this.displayedParametersNamesGet());
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('workflowSelectedWorkflowGet', CMDBuild.core.constants.Proxy.NAME);
			params[CMDBuild.core.constants.Proxy.STATE] = this.controllerToolbarTop.cmfg('workflowTreeToolbarTopStatusValueGet');

			if (!this.workflowTreeAppliedFilterIsEmpty())
				params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode(this.cmfg('workflowTreeAppliedFilterGet', CMDBuild.core.constants.Proxy.CONFIGURATION));

			this.storeExtraParamsSet(params); // Setup extraParams to work also with sorters and print report

			if (this.cmfg('workflowTreeStoreGet').isLoading() && !Ext.isEmpty(this.lastLoadCall)) // Avoid store load overlapping: abort last load call to
				Ext.Ajax.abort(this.lastLoadCall);

			this.cmfg('workflowTreeStoreGet').loadPage(parameters.page, {
				params: params,
				scope: Ext.isEmpty(parameters.scope) ? this : parameters.scope,
				callback: this.buildLoadCallback(parameters.callback)
			});

			this.lastLoadCall = Ext.Ajax.getLatest(); // Avoid store load overlapping: save Ajax load call object
		},

		/**
		 * @returns {Integer}
		 */
		workflowTreeGetFirstNodeId: function () {
			var tree = this.getView().getStore().tree;
			var firstChild = tree.getRootNode().getChildAt(0);
			if (firstChild) {
				return firstChild.get("cardId");
			}
			return ;
		}
	});

})();

(function () {

	/**
	 * @link CMDBuild.controller.management.classes.CMModCardSubController
	 * @link CMDBuild.controller.management.classes.CMCardRelationsController
	 * @link CMDBuild.controller.management.workflow.CMActivityRelationsController
	 *
	 * @legacy
	 */
	Ext.define('CMDBuild.controller.management.workflow.panel.form.tabs.Relations', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.management.workflow.panel.form.tabs.Relations'
		],

		mixins: {
			observable: "Ext.util.Observable",
			wfStateDelegate: 'CMDBuild.state.CMWorkflowStateDelegate'
		},

		/**
		 * @cfg {CMDBuild.controller.management.workflow.panel.form.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @property {CMDBuild.controller.common.panel.module.attachment.Window}
		 */
		controllerWindowAttachment: undefined,

		/**
		 * @property {CMDBuild.view.management.workflow.panel.form.tabs.relations.RelationsView}
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

			this.view = Ext.create('CMDBuild.view.management.workflow.panel.form.tabs.relations.RelationsView', { delegate: this });

			this.mixins.observable.constructor.call(this, arguments);

			this.card = null;
			this.entryType = null;

			this.callBacks = {
				'action-relation-go': this.onFollowRelationClick,
				'action-relation-editcard': this.onEditCardClick,
				'action-relation-viewcard': this.onViewCardClick,
				'action-relation-attach': this.onOpenAttachmentClick
			};

			this.view.getStore().getRootNode().on('append', function (node, newNode, index, eOpts) {
				// Nodes with depth == 1 are folders
				if (newNode.getDepth() == 1)
					newNode.on('expand', this.onDomainNodeExpand, this, { single: true });
			}, this);

			this.mon(this.view, this.view.CMEVENTS.openGraphClick, this.onShowGraphClick, this);
			this.mon(this.view, 'beforeitemclick', cellclickHandler, this);
			this.mon(this.view, 'itemdblclick', onItemDoubleclick, this);
			this.mon(this.view, 'activate', this.loadData, this);

			this.CMEVENTS = { serverOperationSuccess: 'cm-server-success' };

			this.addEvents(this.CMEVENTS.serverOperationSuccess);

			// Build sub-controllers
			this.controllerWindowAttachment = Ext.create('CMDBuild.controller.common.panel.module.attachment.Window', { parentDelegate: this });

			_CMWFState.addDelegate(this);
		},

		onAddCardClick: function () {
			this.view.disable();
		},

		/**
		 * @param {Object} pi
		 */
		updateForProcessInstance: function(pi) {
			this.card = pi;

			var classId = pi.getClassId();

			if (classId) {
				var entryType = _CMCache.getEntryTypeById(classId);

				if (this.lastEntryType != entryType) {
					if (!entryType || entryType.get(CMDBuild.core.constants.Proxy.TABLE_TYPE) == 'simpletable')
						entryType = null;

					this.lastEntryType = entryType;
				}
			}
		},

		/**
		 * @param {CMRelationPanelModel} node
		 * @param {CMRelationPanelModel} newNode
		 * @param {Number} index
		 * @param {Object} eOpts
		 *
		 * @private
		 */
		onDomainNodeExpand: function (node, newNode, index, eOpts) {
			if (node.get('relations_size') > CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.RELATION_LIMIT)) {
				node.removeAll();

				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.CARD_ID] = this.getCardId();
				parameters[CMDBuild.core.constants.Proxy.CLASS_NAME] = _CMCache.getEntryTypeNameById(this.getClassId());
				parameters[CMDBuild.core.constants.Proxy.DOMAIN_ID] = node.get('dom_id');
				parameters[CMDBuild.core.constants.Proxy.SRC] = node.get('src');

				this.view.setLoading(true);
				CMDBuild.proxy.management.workflow.panel.form.tabs.Relations.readAll({
					params: parameters,
					scope: this,
					success: function (response, options, decodedResponse) {
						this.view.setLoading(false);
						this.view.suspendLayouts();

						this.view.convertRelationInNodes(
							decodedResponse.domains[0].relations,
							node.data.dom_id,
							node.data.src,
							node.data,
							node
						);

						this.view.resumeLayouts(true);
					}
				});
			}
		},

		// wfStateDelegate
		onProcessClassRefChange: function(entryType) {
			this.view.disable();
			this.view.clearStore();
		},

		onProcessInstanceChange: function(processInstance) {
			if (processInstance && processInstance.isNew()) {
				this.onProcessClassRefChange();
			} else {
				this.updateForProcessInstance(processInstance);

				this.view.enable();
				this.loadData();
			}
		},

		onActivityInstanceChange: Ext.emptyFn,

		reset: function () {
			this.view.clearStore();
			this.view.disable();
		},

		/**
		 * @return {Int} cardId
		 */
		getCardId: function() {
			return this.card.get('id');
		},

		/**
		 * @return {Int} classId
		 */
		getClassId: function() {
			return this.card.get('classId');
		},

		/**
		 * @param {CMRelationPanelModel} model
		 */
		onFollowRelationClick: function(model) {
			if (model.getDepth() > 1)
				CMDBuild.global.controller.MainViewport.cmfg('mainViewportCardSelect', {
					Id: String(model.get('dst_id')),
					IdClass: String(model.get('dst_cid'))
				});
		},

		/**
		 * @param {Object} entryType - card model
		 */
		updateCurrentClass: function(card) {
			var classId = card.get('IdClass');
			var currentClass = _CMCache.getEntryTypeById(classId);

			if (this.currentClass != currentClass) {
				if (!currentClass || currentClass.get(CMDBuild.core.constants.Proxy.TABLE_TYPE) == 'simpletable')
					currentClass = null;

				this.currentClass = currentClass;
			}
		},

		/**
		 * Function to load data to treePanel and edit addRelation button to avoid to violate domains cardinality
		 */
		loadData: function() {
			var pi = _CMWFState.getProcessInstance();

			if (pi != null && tabIsActive(this.view)) {
				var el = this.view.getEl();

				if (el)
					el.mask();

				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.CARD_ID] =  pi.getId();
				parameters[CMDBuild.core.constants.Proxy.CLASS_NAME] = _CMCache.getEntryTypeNameById(pi.getClassId());
				parameters['domainlimit'] = CMDBuild.configuration.instance.get(CMDBuild.core.constants.Proxy.RELATION_LIMIT);

				CMDBuild.proxy.management.workflow.panel.form.tabs.Relations.readAll({
					params: parameters,
					scope: this,
					success: function(result, options, decodedResult) {
						el.unmask();
						this.view.suspendLayouts();
						this.view.fillWithData(decodedResult.domains);
						this.view.resumeLayouts(true);
					}
				});
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @legacy
		 */
		onAddCardButtonClick: function (classIdOfNewCard) {
			this.view.disable();
			this.view.clearStore();
		},

		onShowGraphClick: function() {
			Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.graph.Window', {
				parentDelegate: this,
				classId: this.card.get("IdClass"),
				cardId: this.card.get("Id")
			});
		},

		onCloneCard: function() {
			if (this.view) {
				this.view.disable();
			}
		},

		/**
		 * @param {CMRelationPanelModel} model
		 */
		onEditCardClick: function(model) {
			openCardWindow.call(this, model, true);
		},

		/**
		 * @param {CMRelationPanelModel} model
		 */
		onViewCardClick: function(model) {
			openCardWindow.call(this, model, false);
		},

		/**
		 * @param {CMRelationPanelModel} model
		 *
		 * @returns {Void}
		 */
		onOpenAttachmentClick: function (model) {
			// Error handling
				if (!Ext.isObject(model) || Ext.Object.isEmpty(model))
					return _error('onOpenAttachmentClick(): unmanaged model parameter', this, model);
			// END: Error handling

			this.controllerWindowAttachment.cmfg('panelModuleAttachmentWindowConfigureAndShow', {
				entityId: model.get('dst_cid'),
				id: model.get('dst_id')
			});
		}
	});

	function openCardWindow(model, editable) {
		var w = Ext.create('CMDBuild.view.management.common.CMCardWindow', {
			cmEditMode: editable,
			withButtons: editable,
			title: model.get(CMDBuild.core.constants.Proxy.LABEL) + ' - ' + model.get('dst_desc')
		});

		if (editable) {
			w.on('destroy', function() {
				// cause the reload of the main card-grid, it is needed for the case in which I'm editing the target card
				this.fireEvent(this.CMEVENTS.serverOperationSuccess);
				this.loadData();
			}, this, {single: true});
		}

		new CMDBuild.controller.management.common.CMCardWindowController(w, {
			entryType: model.get('dst_cid'), // classid of the destination
			card: model.get('dst_id'), // id of the card destination
			cmEditMode: editable
		});

		w.show();
	}

	function tabIsActive(t) {
		return t.ownerCt.layout.getActiveItem().id == t.id;
	}

	function cellclickHandler(grid, model, htmlelement, rowIndex, event, opt) {
		var className = event.target.className;

		if (this.callBacks[className])
			this.callBacks[className].call(this, model);
	}

	function onItemDoubleclick(grid, model, html, index, e, options) {
		this.onFollowRelationClick(model);
	}

	// Define who is the master
	function getMasterAndSlave(source) {
		var out = {};
		if (source == '_1') {
			out.slaveSide = '_2';
			out.masterSide = '_1';
		} else {
			out.slaveSide = '_1';
			out.masterSide = '_2';
		}

		return out;
	}

})();

(function () {

	/**
	 * @abstract
	 */
	Ext.define('CMDBuild.controller.administration.taskManager.task.Abstract', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.administration.taskManager.Form}
		 */
		parentDelegate: undefined,

		/**
		 * @returns {Void}
		 *
		 * @abstract
		 *
		 * FIXME: waiting for refactor (CMDBuild.view.common.PanelFunctions)
		 */
		onTaskManagerFormTaskAbortButtonClick: function () {
			if (!this.cmfg('taskManagerSelectedTaskIsEmpty')) {
				this.cmfg('onTaskManagerFormTaskRowSelected');
			} else {
				this.cmfg('taskManagerFormViewReset');
				this.cmfg('taskManagerFormPanelForwarder', { functionName: 'disableModify' });
				this.cmfg('onTaskManagerFormNavigationButtonClick', 'first');
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @abstract
		 *
		 * FIXME: waiting for refactor (CMDBuild.view.common.PanelFunctions)
		 */
		onTaskManagerFormTaskAddButtonClick: function () {
			this.cmfg('taskManagerFormPanelForwarder', { functionName: 'enableTabbedModify' });
			this.controllerStep1.setDisabledTypeField(true);
			this.cmfg('onTaskManagerFormNavigationButtonClick', 'first');
		},

		/**
		 * @returns {Void}
		 *
		 * @abstract
		 *
		 * FIXME: waiting for refactor (CMDBuild.view.common.PanelFunctions)
		 */
		onTaskManagerFormTaskCloneButtonClick: function () {
			this.controllerStep1.setValueId();
			this.cmfg('taskManagerFormPanelForwarder', { functionName: 'disableCMTbar' });
			this.cmfg('taskManagerFormPanelForwarder', { functionName: 'enableCMButtons' });
			this.cmfg('taskManagerFormPanelForwarder', { functionName: 'enableTabbedModify', params: true });
			this.controllerStep1.setDisabledTypeField(true);
			this.cmfg('onTaskManagerFormNavigationButtonClick', 'first');
		},

		/**
		 * @returns {Void}
		 *
		 * @abstract
		 *
		 * FIXME: waiting for refactor (CMDBuild.view.common.PanelFunctions)
		 */
		onTaskManagerFormTaskModifyButtonClick: function () {
			this.cmfg('taskManagerFormPanelForwarder', { functionName: 'disableCMTbar' });
			this.cmfg('taskManagerFormPanelForwarder', { functionName: 'enableCMButtons' });
			this.cmfg('taskManagerFormPanelForwarder', { functionName: 'enableTabbedModify', params: true });
			this.controllerStep1.setDisabledTypeField(true);
			this.cmfg('onTaskManagerFormNavigationButtonClick', 'first');
		},

		/**
		 * @returns {Void}
		 */
		onTaskManagerFormTaskRemoveButtonClick: function () {
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
		 *
		 * @abstract
		 */
		onTaskManagerFormTaskRowSelected: function () {
			this.cmfg('taskManagerFormToolbarTopStateManage');
			this.cmfg('taskManagerExternalServicesFormStateManager'); // External services endpoint to correctly set form state
		},

		/**
		 * @returns {Void}
		 *
		 * @abstract
		 */
		onTaskManagerFormTaskSaveButtonClick: Ext.emptyFn,

		/**
		 * @returns {Void}
		 *
		 * @abstract
		 */
		removeItem: Ext.emptyFn,

		/**
		 * @param {Object} response
		 * @param {Object} options
		 * @param {Object} decodedResponse
		 *
		 * @returns {Void}
		 */
		success: function (response, options, decodedResponse) {
			decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

			this.cmfg('taskManagerStoreLoad', {
				scope: this,
				callback: function (records, operation, success) {
					this.cmfg('taskManagerClearSelection');
					this.cmfg('taskManagerRecordSelect', Ext.isEmpty(decodedResponse) ? this.controllerStep1.getValueId() : decodedResponse);

					if (this.cmfg('taskManagerSelectedTaskIsEmpty'))
						this.cmfg('taskManagerFormPanelForwarder', {
							functionName: 'disableModify',
							params: true
						});
				}
			});

			this.cmfg('taskManagerFormPanelForwarder', {
				functionName: 'disableModify',
				params: true
			});

			this.cmfg('onTaskManagerFormNavigationButtonClick', 'first');
		},

		/**
		 * @param {Boolean} enableValidation
		 *
		 * @return {Boolean}
		 *
		 * @override
		 */
		validate: function (enableValidation) {
			return this.callParent([this.cmfg('taskManagerFormViewGet')]);
		}
	});

})();

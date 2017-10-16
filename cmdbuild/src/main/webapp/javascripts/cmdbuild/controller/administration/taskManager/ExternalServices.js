(function () {

	Ext.define('CMDBuild.controller.administration.taskManager.ExternalServices', {

		/**
		 * @property {String}
		 *
		 * @private
		 */
		formState: undefined,

		/**
		 * @property {Array}
		 *
		 * @private
		 */
		managedFormStates: ['editMode'],

		// FormState property methods
			/**
			 * @returns {String}
			 *
			 * @private
			 */
			formStateGet: function () {
				return this.formState;
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			formStateReset: function () {
				this.formState = null;;
			},

			/**
			 * @param {String} state
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			formStateSet: function (state) {
				if (
					Ext.isString(state) && !Ext.isEmpty(state)
					&& Ext.Array.contains(this.managedFormStates, state)
				) {
					this.formState = state;
				}
			},

		/**
		 * @param {Object} parameters
		 * @param {Object} parameters.type
		 *
		 * @returns {Void}
		 */
		taskManagerExternalServicesAddButtonClick: function (parameters) {
			if (
				Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)
				&& Ext.isArray(parameters.type) && !Ext.isEmpty(parameters.type)
				&& this.cmfg('mainViewportAccordionControllerExists', this.identifierGet())
			) {
				var accordionController = this.cmfg('mainViewportAccordionControllerGet', this.identifierGet()),
					targetAccordionNode = accordionController.cmfg('accordionNodeByIdGet', 'accordion-taskManager-workflow');

				Ext.apply(accordionController, {
					disableSelection: true,
					scope: this,
					callback: function () {
						accordionController.cmfg('accordionDeselect');

						// Select workflow task accordion node silently
						accordionController.cmfg('accordionNodeByIdSelect', {
							mode: 'silently',
							id: 'accordion-taskManager-workflow'
						});

						// Load grid store
						this.controllerGrid.cmfg('taskManagerGridConfigure', {
							type: parameters.type,
							storeLoadParameters: {
								scope: this,
								callback: function (records, operation, success) {
									this.controllerForm.cmfg('onTaskManagerFormAddButtonClick', parameters.type); // Setup form in add mode
								}
							}
						});

						this.configureAddButton(targetAccordionNode.get(CMDBuild.core.constants.Proxy.SECTION_HIERARCHY));

						this.setViewTitle(targetAccordionNode.get(CMDBuild.core.constants.Proxy.TEXT));
					}
				});

				accordionController.cmfg('accordionExpand');
			} else {
				_error('taskManagerExternalExecutionAddButtonClick(): wrong parameters object', this, parameters);
			}
		},

		/**
		 * Manage form state after all load and fill routines
		 *
		 * @returns {Void}
		 */
		taskManagerExternalServicesFormStateManager: function () {
			if (!Ext.isEmpty(this.formStateGet()) && this.formStateGet() == 'editMode')
				this.controllerForm.cmfg('onTaskManagerFormModifyButtonClick');

			this.formStateReset();
		},

		/**
		 * Foreign services item double click only selects row
		 *
		 * @param {Object} parameters
		 * @param {Number} parameters.id
		 * @param {Object} parameters.type
		 *
		 * @returns {Void}
		 */
		taskManagerExternalServicesItemDoubleClick: function (parameters) {
			if (
				Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)
				&& Ext.isNumber(parameters.id) && !Ext.isEmpty(parameters.id)
				&& Ext.isArray(parameters.type) && !Ext.isEmpty(parameters.type)
				&& this.cmfg('mainViewportAccordionControllerExists', this.identifierGet())
			) {
				var accordionController = this.cmfg('mainViewportAccordionControllerGet', this.identifierGet()),
					targetAccordionNode = accordionController.cmfg('accordionNodeByIdGet', 'accordion-taskManager-workflow');

				Ext.apply(accordionController, {
					disableSelection: true,
					scope: this,
					callback: function () {
						accordionController.cmfg('accordionDeselect');

						// Select workflow task accordion node silently
						accordionController.cmfg('accordionNodeByIdSelect', {
							mode: 'silently',
							id: 'accordion-taskManager-workflow'
						});

						// Load grid store
						this.controllerGrid.cmfg('taskManagerGridConfigure', {
							type: parameters.type,
							storeLoadParameters: {
								scope: this,
								callback: function (records, operation, success) {
									this.cmfg('taskManagerRecordSelect', parameters.id);
								}
							}
						});

						this.configureAddButton(targetAccordionNode.get(CMDBuild.core.constants.Proxy.SECTION_HIERARCHY));

						this.setViewTitle(targetAccordionNode.get(CMDBuild.core.constants.Proxy.TEXT));
					}
				});

				accordionController.cmfg('accordionExpand');
			} else {
				_error('taskManagerExternalServicesItemDoubleClick(): wrong parameters object', this, parameters);
			}
		},

		/**
		 * @param {Object} parameters
		 * @param {Number} parameters.id
		 * @param {Object} parameters.type
		 *
		 * @returns {Void}
		 */
		taskManagerExternalServicesModifyButtonClick: function (parameters) {
			if (
				Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)
				&& Ext.isNumber(parameters.id) && !Ext.isEmpty(parameters.id)
				&& Ext.isArray(parameters.type) && !Ext.isEmpty(parameters.type)
				&& this.cmfg('mainViewportAccordionControllerExists', this.identifierGet())
			) {
				var accordionController = this.cmfg('mainViewportAccordionControllerGet', this.identifierGet()),
					targetAccordionNode = accordionController.cmfg('accordionNodeByIdGet', 'accordion-taskManager-workflow');

				Ext.apply(accordionController, {
					disableSelection: true,
					scope: this,
					callback: function () {
						accordionController.cmfg('accordionDeselect');

						// Select workflow task accordion node silently
						accordionController.cmfg('accordionNodeByIdSelect', {
							mode: 'silently',
							id: 'accordion-taskManager-workflow'
						});

						// Load grid store
						this.controllerGrid.cmfg('taskManagerGridConfigure', {
							type: parameters.type,
							storeLoadParameters: {
								scope: this,
								callback: function (records, operation, success) {
									this.cmfg('taskManagerRecordSelect', parameters.id);

									this.formStateSet('editMode');
								}
							}
						});

						this.configureAddButton(targetAccordionNode.get(CMDBuild.core.constants.Proxy.SECTION_HIERARCHY));

						this.setViewTitle(targetAccordionNode.get(CMDBuild.core.constants.Proxy.TEXT));
					}
				});

				accordionController.cmfg('accordionExpand');
			} else {
				_error('taskManagerExternalServicesItemDoubleClick(): wrong parameters object', this, parameters);
			}
		}
	});

})();

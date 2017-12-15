(function () {

	Ext.define('CMDBuild.controller.management.classes.panel.form.tabs.card.toolbar.Top', {
		extend: 'CMDBuild.controller.common.panel.module.form.toolbar.Top',

		/**
		 * @cfg {CMDBuild.controller.management.classes.panel.form.tabs.card.Tab}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'classesFormTabCardToolbarTopUiUpdate',
			'onClassesFormTabCardToolbarTopCloneButtonClick',
			'onClassesFormTabCardToolbarTopGraphButtonClick',
			'onClassesFormTabCardToolbarTopModifyButtonClick',
			'panelGridAndFormMixinsToolbarFunctionsDisabledStateSet = classesFormTabCardToolbarTopFunctionsDisabledStateSet, panelModuleFormPanelToolbarTopDisabledStateSet',
			'panelModuleFormToolbarTopReset'
		],

		/**
		 * Definitions of all sub controller classes names
		 *
		 * @cfg {Object}
		 */
		subClassesNames: {
			view: 'CMDBuild.view.management.classes.panel.form.tabs.card.toolbar.TopView'
		},

		/**
		 * @cfg {CMDBuild.view.management.classes.panel.form.tabs.card.toolbar.TopView}
		 */
		view: undefined,

		/**
		 * @returns {Void}
		 */
		classesFormTabCardToolbarTopUiUpdate: function () {
			switch (this.cmfg('panelGridAndFormViewModeGet')) {
				case 'add':
				case 'clone':
				case 'edit':
					return this.cmfg('classesFormTabCardToolbarTopFunctionsDisabledStateSet', {
						state: !this.cmfg('panelGridAndFormSelectedEntityIsEmpty') || !this.cmfg('panelGridAndFormSelectedItemIsEmpty')
					});

				case 'read':
				case 'readOnly':
				default: {
					this.cmfg('classesFormTabCardToolbarTopFunctionsDisabledStateSet', {
						state: (
							this.cmfg('panelGridAndFormSelectedEntityIsEmpty')
							|| this.cmfg('panelGridAndFormSelectedItemIsEmpty')
							|| !this.cmfg('panelGridAndFormSelectedEntityGet', [CMDBuild.core.constants.Proxy.PERMISSIONS, CMDBuild.core.constants.Proxy.WRITE])
						)
					});

					this.view.buttonClone.setDisabled(this.cmfg('panelGridAndFormSelectedEntityGet', [CMDBuild.core.constants.Proxy.CAPABILITIES, CMDBuild.core.constants.Proxy.CLONE_DISABLED]));
					this.view.buttonModify.setDisabled(this.cmfg('panelGridAndFormSelectedEntityGet', [CMDBuild.core.constants.Proxy.CAPABILITIES, CMDBuild.core.constants.Proxy.MODIFY_DISABLED]));
			
					var isWritable = this.cmfg('classesFormTabCardSelectedItemIsWritable');
					if (!isWritable) {
						this.view.buttonModify.setDisabled(true);
					}

					this.view.buttonRelationGraph.setDisabled(!CMDBuild.configuration.graph.get(CMDBuild.core.constants.Proxy.ENABLED));
					this.view.buttonRemove.setDisabled(this.cmfg('panelGridAndFormSelectedEntityGet', [CMDBuild.core.constants.Proxy.CAPABILITIES, CMDBuild.core.constants.Proxy.DELETE_DISABLED]));
				}
			}
		},

		/**
		 * @returns {Void}
		 */
		onClassesFormTabCardToolbarTopCloneButtonClick: function () {
			var params = {};
			params[CMDBuild.core.constants.Proxy.FULL_SCREEN] = 'bottom';
			params[CMDBuild.core.constants.Proxy.VIEW_MODE] = 'clone';

			if (!this.cmfg('classesFormTabCardSelectedEntityIsEmpty'))
				params[CMDBuild.core.constants.Proxy.ENTITY_NAME] = this.cmfg('classesFormTabCardSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);

			if (!this.cmfg('classesFormTabCardSelectedItemIsEmpty')) {
				params[CMDBuild.core.constants.Proxy.ITEM_ENTITY_NAME] = this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ENTITY_NAME);
				params[CMDBuild.core.constants.Proxy.ITEM_ID] = this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ID);
			}

			this.cmfg('classesFormTabCardUiUpdate', params);
		},

		/**
		 * @returns {Void}
		 */
		onClassesFormTabCardToolbarTopGraphButtonClick: function () {
			// Error handling
				if (this.cmfg('classesFormTabCardSelectedItemIsEmpty'))
					return _error('onClassesFormTabCardToolbarTopGraphButtonClick(): unmanaged selectedItem parameter', this, this.cmfg('classesFormTabCardSelectedItemGet'));
			// END: Error handling

			Ext.create('CMDBuild.controller.common.panel.gridAndForm.panel.common.graph.Window', {
				parentDelegate: this,
				cardId: this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ID),
				classId: this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ENTITY_ID)
			});
		},

		/**
		 * @returns {Void}
		 */
		onClassesFormTabCardToolbarTopModifyButtonClick: function () {
			var params = {};
			params[CMDBuild.core.constants.Proxy.FULL_SCREEN] = 'bottom';
			params[CMDBuild.core.constants.Proxy.VIEW_MODE] = 'edit';

			if (!this.cmfg('classesFormTabCardSelectedEntityIsEmpty'))
				params[CMDBuild.core.constants.Proxy.ENTITY_NAME] = this.cmfg('classesFormTabCardSelectedEntityGet', CMDBuild.core.constants.Proxy.NAME);

			if (!this.cmfg('classesFormTabCardSelectedItemIsEmpty')) {
				params[CMDBuild.core.constants.Proxy.ITEM_ENTITY_NAME] = this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ENTITY_NAME);
				params[CMDBuild.core.constants.Proxy.ITEM_ID] = this.cmfg('classesFormTabCardSelectedItemGet', CMDBuild.core.constants.Proxy.ID);
			}

			this.cmfg('classesFormTabCardUiUpdate', params);
		}
	});

})();

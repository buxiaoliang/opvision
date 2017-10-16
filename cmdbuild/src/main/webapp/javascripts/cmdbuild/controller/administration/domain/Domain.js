(function () {

	/**
	 * NOTE: this class have a custom behavour that synchronyze Modify/Abort actions of Properties and Enabled classes tabs
	 */
	Ext.define('CMDBuild.controller.administration.domain.Domain', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.administration.domain.Domain',
			'CMDBuild.view.common.field.translatable.Utils'
		],

		mixins: ['CMDBuild.controller.administration.domain.ExternalServices'],

		/**
		 * @cfg {CMDBuild.controller.common.MainViewport}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'domainExternalServicesAddButtonClick',
			'domainExternalServicesItemDoubleClick',
			'domainExternalServicesModifyButtonClick',
			'domainSelectedDomainGet',
			'domainSelectedDomainIsEmpty',
			'identifierGet = domainIdentifierGet',
			'onDomainAbortButtonClick',
			'onDomainAddButtonClick',
			'onDomainDomainSelected -> controllerAttributes, controllerEnabledClasses, controllerProperties',
			'onDomainModifyButtonClick',
			'onDomainModuleInit = onModuleInit',
			'onDomainRemoveButtonClick',
			'onDomainSaveButtonClick'
		],

		/**
		 * @property {CMDBuild.controller.administration.domain.tabs.CMAttributes}
		 */
		controllerAttributes: undefined,

		/**
		 * @property {CMDBuild.controller.administration.domain.tabs.EnabledClasses}
		 */
		controllerEnabledClasses: undefined,

		/**
		 * @property {CMDBuild.controller.administration.domain.tabs.Properties}
		 */
		controllerProperties: undefined,

		/**
		 * @cfg {String}
		 */
		identifier: undefined,

		/**
		 * @property {CMDBuild.model.administration.domain.Domain}
		 *
		 * @private
		 */
		selectedDomain: undefined,

		/**
		 * @property {Ext.tab.Panel}
		 */
		tabPanel: undefined,

		/**
		 * @property {CMDBuild.view.administration.domain.DomainView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.common.MainViewport} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.domain.DomainView', { delegate: this });

			// Build sub-controllers
			this.controllerAttributes = Ext.create('CMDBuild.controller.administration.domain.tabs.CMAttributes', { parentDelegate: this }); // FIXME: legacy
			this.controllerEnabledClasses = Ext.create('CMDBuild.controller.administration.domain.tabs.EnabledClasses', { parentDelegate: this });
			this.controllerProperties = Ext.create('CMDBuild.controller.administration.domain.tabs.Properties', { parentDelegate: this });

			// Shorthands
			this.tabPanel = this.view.tabPanel;

			// Inject tabs (sorted)
			this.tabPanel.add([
				this.controllerProperties.getView(),
				this.controllerEnabledClasses.getView(),
				this.controllerAttributes.getView() // FIXME: legacy
			]);
		},

		/**
		 * Forwarder method
		 *
		 * @returns {Void}
		 */
		onDomainAbortButtonClick: function () {
			this.controllerEnabledClasses.cmfg('onDomainTabEnabledClassesAbortButtonClick');
			this.controllerProperties.cmfg('onDomainTabPropertiesAbortButtonClick');
		},

		/**
		 * @returns {Void}
		 */
		onDomainAddButtonClick: function () {
			this.tabPanel.setActiveTab(0);

			this.cmfg('mainViewportAccordionDeselect', this.cmfg('domainIdentifierGet'));
			this.domainSelectedDomainReset();

			this.setViewTitle();

			// Forward to sub-controllers
			this.controllerAttributes.cmfg('onDomainTabAttributesAddButtonClick'); // FIXME: legacy
			this.controllerEnabledClasses.cmfg('onDomainTabEnabledClassesAddButtonClick');
			this.controllerProperties.cmfg('onDomainTabPropertiesAddButtonClick');
		},

		/**
		 * Method forwarder
		 *
		 * @returns {Void}
		 */
		onDomainModifyButtonClick: function () {
			this.controllerEnabledClasses.cmfg('onDomainTabEnabledClassesModifyButtonClick');
			this.controllerProperties.cmfg('onDomainTabPropertiesModifyButtonClick');
		},

		/**
		 * Setup view items and controllers on accordion click
		 *
		 * @param {CMDBuild.model.common.Accordion} node
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		onDomainModuleInit: function (node) {
			this.domainSelectedDomainReset();

			if (Ext.isObject(node) && !Ext.Object.isEmpty(node)) {
				CMDBuild.proxy.administration.domain.Domain.read({ // FIXME: waiting for refactor (server endpoint)
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.DOMAINS];

						if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
							var selectedDomain = Ext.Array.findBy(decodedResponse, function (domainObject, i) {
								return node.get(CMDBuild.core.constants.Proxy.ENTITY_ID) == domainObject[CMDBuild.core.constants.Proxy.ID_DOMAIN];
							}, this);

							if (Ext.isObject(selectedDomain) && !Ext.Object.isEmpty(selectedDomain)) {
								this.domainSelectedDomainSet({ value: selectedDomain });

								this.setViewTitle(node.get(CMDBuild.core.constants.Proxy.TEXT));
							} else {
								_error('onDomainModuleInit(): domain not found', this, node.get(CMDBuild.core.constants.Proxy.ENTITY_ID));
							}
						}

						this.cmfg('onDomainDomainSelected');

						// Manage tab selection
						if (Ext.isEmpty(this.tabPanel.getActiveTab()))
							this.tabPanel.setActiveTab(0);

						this.tabPanel.getActiveTab().fireEvent('show'); // Manual show event fire because was already selected

						this.onModuleInit(node); // Custom callParent() implementation
					}
				});
			} else {
				this.cmfg('onDomainDomainSelected');

				// Manage tab selection
				if (Ext.isEmpty(this.tabPanel.getActiveTab()))
					this.tabPanel.setActiveTab(0);

				this.tabPanel.getActiveTab().fireEvent('show'); // Manual show event fire because was already selected

				this.onModuleInit(node); // Custom callParent() implementation
			}
		},

		/**
		 * @returns {Void}
		 */
		onDomainRemoveButtonClick: function () {
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
		onDomainSaveButtonClick: function () {
			if (this.validate(this.controllerProperties.cmfg('domainTabPropertiesFormGet'))) {
				var formData = Ext.create('CMDBuild.model.administration.domain.Domain',
					Ext.Object.merge(
						this.controllerProperties.cmfg('domainTabPropertiesDataGet'),
						this.controllerEnabledClasses.cmfg('domainTabEnabledClassesDataGet')
					)
				);

				if (Ext.isEmpty(formData.get(CMDBuild.core.constants.Proxy.ID))) {
					CMDBuild.proxy.administration.domain.Domain.create({
						params: formData.getSubmitData(),
						scope: this,
						success: this.success
					});
				} else {
					CMDBuild.proxy.administration.domain.Domain.update({
						params: formData.getSubmitData(),
						scope: this,
						success: this.success
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
			if (!this.cmfg('domainSelectedDomainIsEmpty')) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.DOMAIN_NAME] = this.cmfg('domainSelectedDomainGet', CMDBuild.core.constants.Proxy.NAME);

				CMDBuild.proxy.administration.domain.Domain.remove({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						this.domainSelectedDomainReset();

						this.controllerProperties.cmfg('domainTabPropertiesFormGet').reset();
						this.controllerProperties.cmfg('domainTabPropertiesFormGet').setDisabledModify(true, true, true, true);

						this.cmfg('mainViewportAccordionDeselect', this.cmfg('domainIdentifierGet'));
						this.cmfg('mainViewportAccordionControllerUpdateStore', {
							identifier: this.cmfg('domainIdentifierGet'),
							params: {
								loadMask: true
							}
						});

						CMDBuild.core.Message.success();
					}
				});
			}
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
		success: function (response, options, decodedResponse) {
			decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.DOMAIN];

			CMDBuild.view.common.field.translatable.Utils.commit(this.controllerProperties.cmfg('domainTabPropertiesFormGet'));

			this.cmfg('mainViewportAccordionDeselect', this.cmfg('domainIdentifierGet'));
			this.cmfg('mainViewportAccordionControllerUpdateStore', {
				identifier: this.cmfg('domainIdentifierGet'),
				params: {
					loadMask: true,
					selectionId: decodedResponse[CMDBuild.core.constants.Proxy.ID_DOMAIN]
				}
			});

			CMDBuild.core.Message.success();
		},

		// SelectedDomain property methods
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			domainSelectedDomainGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedDomain';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			domainSelectedDomainIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedDomain';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			domainSelectedDomainReset: function () {
				this.propertyManageReset('selectedDomain');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @private
			 */
			domainSelectedDomainSet: function (parameters) {
				if (!Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.administration.domain.Domain';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedDomain';

					this.propertyManageSet(parameters);
				}
			}
	});

})();

(function () {

	/**
	 * @override
	 * @legacy
	 *
	 * FIXME: waiting for refactor
	 */
	Ext.define('CMDBuild.controller.management.classes.panel.form.tabs.Attachment', {
		extend: 'CMDBuild.controller.common.panel.module.attachment.Tab',

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.ModuleIdentifiers',
			'CMDBuild.core.constants.Proxy'
		],

		mixins: {
			observable: 'Ext.util.Observable'
		},

		/**
		 * @cfg {CMDBuild.controller.management.classes.CMModCardController}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'classesFormTabAttachmentSelectedCardGet = panelGridAndFormSelectedItemGet',
			'classesFormTabAttachmentSelectedCardIsEmpty = panelGridAndFormSelectedItemIsEmpty',
			'classesFormTabAttachmentSelectedEntityGet = panelGridAndFormSelectedEntityGet',
			'classesFormTabAttachmentSelectedEntityIsEmpty = panelGridAndFormSelectedEntityIsEmpty',
			'classesFormTemplateResolverFormGet = panelGridAndFormPanelFormTemplateResolverFormGet',
			'classesIdentifierGet = panelGridAndFormIdentifierGet',
			'onClassesFormTabAttachmentShowCallback = onPanelModuleAttachmentTabShowCallback', // Public only for overriding reason
			'onPanelModuleAttachmentTabBackButtonClick',
			'onPanelModuleAttachmentTabShow = onClassesFormTabAttachmentShow',
			'panelModuleAttachmentTabReset = classesFormTabAttachmentReset'
		],

		/**
		 * @property {CMDBuild.model.management.classes.panel.form.tabs.attachment.SelectedCard}
		 *
		 * @private
		 */
		selectedCard: undefined,

		/**
		 * @returns {CMDBuild.model.management.classes.panel.form.tabs.attachment.entity.Entity}
		 *
		 * @private
		 */
		selectedEntity: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.management.classes.CMModCardController} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.mixins.observable.constructor.call(this, arguments);

			this.callParent(arguments);

			this.buildCardModuleStateDelegate();
		},

		/**
		 * @returns {Void}
		 */
		buildCardModuleStateDelegate: function () {
			var me = this;

			this.cardStateDelegate = new CMDBuild.state.CMCardModuleStateDelegate();

			this.cardStateDelegate.onEntryTypeDidChange = function (state, entryType) {
				me.onEntryTypeSelected(entryType);
			};

			this.cardStateDelegate.onModifyCardClick = function (state) {
				me.onModifyCardClick();
			};

			this.cardStateDelegate.onCardDidChange = function (state, card) {
				Ext.suspendLayouts();
				me.onCardSelected(card);
				Ext.resumeLayouts();
			};

			_CMCardModuleState.addDelegate(this.cardStateDelegate);

			if (this.view)
				this.mon(me.view, 'destroy', function (view) {
					_CMCardModuleState.removeDelegate(me.cardStateDelegate);

					delete me.cardStateDelegate;
				});
		},

		/**
		 * @returns {String}
		 */
		classesIdentifierGet: function () {
			return CMDBuild.core.constants.ModuleIdentifiers.getClasses();
		},

		// SelectedCard property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			classesFormTabAttachmentSelectedCardGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedCard';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			classesFormTabAttachmentSelectedCardIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedCard';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabAttachmentSelectedCardReset: function () {
				this.propertyManageReset('selectedCard');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabAttachmentSelectedCardSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.classes.panel.form.tabs.attachment.SelectedCard';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedCard';

					this.propertyManageSet(parameters);
				}
			},

		// SelectedEntryType property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 */
			classesFormTabAttachmentSelectedEntityGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntity';

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			classesFormTabAttachmentSelectedEntityIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntity';

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabAttachmentSelectedEntityReset: function () {
				return this.propertyManageReset('selectedEntity');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			classesFormTabAttachmentSelectedEntitySet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.management.classes.panel.form.tabs.attachment.entity.Entity';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedEntity';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @returns {Ext.form.Basic or null}
		 */
		classesFormTemplateResolverFormGet: function () {
			return this.parentDelegate.getFormForTemplateResolver();
		},

		/**
		 * @returns {Void}
		 *
		 * @public
		 */
		onAddCardButtonClick: function () {
			this.view.disable();
		},

		/**
		 * @returns {Void}
		 */
		onClassesFormTabAttachmentShowCallback: function () {
			this.grid.buttonAdd.setDisabled(
				!this.cmfg('panelGridAndFormSelectedEntityGet', [
					CMDBuild.core.constants.Proxy.PERMISSIONS,
					CMDBuild.core.constants.Proxy.WRITE
				])
			);

			this.controllerGrid.cmfg('panelModuleAttachmentGridStoreLoad');
		},

		/**
		 * @returns {Void}
		 *
		 * @public
		 */
		onCloneCard: function () {
			this.view.disable();
		},

		/**
		 * @param {Ext.data.Model} card
		 *
		 * @returns {Void}
		 *
		 * @public
		 */
		onCardSelected: function (card) {
			if (Ext.isObject(card) && !Ext.Object.isEmpty(card)) {
				this.classesFormTabAttachmentSelectedCardSet({ value: card.getData() });

				this.view.setDisabled(
					!CMDBuild.configuration.dms.get(CMDBuild.core.constants.Proxy.ENABLED)
					|| this.cmfg('classesFormTabAttachmentSelectedEntityIsEmpty')
					|| this.cmfg('classesFormTabAttachmentSelectedEntityGet', CMDBuild.core.constants.Proxy.TABLE_TYPE) == CMDBuild.core.constants.Global.getTableTypeSimpleTable()
				);

				if (this.view.isVisible())
					this.cmfg('onClassesFormTabAttachmentShow')
			}
		},

		/**
		 * @param {CMDBuild.cache.CMEntryTypeModel} entryType
		 *
		 * @returns {Void}
		 *
		 * @public
		 */
		onEntryTypeSelected: function (entryType) {
			if (Ext.isObject(entryType) && !Ext.Object.isEmpty(entryType)) {
				// Local variables reset
				this.classesFormTabAttachmentSelectedCardReset();
				this.classesFormTabAttachmentSelectedEntityReset();

				this.classesFormTabAttachmentSelectedEntitySet({ value: entryType.getData() });

				this.cmfg('classesFormTabAttachmentReset');
			}
		}
	});

})();

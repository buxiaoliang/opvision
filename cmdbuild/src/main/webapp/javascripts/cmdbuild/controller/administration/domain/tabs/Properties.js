(function () {

	/**
	 * NOTE: this class doesn't manage show event to read data because of module custom behaviour
	 */
	Ext.define('CMDBuild.controller.administration.domain.tabs.Properties', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.administration.domain.Domain}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'domainTabPropertiesDataGet',
			'domainTabPropertiesFormGet',
			'onDomainTabPropertiesAbortButtonClick',
			'onDomainTabPropertiesAddButtonClick',
			'onDomainTabPropertiesCardinalitySelect',
			'onDomainTabPropertiesDomainSelected = onDomainDomainSelected',
			'onDomainTabPropertiesMasterDetailCheckboxChange',
			'onDomainTabPropertiesModifyButtonClick',
			'onDomainTabPropertiesNameChange'
		],

		/**
		 * @property {CMDBuild.view.administration.domain.tabs.properties.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.administration.domain.tabs.properties.PropertiesView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.domain.Domain} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.domain.tabs.properties.PropertiesView', { delegate: this });

			// Shorthands
			this.form = this.view.form;
		},

		/**
		 * @returns {Object}
		 */
		domainTabPropertiesDataGet: function () {
			return this.form.getData(true);
		},

		/**
		 * @returns {CMDBuild.view.administration.domain.tabs.properties.FormPanel}
		 */
		domainTabPropertiesFormGet: function () {
			return this.form;
		},

		/**
		 * @returns {Void}
		 */
		onDomainTabPropertiesAbortButtonClick: function () {
			if (!this.cmfg('domainSelectedDomainIsEmpty')) {
				this.cmfg('onDomainTabPropertiesDomainSelected');
			} else {
				this.form.reset();
				this.form.setDisabledModify(true, true, true);
			}
		},

		/**
		 * @returns {Void}
		 */
		onDomainTabPropertiesAddButtonClick: function () {
			this.form.reset();
			this.form.loadRecord(Ext.create('CMDBuild.model.administration.domain.Domain'));
			this.form.setDisabledModify(false, true);

			this.cmfg('onDomainTabPropertiesCardinalitySelect'); // Execute cardinality selection event actions to disable masterDetailCheckbox
		},

		/**
		 * A domain could set MD only if the cardinality is '1:N' or 'N:1'
		 *
		 * @returns {Void}
		 */
		onDomainTabPropertiesCardinalitySelect: function () {
			var toDisable = (
				Ext.isEmpty(this.form.cardinalityCombo.getValue())
				|| this.form.cardinalityCombo.getValue() == '1:1'
				|| this.form.cardinalityCombo.getValue() == 'N:N'
			);

			this.form.masterDetailCheckbox.setDisabled(toDisable);

			// Uncheck if disabled
			if (toDisable)
				this.form.masterDetailCheckbox.setValue(!toDisable);
		},

		/**
		 * Enable/Disable tab on domain selection
		 *
		 * @returns {Void}
		 */
		onDomainTabPropertiesDomainSelected: function () {
			this.view.enable();

			this.form.reset();

			// Works also as show event
			if (!this.cmfg('domainSelectedDomainIsEmpty')) {
				this.form.loadRecord(this.cmfg('domainSelectedDomainGet'));
				this.form.setDisabledModify(true);
			}
		},

		/**
		 * Show the masterDetailLabel field only when the domain is setted as a masterDetail
		 *
		 * @returns {Void}
		 */
		onDomainTabPropertiesMasterDetailCheckboxChange: function () {
			if (this.form.masterDetailCheckbox.getValue()) {
				this.form.masterDetailLabel.show();
				this.form.masterDetailLabel.setDisabled(this.form.masterDetailCheckbox.isDisabled());
			} else {
				this.form.masterDetailLabel.hide();
				this.form.masterDetailLabel.disable();
			}
		},

		/**
		 * @returns {Void}
		 */
		onDomainTabPropertiesModifyButtonClick: function () {
			this.form.setDisabledModify(false);

			this.cmfg('onDomainTabPropertiesCardinalitySelect'); // Execute cardinality selection event actions to disable masterDetailCheckbox
		}
	});

})();

(function () {

	Ext.define('CMDBuild.view.common.field.comboBox.Icon', {
		extend: 'Ext.form.field.ComboBox',

		alias: 'widget.comboboxicon',

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @cfg {CMDBuild.controller.common.field.comboBox.Icon}
		 */
		delegate: undefined,

		editable: false,
		forceSelection: true,
		hideTrigger1: false,
		hideTrigger2: false,
		trigger1Cls: Ext.baseCSSPrefix + 'form-arrow-trigger',
		trigger2Cls: Ext.baseCSSPrefix + 'form-clear-trigger',

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				delegate: Ext.create('CMDBuild.controller.common.field.comboBox.Icon', { view: this }),
				tpl: new Ext.XTemplate(
					'<tpl for=".">'
						+ '<div class="x-boundlist-item x-combo-list-item cmdb-combobox-icon-list-item">'
							+ '<img src="{' + CMDBuild.core.constants.Proxy.PATH + '}" alt="{' + CMDBuild.core.constants.Proxy.DESCRIPTION + '}" />'
							+ '<span>{description}</span>'
						+ '</div>'
					+ '</tpl>'
				)
			});

			this.callParent(arguments);
		},

		/**
		 * Compatibility with template resolver.
		 * Used by the template resolver to know if a field is a combo and to take the value of multilevel lookup
		 *
		 * @returns {String}
		 */
		getReadableValue: function () {
			return this.getRawValue();
		},

		/**
		 * @returns {Void}
		 */
		onTrigger1Click: function () {
			this.delegate.cmfg('onFieldComboBoxIconTrigger1Click');
		},

		/**
		 * @returns {Void}
		 */
		onTrigger2Click: function () {
			this.delegate.cmfg('onFieldComboBoxIconTrigger2Click');
		}
	});

})();

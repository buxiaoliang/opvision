(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * Full workflow model
	 *
	 * @link CMDBuild.model.CMProcessInstance
	 * @link CMDBuild.model.classes.Class
	 */
	Ext.define('CMDBuild.model.management.workflow.Workflow', { // TODO: waiting for refactor (rename and structure)
		extend: 'Ext.data.Model',

		fields: [
			{ name: 'rawData', type: 'auto', defaultValue: {} }, // FIXME: legacy mode to remove on complete Workflow UI and wofkflowState modules refactor
			{ name: CMDBuild.core.constants.Proxy.CAPABILITIES, type: 'auto', defaultValue: {} },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.IS_STARTABLE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.IS_SUPER_CLASS, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.PARENT, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.STOPPABLE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.TYPE, type: 'string' }
		],

		/**
		 * @param {Object} data
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (data) {
			data = Ext.isObject(data) ? data : {};
			data[CMDBuild.core.constants.Proxy.CAPABILITIES] = Ext.decode(data['ui_card_edit_mode']);
			data[CMDBuild.core.constants.Proxy.DESCRIPTION] = Ext.isString(data[CMDBuild.core.constants.Proxy.TEXT]) ? data[CMDBuild.core.constants.Proxy.TEXT] : data[CMDBuild.core.constants.Proxy.DESCRIPTION];
			data[CMDBuild.core.constants.Proxy.IS_STARTABLE] = Ext.isBoolean(data['startable']) ? data['startable'] : data[CMDBuild.core.constants.Proxy.IS_STARTABLE];
			data[CMDBuild.core.constants.Proxy.IS_SUPER_CLASS] = Ext.isBoolean(data['superclass']) ? data['superclass'] : data[CMDBuild.core.constants.Proxy.IS_SUPER_CLASS];

			this.callParent(arguments);
		},

		get: function (name) {
			/**
			 * Legacy code for retro compatibility
			 *
			 * @legacy
			 *
			 * TODO: could be deleted????
			 */
			name = name == 'Id' ? CMDBuild.core.constants.Proxy.ID : name;
			name = name == 'IdClass' ? CMDBuild.core.constants.Proxy.CLASS_ID : name;
			name = name == 'IdClass_value' ? CMDBuild.core.constants.Proxy.CLASS_DESCRIPTION : name;

			return this.callParent(arguments);
		}
	});

})();

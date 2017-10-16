(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	Ext.define('CMDBuild.model.core.configuration.builder.Instance', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.CARD_FORM_RATIO, type: 'int' },
			{ name: CMDBuild.core.constants.Proxy.CARD_LOCK_TIMEOUT, type: 'int' },
			{ name: CMDBuild.core.constants.Proxy.CARD_TABS_POSITION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.CSV_IMPORT_ONEBYONE, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.DISPLAY_CARD_LOCKER_NAME, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK, type: 'boolean' },
			{ name: CMDBuild.core.constants.Proxy.INSTANCE_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.LOGOUT_REDIRECT, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.POPUP_HEIGHT_PERCENTAGE, type: 'int' },
			{ name: CMDBuild.core.constants.Proxy.POPUP_WIDTH_PERCENTAGE, type: 'int' },
			{ name: CMDBuild.core.constants.Proxy.REFERENCE_COMBO_STORE_LIMIT, type: 'int' }, // Limit of dropDown displayed relations before force pop-up window show
			{ name: CMDBuild.core.constants.Proxy.RELATION_LIMIT, type: 'int' },
			{ name: CMDBuild.core.constants.Proxy.ROW_LIMIT, type: 'int' }, // Rows per page to display in card's grid
			{ name: CMDBuild.core.constants.Proxy.SESSION_TIMEOUT, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.STARTING_CLASS, type: 'int', useNull: true } // Default selected class on UI display
		],

		/**
		 * @param {Object} data
		 *
		 * @override
		 */
		constructor: function (data) {
			data = Ext.isObject(data) ? data : {};
			data[CMDBuild.core.constants.Proxy.CARD_FORM_RATIO] = data['grid_card_ratio'];
			data[CMDBuild.core.constants.Proxy.CARD_LOCK_TIMEOUT] = data['lockcardtimeout'];
			data[CMDBuild.core.constants.Proxy.CARD_TABS_POSITION] = data['card_tab_position'];
			data[CMDBuild.core.constants.Proxy.CSV_IMPORT_ONEBYONE] = data['import_csv.one_by_one'];
			data[CMDBuild.core.constants.Proxy.DISPLAY_CARD_LOCKER_NAME] = data['lockcarduservisible'];
			data[CMDBuild.core.constants.Proxy.ENABLE_CARD_LOCK] = data['lockcardenabled'];
			data[CMDBuild.core.constants.Proxy.INSTANCE_NAME] = data['instance_name'];
			data[CMDBuild.core.constants.Proxy.LOGOUT_REDIRECT] = data['logout.redirect'];
			data[CMDBuild.core.constants.Proxy.POPUP_HEIGHT_PERCENTAGE] = data['popuppercentageheight'];
			data[CMDBuild.core.constants.Proxy.POPUP_WIDTH_PERCENTAGE] = data['popuppercentagewidth'];
			data[CMDBuild.core.constants.Proxy.REFERENCE_COMBO_STORE_LIMIT] = data['referencecombolimit'];
			data[CMDBuild.core.constants.Proxy.RELATION_LIMIT] = data['relationlimit'];
			data[CMDBuild.core.constants.Proxy.ROW_LIMIT] = data['rowlimit'];
			data[CMDBuild.core.constants.Proxy.SESSION_TIMEOUT] = data['session.timeout'];
			data[CMDBuild.core.constants.Proxy.STARTING_CLASS] = data['startingclass'];

			this.callParent(arguments);
		}
	});

})();

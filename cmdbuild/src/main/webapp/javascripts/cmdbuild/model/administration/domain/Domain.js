(function () {

	Ext.require('CMDBuild.core.constants.Proxy');

	/**
	 * @link CMDBuild.model.core.buttons.iconized.add.relation.Domain
	 *
	 * TODO: waiting for refactor (rename)
	 */
	Ext.define('CMDBuild.model.administration.domain.Domain', {
		extend: 'Ext.data.Model',

		fields: [
			{ name: CMDBuild.core.constants.Proxy.ACTIVE, type: 'boolean', defaultValue: true },
			{ name: CMDBuild.core.constants.Proxy.ATTRIBUTES, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.CARDINALITY, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DESTINATION_CLASS_ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.DESTINATION_CLASS_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.DESTINATION_DISABLED_CLASSES, type: 'auto', defaultValue: [] },
			{ name: CMDBuild.core.constants.Proxy.DIRECT_DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.INVERSE_DESCRIPTION, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.IS_MASTER_DETAIL, type: 'boolean', defaultValue: false },
			{ name: CMDBuild.core.constants.Proxy.MASTER_DETAIL_LABEL, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ORIGIN_CLASS_ID, type: 'int', useNull: true },
			{ name: CMDBuild.core.constants.Proxy.ORIGIN_CLASS_NAME, type: 'string' },
			{ name: CMDBuild.core.constants.Proxy.ORIGIN_DISABLED_CLASSES, type: 'auto', defaultValue: [] }
		],

		/**
		 * @returns {Object}
		 */
		getSubmitData: function () {
			var data = this.getData()
				outputObject = {};

			outputObject = {
				active: data[CMDBuild.core.constants.Proxy.ACTIVE],
				cardinality: data[CMDBuild.core.constants.Proxy.CARDINALITY],
				descr_1: data[CMDBuild.core.constants.Proxy.DIRECT_DESCRIPTION],
				descr_2: data[CMDBuild.core.constants.Proxy.INVERSE_DESCRIPTION],
				description: data[CMDBuild.core.constants.Proxy.DESCRIPTION],
				disabled1: data[CMDBuild.core.constants.Proxy.ORIGIN_DISABLED_CLASSES],
				disabled2: data[CMDBuild.core.constants.Proxy.DESTINATION_DISABLED_CLASSES],
				id: data[CMDBuild.core.constants.Proxy.ID] || -1,
				idClass1: data[CMDBuild.core.constants.Proxy.ORIGIN_CLASS_ID],
				idClass2: data[CMDBuild.core.constants.Proxy.DESTINATION_CLASS_ID],
				isMasterDetail: data[CMDBuild.core.constants.Proxy.IS_MASTER_DETAIL],
				md_label: data[CMDBuild.core.constants.Proxy.MASTER_DETAIL_LABEL],
				name: data[CMDBuild.core.constants.Proxy.NAME]
			};

			if (!data[CMDBuild.core.constants.Proxy.IS_MASTER_DETAIL])
				delete outputObject['md_label'];

			return outputObject;
		},

		/**
		 * @param {Object} data
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (data) {
			data = Ext.isObject(data) ? data : {};
			data[CMDBuild.core.constants.Proxy.DESTINATION_CLASS_ID] = data['class2id'] || data[CMDBuild.core.constants.Proxy.DESTINATION_CLASS_ID];
			data[CMDBuild.core.constants.Proxy.DESTINATION_CLASS_NAME] = data['class2'] || data[CMDBuild.core.constants.Proxy.DESTINATION_CLASS_NAME];
			data[CMDBuild.core.constants.Proxy.DESTINATION_DISABLED_CLASSES] = data['disabled2'] || data[CMDBuild.core.constants.Proxy.DESTINATION_DISABLED_CLASSES];
			data[CMDBuild.core.constants.Proxy.DIRECT_DESCRIPTION] = data['descrdir'] || data[CMDBuild.core.constants.Proxy.DIRECT_DESCRIPTION];
			data[CMDBuild.core.constants.Proxy.ID] = data['idDomain'] || data[CMDBuild.core.constants.Proxy.ID];
			data[CMDBuild.core.constants.Proxy.INVERSE_DESCRIPTION] = data['descrinv'] || data[CMDBuild.core.constants.Proxy.INVERSE_DESCRIPTION];
			data[CMDBuild.core.constants.Proxy.IS_MASTER_DETAIL] = data['md'] || data[CMDBuild.core.constants.Proxy.IS_MASTER_DETAIL];
			data[CMDBuild.core.constants.Proxy.MASTER_DETAIL_LABEL] = data['md_label'] || data[CMDBuild.core.constants.Proxy.MASTER_DETAIL_LABEL];
			data[CMDBuild.core.constants.Proxy.ORIGIN_CLASS_ID] = data['class1id'] || data[CMDBuild.core.constants.Proxy.ORIGIN_CLASS_ID];
			data[CMDBuild.core.constants.Proxy.ORIGIN_CLASS_NAME] = data['class1'] || data[CMDBuild.core.constants.Proxy.ORIGIN_CLASS_NAME];
			data[CMDBuild.core.constants.Proxy.ORIGIN_DISABLED_CLASSES] = data['disabled1'] || data[CMDBuild.core.constants.Proxy.ORIGIN_DISABLED_CLASSES];

			this.callParent(arguments);
		}
	});

})();

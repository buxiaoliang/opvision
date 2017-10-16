(function () {

	Ext.define('CMDBuild.controller.common.field.display.Reference', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.common.field.display.Reference'
		],

		/**
		 * @cfg {Mixed}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'fieldDisplayReferenceValueGet',
			'fieldDisplayReferenceValueSet'
		],

		/**
		 * @property {CMDBuild.view.common.field.display.Reference}
		 */
		view: undefined,

		/**
		 * @returns {Number}
		 */
		fieldDisplayReferenceValueGet: function () {
			if (Ext.isObject(this.view.displayedValueObject) && !Ext.Object.isEmpty(this.view.displayedValueObject))
				return this.view.displayedValueObject.get(CMDBuild.core.constants.Proxy.ID);

			return null;
		},

		/**
		 * @param {Mixed} value
		 *
		 * @returns {Number or null}
		 */
		fieldDisplayReferenceValueSet: function (value) {
			value = this.valueDecode(value);

			if (Ext.isObject(value) && !Ext.Object.isEmpty(value)) {
				this.view.displayedValueObject = value;

				return this.view.displayedValueObject.get(CMDBuild.core.constants.Proxy.DESCRIPTION);
			}

			return null;
		},

		/**
		 * Transforms string card's id value to object with card's description
		 *
		 * @param {Mixed} value
		 *
		 * @returns {CMDBuild.model.common.field.display.Reference or null}
		 *
		 * @private
		 */
		valueDecode: function (value) {
			// Error handling
				if (!Ext.isString(this.view.targetClassName) || Ext.isEmpty(this.view.targetClassName))
					return _error('fieldDisplayReferenceDecodeValue(): unmanaged targetClassName property', this, this.view.targetClassName);
			// END: Error handling

			switch (Ext.typeOf(value)) {
				case 'number':
				case 'string': {
					if (!Ext.isEmpty(value) && !isNaN(value)) {
						var params = {};
						params[CMDBuild.core.constants.Proxy.CARD_ID] = value;
						params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.view.targetClassName;

						CMDBuild.proxy.common.field.display.Reference.readCard({
							params: params,
							scope: this,
							success: function (response, options, decodedResponse) {
								decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.CARD];

								if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
									var valueObject = {};
									valueObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = decodedResponse['Description'];
									valueObject[CMDBuild.core.constants.Proxy.ID] = decodedResponse['Id'];

									this.view.setValue(Ext.create('CMDBuild.model.common.field.display.Reference', valueObject));
								} else {
									_error('fieldDisplayReferenceDecodeValue(): unmanaged response', this, decodedResponse);
								}
							}
						});
					}

					return null;
				}

				case 'object':
					return value.isModel && Ext.getClassName(value) == 'CMDBuild.model.common.field.display.Reference'
						? value : Ext.create('CMDBuild.model.common.field.display.Reference', value);

				default:
					return null;
			}
		}
	});

})();

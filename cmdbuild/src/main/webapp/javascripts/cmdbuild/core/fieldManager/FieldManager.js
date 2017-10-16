(function () {

	/**
	 * New implementation of field manager, builds fields starting from CMDBuild.model.common.attributes.Attribute model.
	 */
	Ext.define('CMDBuild.core.fieldManager.FieldManager', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: ['CMDBuild.core.constants.Proxy'],

		mixins: ['CMDBuild.core.fieldManager.ExternalServices'],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {CMDBuild.model.common.attributes.Attribute}
		 *
		 * @private
		 */
		attributeModel: undefined,

		/**
		 * @cfg {Ext.form.Panel}
		 */
		targetForm: undefined,

		/**
		 * @property {Array}
		 *
		 * @private
		 */
		templateResolverAttributes: [],

		/**
		 * @property {Array}
		 *
		 * @private
		 */
		templateList: ['{client', '{cql', '{group', '{js', '{server', '{user', '{xa'],

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
   			'fieldManagerAttributeWidthGet',
			'fieldManagerAttributeModelGet',
			'fieldManagerAttributeModelIsEmpty',
			'fieldManagerTemplateResolverBuild',
			'fieldManagerTemplateResolverResolveFunctionGet'
		],

		/**
		 * @property {Array}
		 *
		 * @private
		 */
		managedAttributesTypes: ['boolean', 'char', 'date', 'decimal', 'double', 'foreignkey', 'integer', 'list', 'text', 'time', 'timestamp', 'string'],

		// AttributeModel methods
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed}
			 */
			fieldManagerAttributeModelGet: function (attributePath) {
				attributePath = Ext.isArray(attributePath) ? attributePath : [attributePath];

				var requiredAttribute = this.attributeModel;

				if (Ext.isArray(attributePath) && !Ext.isEmpty(attributePath))
					Ext.Array.each(attributePath, function (attributeName, i, allAttributeNames) {
						if (!Ext.isEmpty(attributeName) && Ext.isString(attributeName)) {
							if (
								!Ext.isEmpty(requiredAttribute)
								&& Ext.isObject(requiredAttribute)
								&& Ext.isFunction(requiredAttribute.get)
							) { // Model management
								requiredAttribute = requiredAttribute.get(attributeName);
							} else if (
								!Ext.isEmpty(requiredAttribute)
								&& Ext.isObject(requiredAttribute)
							) { // Simple object management
								requiredAttribute = requiredAttribute[attributeName];
							}
						}
					}, this);

				return requiredAttribute;
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Integer} CMDBuild attribute width
			 */
			fieldManagerAttributeWidthGet: function (attributePath) {
				attributePath = Ext.isArray(attributePath) ? attributePath : [attributePath];

				var requiredAttribute = this.attributeModel;

				return requiredAttribute.raw.len;
			},
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Boolean}
			 */
			fieldManagerAttributeModelIsEmpty: function (attributePath) {
				if (!Ext.isEmpty(attributePath))
					return Ext.isEmpty(this.cmfg('fieldManagerAttributeModelGet', attributePath));

				return Ext.isEmpty(this.attributeModel);
			},

			/**
			 * @param {CMDBuild.model.common.attributes.Attribute} attributeModel
			 *
			 * @returns {Void}
			 *
			 * @public
			 */
			attributeModelSet: function (attributeModel) {
				if (
					!Ext.isEmpty(attributeModel)
					&& attributeModel.isFieldManagerCompatible
					&& attributeModel.isValid() // Validate attribute model
				) {
					this.attributeModel = attributeModel;
				} else {
					_error('attributeModelSet(): invalid attribute model', this, attributeModel);
				}
			},

		/**
		 * @returns {Object}
		 *
		 * @private
		 */
		buildAttributeController: function () {
			var attributeType = this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.TYPE).toLowerCase();

			switch (attributeType) {
				case 'boolean': return Ext.create('CMDBuild.core.fieldManager.builders.Boolean', { parentDelegate: this });
				case 'char': return Ext.create('CMDBuild.core.fieldManager.builders.Char', { parentDelegate: this });
				case 'date': return Ext.create('CMDBuild.core.fieldManager.builders.Date', { parentDelegate: this });
				case 'decimal': return Ext.create('CMDBuild.core.fieldManager.builders.Decimal', { parentDelegate: this });
				case 'double': return Ext.create('CMDBuild.core.fieldManager.builders.Double', { parentDelegate: this });
				case 'foreignkey': return Ext.create('CMDBuild.core.fieldManager.builders.ForeignKey', { parentDelegate: this });
				case 'integer': return Ext.create('CMDBuild.core.fieldManager.builders.Integer', { parentDelegate: this });
				case 'list': return Ext.create('CMDBuild.core.fieldManager.builders.List', { parentDelegate: this });
				case 'string': return Ext.create('CMDBuild.core.fieldManager.builders.String', { parentDelegate: this });
				case 'text': return Ext.create('CMDBuild.core.fieldManager.builders.text.Text', { parentDelegate: this });
				case 'time': return Ext.create('CMDBuild.core.fieldManager.builders.Time', { parentDelegate: this });
				case 'timestamp': return Ext.create('CMDBuild.core.fieldManager.builders.TimeStamp', { parentDelegate: this });
			}

			_error('buildAttributeController(): invalid attributeType property', this, attributeType);
		},

		// Builder methods
			/**
			 * Builds Ext.grid.column.* object
			 *
			 * @param {Object} parameters
			 * @param {Boolean} parameters.withEditor
			 *
			 * @returns {Object}
			 *
			 * @public
			 */
			buildColumn: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};
				parameters.withEditor = Ext.isBoolean(parameters.withEditor) ? parameters.withEditor : false;

				return this.buildAttributeController().buildColumn(parameters);
			},

			/**
			 * Builds Ext.form.field.* object
			 *
			 * @param {CMDBuild.model.common.attributes.Attribute} attributeModel
			 *
			 * @returns {Object}
			 *
			 * @public
			 */
			buildEditor: function () {
				return this.buildAttributeController().buildEditor();
			},

			/**
			 * Builds Ext.form.field.* object, evaluate attribute writability
			 *
			 * @param {Object} parameters
			 * @param {Boolean} parameters.readOnly
			 *
			 * @returns {Object}
			 *
			 * @public
			 */
			buildField: function (parameters) {
				parameters = Ext.isObject(parameters) ? parameters : {};
				parameters.readOnly = Ext.isBoolean(parameters.readOnly) ? parameters.readOnly : false;

				if (
					parameters.readOnly
					|| !this.cmfg('fieldManagerAttributeModelGet', CMDBuild.core.constants.Proxy.WRITABLE)
				) {
					return this.buildAttributeController().buildFieldReadOnly();
				} else {
					return this.buildAttributeController().buildField();
				}
			},

			/**
			 * Builds Ext.data.Store field definition object
			 *
			 * @returns {Object}
			 *
			 * @public
			 */
			buildStoreField: function () {
				return this.buildAttributeController().buildStoreField();
			},

		/**
		 * Manage attributeType as case insensitive
		 *
		 * @param {String} attributeType
		 *
		 * @returns {Boolean}
		 *
		 * @public
		 */
		isAttributeManaged: function (attributeType) {
			attributeType = attributeType.toLowerCase();

			return Ext.Array.contains(this.managedAttributesTypes, attributeType);
		},

		// TemplateResolver property methods
			/**
			 * @returns {Object}
			 *
			 * @private
			 */
			templateResolverAttributesDataGet: function () {
				var attributesData = {};

				Ext.Array.each(this.templateResolverAttributesGet(), function (attribute, i, allAttributes) {
					attributesData[attribute] = this.cmfg('fieldManagerAttributeModelGet', attribute);
				}, this);

				return attributesData;
			},

			/**
			 * @returns {Array}
			 *
			 * @private
			 */
			templateResolverAttributesGet: function () {
				return this.templateResolverAttributes;
			},

			/**
			 * @returns {Boolean}
			 *
			 * @private
			 */
			templateResolverAttributesHasTemplates: function () {
				var encodedAttributesModel = Ext.encode(this.cmfg('fieldManagerAttributeModelGet').getData());

				return !Ext.Array.every(this.templateList, function (template, i, allTemplates) {
					return encodedAttributesModel.indexOf(template) < 0; // Stops loop at first template found
				}, this);
			},

			/**
			 * @param {Array} attributes
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			templateResolverAttributesSet: function (attributes) {
				this.templateResolverAttributes = [];

				if (Ext.isArray(attributes) && !Ext.isEmpty(attributes))
					this.templateResolverAttributes = attributes;
			},

			/**
			 * @param {Array} attributes
			 *
			 * @returns {CMDBuild.Management.TemplateResolver} templateResolver
			 *
			 * @private
			 */
			fieldManagerTemplateResolverBuild: function (attributes) {
				var templateResolver = undefined;

				if (
					!Ext.isEmpty(this.targetForm)
					&& this.targetForm instanceof Ext.form.Panel
					&& this.templateResolverAttributesHasTemplates()
				) {
					this.templateResolverAttributesSet(attributes);

					templateResolver = new CMDBuild.Management.TemplateResolver({
						clientForm: this.targetForm.getForm(),
						xaVars: this.templateResolverAttributesDataGet()
					});
				}

				return templateResolver;
			},

			/**
			 * Resolve template of filter attribute
			 *
			 * @returns {Function}
			 *
			 * @private
			 */
			fieldManagerTemplateResolverResolveFunctionGet: function () {
				return function () { // This is field object
					if (!Ext.isEmpty(this.templateResolver) && !this.isDisabled()) {
						this.templateResolver.resolveTemplates({
							attributes: [CMDBuild.core.constants.Proxy.FILTER],
							scope: this,
							callback: function (out, ctx) {
								// Filter attribute manage
								var params = {};
								params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.attributeModel.get(CMDBuild.core.constants.Proxy.TARGET_CLASS);
								params[CMDBuild.core.constants.Proxy.FILTER] = Ext.encode({ CQL: out[CMDBuild.core.constants.Proxy.FILTER] });

								if (!this.getStore().isLoading()) {
									this.getStore().getProxy().extraParams = params; // Set last load params
									this.getStore().load();
								}

								// Add listeners to  fields which depends
								Ext.Object.each(this.templateResolver.getLocalDepsAsField(), function (dependsName, dependsField, myself) {
									if (!Ext.isEmpty(dependsField))
										dependsField.on('change', function (field, newValue, oldValue, eOpts) {
											this.reset();
											this.resolveTemplates();
										}, this);
								}, this);
							}
						});
					}
				};
			}
	});

})();

(function() {

	var FILTER_FIELD = "_SystemFieldFilter";


	Ext.define("CMDBuild.Management.ReferenceField", {
		uses: ['CMDBuild.proxy.Card'],
		statics: {
			/**
			 * @param {Object} attribute
			 * @param {Object} subFields
			 * @param {Object} extraFieldConf
			 *
			 * @return {Mixed} field
			 */
			build: function(attribute, subFields, extraFieldConf) {
				var templateResolver;
				var extraFieldConf = extraFieldConf || {};

				if (attribute.filter) { // is using a template
					var xaVars = CMDBuild.Utils.Metadata.extractMetaByNS(attribute.meta, "system.template.");
					xaVars[FILTER_FIELD] = attribute.filter;
					templateResolver = new CMDBuild.Management.TemplateResolver({
						getBasicForm: function() {
							if (!Ext.isEmpty(getFormPanel(field)))
								return getFormPanel(field).getForm();

							return undefined;
						},
						xaVars: xaVars
					});
				}

				var field = Ext.create("CMDBuild.Management.ReferenceField.Field", Ext.applyIf(extraFieldConf,{
					attribute: attribute,
					templateResolver: templateResolver
				}));

				if (subFields && subFields.length > 0) {
					return buildReferencePanel(field, subFields);
				} else {
					return field;
				}
			},

			/**
			 * Custom function to force a manual instantiation of templateResolver to hack a problem of this fields structure type
			 *
			 * @param {Object} attribute
			 * @param {CMDBuild.Management.TemplateResolver} templateResolver
			 * @param {Object} parentDelegate
			 *
			 * @return {CMDBuild.Management.ReferenceField.Field} field
			 */
			buildEditor: function(attribute, templateResolver, parentDelegate) {
				templateResolver = templateResolver || null;

				return Ext.create("CMDBuild.Management.ReferenceField.Field", {
					parentDelegate: parentDelegate,
					attribute: attribute,
					templateResolver: templateResolver,
					_growSizeFix: Ext.emptyFn // FIX: resolves grid editor wider than column
				});
			}
		}
	});

	function getFormPanel(field) {
		return field.findParentByType("form");
	}

	function buildReferencePanel(field, subFields) {
		// If the field has no value the relation attributes must be disabled
		field.on('change', function (combo, newValue, oldValue, eOpts) {
			Ext.Function.defer(function (combo) { // I cannot understand why deferring function it works, but that the only way...
				if (!Ext.isEmpty(subFields) && Ext.isArray(subFields))
					Ext.Array.each(subFields, function (subField, i, allSubFields) {
						if (!Ext.isEmpty(subField) && subField.rendered)
							subField.setDisabled(Ext.isEmpty(combo.getValue()));
					}, this);
			}, 100, this, [combo]);
		}, this);

		var fieldContainer = {
			xtype: 'container',
			layout: 'hbox',
			margin: "0 0 5 0",

			items: [
				Ext.create('CMDBuild.field.CMToggleButtonToShowReferenceAttributes', {
					subFields: subFields
				}),
				field
			]
		};

		field.labelWidth -= 20;

		return Ext.create('Ext.container.Container', {
			margin: "0 0 5 0",
			mainField: field, // Custom attribute to create a reference to main reference field
			items: [fieldContainer].concat(subFields),
			resolveTemplate: function(barrierCallbackDefinitionObject) {
				field.resolveTemplate(barrierCallbackDefinitionObject);
			}
		});
	}

	Ext.define("CMDBuild.Management.ReferenceField.Field", {
		extend: "CMDBuild.view.common.field.SearchableCombo",

		uses: ['CMDBuild.proxy.Card'],
		
		mixins: {
			observable: 'Ext.util.Observable'
		},

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		attribute: undefined,

		initComponent: function() {
			var attribute = this.attribute;
			var store = _CMCache.getReferenceStore(attribute);

			store.on("loadexception", function() {
				field.setValue('');
			});

			Ext.apply(this, {
				fieldLabel: attribute.description || attribute.name,
				labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
				name: attribute.name,
				store: store,
				queryMode: "local",
				valueField: "Id",
				displayField: 'Description',
				allowBlank: !attribute.isnotnull,
				grow: true, // XComboBox autogrow
				minChars: 1,
				filtered: false,
				CMAttribute: attribute,
				listConfig: {
					loadMask: false
				}
			});

			this.callParent(arguments);
		},

		listeners: {
			// Force store load and Manage preselectIfUnique metadata without CQL filter
			beforerender: function(combo, eOpts) {
				combo.getStore().load({
					scope: this,
					callback: function(records, operation, success) {
						if (
							!Ext.isEmpty(combo.getStore())
							&& !Ext.isEmpty(this.attribute)
							&& !Ext.isEmpty(this.attribute.meta)
							&& this.attribute.meta['system.type.reference.' + CMDBuild.core.constants.Proxy.PRESELECT_IF_UNIQUE] === 'true'
							&& combo.getStore().getCount() == 1
						) {
							combo.setValue(records[0].get('Id'));
						}
					}
				});
			}
		},

		/**
		 * @param {String} rawValue
		 *
		 * @returns {Array}
		 *
		 * @override
		 */
		getErrors: function (rawValue) {
			if (!Ext.isEmpty(rawValue) && !Ext.isEmpty(this.getStore()) && this.getStore().find(this.valueField, this.getValue()) == -1)
				return [CMDBuild.Translation.errors.valueDoesNotMatchFilter];

			return this.callParent(arguments);
		},

		/**
		 * Return value only if number, to avoid wrong and massive server requests where returned value from ReferenceField
		 * is a string (if you type something and don't exist the store's relative value, typed string will be returned).
		 *
		 * @returns {Number}
		 *
		 * @override
		 */
		getValue: function () {
			var value = this.callParent(arguments);

			if (Ext.isNumber(value))
				return value;

			return '';
		},

		setValue: function(v) {
			if (!Ext.isEmpty(this.getStore())) {
				v = this.extractIdIfValueIsObject(v);

				// Manage preselectIfUnique metadata
				if (
					!Ext.isEmpty(this.attribute)
					&& !Ext.isEmpty(this.attribute.meta)
					&& this.attribute.meta['system.type.reference.' + CMDBuild.core.constants.Proxy.PRESELECT_IF_UNIQUE] === 'true'
					&& this.getStore().getCount() == 1
				) {
					v = this.getStore().getAt(0).get('Id');
				}

				// Is one time seems that has a CQL filter
				if (this.ensureToHaveTheValueInStore(v) || this.store.isOneTime)
					this.callParent([v]);

				this.validate();
			}
		},

		/**
		 * Adds the record when the store is not completely loaded (too many records)
		 * NOTE: if field has preselectIfUnique metadata skip to add value to store, to avoid stores with more than one items (this is an ugly fix but is just temporary)
		 *
		 * @param {Mixed} value
		 *
		 * @return {Boolean}
		 */
		ensureToHaveTheValueInStore: function(value) {
			value = normalizeValue(this, value);

			// Ask to the server the record to add, return false to not set the value, and set it on success
			if (
				!Ext.isEmpty(value)
				&& !this.store.isLoading()
				&& this.getStore().find(this.valueField, value) == -1
				&& !Ext.isEmpty(this.attribute)
				&& !Ext.isEmpty(this.attribute.meta)
			) {
				var params = Ext.apply({ cardId: value }, this.getStore().baseParams);

				CMDBuild.proxy.Card.read({
					params: params,
					loadMask: false,
					scope: this,
					success: function (response, options, decodedResponse) {
						if (
							!Ext.isEmpty(this.getStore())
							&& this.getStore().find(this.valueField, value) == -1
						) {
							this.getStore().add({
								Id: value,
								Description: decodedResponse.card['Description']
							});
						}

						this.setValue(value);

						// Fixes renderer problems to avoid blank cell content in cell editors
						if (!Ext.isEmpty(this.parentDelegate) && !Ext.isEmpty(this.parentDelegate.view) && this.parentDelegate.view.getView().isVisible())
							this.parentDelegate.view.getView().refresh();
					}
				});

				return false;
			}

			return true;
		},

		/**
		 * @param {Object} parameters
		 * @param {Function} parameters.callback
		 * @param {Object} parameters.scope
		 *
		 * @returns {Void}
		 */
		resolveTemplate: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.scope = Ext.isObject(parameters.scope) ? parameters.scope : this;

			if (
				Ext.isObject(this.templateResolver) && !Ext.Object.isEmpty(this.templateResolver)
				&& !this.isDisabled()
			) {
				if (Ext.isFunction(parameters.callback))
					this.regenerationCallbackParameters = Ext.clone(parameters);

				this.templateResolver.resolveTemplates( {
					attributes: [FILTER_FIELD],
					scope: this,
					callback: function (out, ctx) {
						var queryParameters = this.templateResolver.buildCQLQueryParameters(out[FILTER_FIELD]);

						this.filtered = true;

						if (Ext.isObject(queryParameters) && !Ext.Object.isEmpty(queryParameters)) {
							this.getStore().baseParams.filter = Ext.encode({ CQL: queryParameters.CQL });

							this.getStore().load({
								scope: this,
								callback: function (records, operation, success) {
									// Manage preselectIfUnique metadata with CQL filter
									if (
										!Ext.isEmpty(this.getStore())
										&& !Ext.isEmpty(this.attribute)
										&& !Ext.isEmpty(this.attribute.meta)
										&& this.attribute.meta['system.type.reference.' + CMDBuild.core.constants.Proxy.PRESELECT_IF_UNIQUE] === 'true'
										&& this.getStore().getCount() == 1
									) {
										this.setValue(records[0].get('Id'));
									}

									this.addListenerToDeps();

									if (
										Ext.isObject(this.regenerationCallbackParameters) && !Ext.isEmpty(this.regenerationCallbackParameters)
										&& Ext.isFunction(this.regenerationCallbackParameters.callback)
									) {
										Ext.callback(this.regenerationCallbackParameters.callback, this.regenerationCallbackParameters.scope);

										delete this.regenerationCallbackParameters;
									}
								}
							});
						} else {
							var emptyDataSet = {};
							emptyDataSet[this.getStore().root] = [];
							emptyDataSet[this.getStore().totalProperty] = 0;

							this.getStore().loadData(emptyDataSet);

							this.addListenerToDeps();

							if (Ext.isFunction(parameters.callback)) {
								Ext.callback(parameters.callback, parameters.scope);

								delete this.regenerationCallbackParameters;
							}
						}
					}
				});
			} else if (Ext.isFunction(parameters.callback)) {
				Ext.callback(parameters.callback, parameters.scope);
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		addListenerToDeps: function () {
			if (Ext.isObject(this.templateResolver) && !Ext.Object.isEmpty(this.templateResolver))
				Ext.Object.each(this.templateResolver.getLocalDepsAsField(), function (name, field, myself) {
					if (
						Ext.isObject(field) && !Ext.Object.isEmpty(field)
						&& Ext.isFunction(field.resumeEvents)
						&& Ext.isFunction(field.un) && Ext.isFunction(field.on)
					) {
						// Remove event before add
						if (field.hasListener('change'))
							field.un('change', this.depsChangeEventManager, this);

						field.on('change', this.depsChangeEventManager, this);
					}
				}, this);
		},

		/**
		 * @param {Ext.form.Field} field
		 * @param {Object} newValue
		 * @param {Object} oldValue
		 * @param {Object} eOpts
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		depsChangeEventManager: function(field, newValue, oldValue, eOpts) {
			this.reset();
			this.resolveTemplate();
		},

		isFiltered: function() {
			return (typeof this.templateResolver != "undefined");
		},

		setServerVarsForTemplate: function(vars) {
			if (this.templateResolver)
				this.templateResolver.serverVars = vars;
		}
	});

	// See SearchableCombo.addToStoreIfNotInIt
	function adaptResult(result) {
		var data = result.card;
		if (data) {
			return {
				get: function(key) {
					return data[key];
				}
			};
		} else {
			return null;
		}
	}

	// If set the velue programmatically it could be a integer or a string or null or undefined if the set is raised after a selection on the UI,
	//the value is an array of models
	function normalizeValue(me, v) {
		v = CMDBuild.Utils.getFirstSelection(v);

		if (v && typeof v == "object" && typeof v.get == "function")
			v = v.get(me.valueField);

		return v;
	}

})();
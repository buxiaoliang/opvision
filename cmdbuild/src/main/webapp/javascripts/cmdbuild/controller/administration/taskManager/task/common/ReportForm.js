(function () {
    	var CQLFIELDS = "CMDBuildCqlFields";
	Ext.define('CMDBuild.controller.administration.taskManager.task.common.ReportForm', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.taskManager.task.common.ReportForm'
		],

		/**
		 * @cfg {Object}
		 */
		parentDelegate: undefined,

		/**
		 * Selected report attributes
		 *
		 * @param {Object}
		 *
		 * @private
		 */
		attributes: {},

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onTaskManagerReportFormBeforeEdit',
			'onTaskManagerReportFormDisable',
			'onTaskManagerReportFormEditingModeCheckChange',
			'onTaskManagerReportFormEnable',
			'onTaskManagerReportFormIsValid',
			'onTaskManagerReportFormReportSelect',
			'onTaskManagerReportFormValidationEnable'
		],

		/**
		 * @property {CMDBuild.view.administration.taskManager.task.common.reportForm.ReportFormView}
		 */
		view: undefined,

		// Attributes property methods
			/**
			 * @param {String} name
			 *
			 * @returns {Object}
			 *
			 * @private
			 */
			attributesGet: function (name) {
				if (this.attributesExists(name))
					return this.attributes[name];

				return this.attributes;
			},

			/**
			 * @param {String} name
			 *
			 * @returns {Boolean}
			 *
			 * @private
			 */
			attributesExists: function (name) {
				if (Ext.isString(name) && !Ext.isEmpty(name))
					return !Ext.isEmpty(this.attributes[name]);

				return false;
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			attributesReset: function () {
				this.attributes = {};
			},

			/**
			 * @param {Array} attributes
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			attributesSet: function (attributes) {
				if (Ext.isArray(attributes) && !Ext.isEmpty(attributes))
					Ext.Array.each(attributes, function (attributeObject, i, allAttributeObject) {
						if (Ext.isObject(attributeObject) && !Ext.Object.isEmpty(attributeObject))
							this.attributes[attributeObject[CMDBuild.core.constants.Proxy.NAME]] = attributeObject;
					}, this);
			},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		columnEditorSet: function (column, record) {
			if (
				Ext.isObject(column) && !Ext.Object.isEmpty(column)
				&& Ext.isObject(record) && !Ext.Object.isEmpty(record)
			) {
				if (record.get(CMDBuild.core.constants.Proxy.EDITING_MODE)) { // Default editor (text)
					column.setEditor({ xtype: 'textfield' });
				} else if (this.attributesExists(record.get(CMDBuild.core.constants.Proxy.NAME))) { // Custom attribute editor
					var fieldManager = Ext.create('CMDBuild.core.fieldManager.FieldManager', { parentDelegate: this });
					var attribute = this.attributesGet(record.get(CMDBuild.core.constants.Proxy.NAME));

					if (fieldManager.isAttributeManaged(attribute[CMDBuild.core.constants.Proxy.TYPE])) {
						fieldManager.attributeModelSet(Ext.create('CMDBuild.model.common.attributes.Attribute', attribute));

						column.setEditor(fieldManager.buildEditor());
					} else { // @deprecated - Old field manager
						var editor = CMDBuild.Management.FieldManager.getCellEditorForAttribute(attribute);

						if (!Ext.isEmpty(editor)) {
							if (attribute.defaultvalue)
								editor.setValue(attribute.defaultvalue);

							column.setEditor(editor);
						}
					}
				}
			} else {
				_error('columnEditorSet(): wrong or unsupported column or record parameters', this, column, record);
			}
		},

		/**
		 * @returns {Object} data
		 *
		 * 	Example:
		 * 		{
		 * 			name1: value1,
		 * 			name2: value2
		 * 		}
		 *
		 * @legacy
		 * @deprecated
		 */
		getValueGrid: function () {
			var data = {};
			var cqlFields = [];
			// To validate and filter grid rows
			var me = this;
			this.view.grid.getStore().each(function (record) {
				if (
					!Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.NAME))
					&& !Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.VALUE))
				) {	
				    var name = record.get(CMDBuild.core.constants.Proxy.NAME);
					var attribute = me.attributesGet(name);
					var value = record.get(CMDBuild.core.constants.Proxy.VALUE);
					var isCql = record.get(CMDBuild.core.constants.Proxy.EDITING_MODE);
					if (! isCql) {
					    value = getValueForType(attribute.type, value);
					}
					data[name] = value; 
					if (isCql) {
					    cqlFields.push(name);
					}
				}
			});
			data[CQLFIELDS] = cqlFields;
			return data;
		},

		/**
		 * Check required field value of grid store records
		 *
		 * @returns {Boolean} isValid
		 *
		 * @private
		 */
		gridIsValid: function () {
			var isValid = true;
			var requiredAttributes = [];

			// Build required attributes names array
			Ext.Object.each(this.attributesGet(), function (name, attribute, myself) {
				if (attribute['isnotnull'])
					requiredAttributes.push(attribute[CMDBuild.core.constants.Proxy.NAME]);
			}, this);

			// Check grid store records empty required fields
			this.view.grid.getStore().each(function (record) {
				if (
					Ext.Array.contains(requiredAttributes, record.get(CMDBuild.core.constants.Proxy.NAME))
					&& Ext.isEmpty(record.get(CMDBuild.core.constants.Proxy.VALUE))
				) {
					isValid = false;

					return false;
				}
			}, this);

			if (!isValid)
				this.view.grid.addBodyCls('x-grid-invalid');

			return isValid;
		},

		/**
		 * @param {Boolean} merge
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		gridStoreFill: function (merge) {
			merge = Ext.isBoolean(merge) ? merge : false;

			var records = [];

			Ext.Object.each(this.attributesGet(), function (name, attribute, myself) {
				if (Ext.isObject(attribute) && !Ext.Object.isEmpty(attribute)) {
					var attributeModelObject = {};
					attributeModelObject[CMDBuild.core.constants.Proxy.DESCRIPTION] = attribute[CMDBuild.core.constants.Proxy.DESCRIPTION];
					var name = attribute[CMDBuild.core.constants.Proxy.NAME];
					attributeModelObject[CMDBuild.core.constants.Proxy.NAME] = name;
					attributeModelObject[CMDBuild.core.constants.Proxy.TYPE] = attribute.type;
					attributeModelObject[CMDBuild.core.constants.Proxy.EDITING_MODE] = (this.cqlFields.indexOf(name) !== -1);
					if (merge) {
						var gridRecord =  this.view.grid.getStore().findRecord(CMDBuild.core.constants.Proxy.NAME, attribute[CMDBuild.core.constants.Proxy.NAME]);

						if (!Ext.isEmpty(gridRecord))
							attributeModelObject[CMDBuild.core.constants.Proxy.VALUE] = gridRecord.get(CMDBuild.core.constants.Proxy.VALUE);
					}

					records.push(Ext.create('CMDBuild.model.administration.taskManager.task.common.reportForm.Grid', attributeModelObject));
				}
			}, this);

			this.view.grid.getStore().removeAll();

			if (!Ext.isEmpty(records))
				this.view.grid.getStore().add(records);
		},

		/**
		 * Function to update rows editors on beforeEdit event
		 *
		 * @param {Object} parameters
		 * @param {String} parameters.columnName
		 * @param {Object} parameters.column
		 * @param {CMDBuild.model.administration.taskManager.task.common.reportForm.Grid} parameters.record
		 *
		 * @returns {Void}
		 */
		onTaskManagerReportFormBeforeEdit: function (parameters) {
			switch (parameters.columnName) {
				case CMDBuild.core.constants.Proxy.VALUE:
					return this.columnEditorSet(parameters.column, parameters.record);
			}
		},

		/**
		 * @returns {Void}
		 */
		onTaskManagerReportFormDisable: function () {
			this.view.combo.disable();
			this.view.extension.disable();
			this.view.grid.disable();
		},

		/**
		 * @param {Number} rowIndex
		 *
		 * @returns {Void}
		 */
		onTaskManagerReportFormEditingModeCheckChange: function (param) {
			this.view.grid.cellEditingPlugin.completeEdit();

			if (!Ext.isEmpty(param.rowIndex)) {
				var record = this.view.grid.getStore().getAt(param.rowIndex);

				if (Ext.isObject(record) && !Ext.Object.isEmpty(record)) {
					record.set(CMDBuild.core.constants.Proxy.VALUE, '');
					record.set(CMDBuild.core.constants.Proxy.EDITING_MODE, param.checked);
					record.commit();
				} else {
					_warning('onTaskManagerReportFormEditingModeCheckChange(): "' + param.rowIndex + '" row not found', this);
				}
			}
		},

		/**
		 * @returns {Void}
		 */
		onTaskManagerReportFormEnable: function () {
			if (this.view.combo.rendered) {
				this.view.combo.enable();
				this.view.extension.enable();
				this.view.grid.setDisabled(Ext.isEmpty(this.view.combo.getValue()));
			}
		},

		/**
		 * @returns {Void}
		 */
		onTaskManagerReportFormIsValid: function () {
			return this.view.combo.isValid() && this.view.extension.isValid() && this.gridIsValid();
		},

		/**
		 * Builds grid
		 *
		 * @param {Object} parameters
		 * @param {Boolean} parameters.merge
		 * @param {CMDBuild.model.administration.taskManager.task.common.reportForm.Report} parameters.record
		 *
		 * @returns {Void}
		 */
		onTaskManagerReportFormReportSelect: function (parameters) {
			parameters.merge = Ext.isBoolean(parameters.merge) ? parameters.merge : false;

			this.attributesReset();

			if (
				Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)
				&& !Ext.isEmpty(parameters.record)
			) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.EXTENSION] = CMDBuild.core.constants.Proxy.PDF;
				params[CMDBuild.core.constants.Proxy.ID] = parameters.record.get(CMDBuild.core.constants.Proxy.ID);
				params[CMDBuild.core.constants.Proxy.TYPE] = 'CUSTOM';

				CMDBuild.proxy.administration.taskManager.task.common.ReportForm.readParameters({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.ATTRIBUTE];

						if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
							this.attributesSet(decodedResponse);

							this.gridStoreFill(parameters.merge);

							this.view.grid.enable();
						} else { // Clear and disable grid if no attributes
							this.view.grid.getStore().removeAll();
							this.view.grid.disable();
						}
					}
				});
			} else {
				_error('onTaskManagerReportFormReportSelect(): wrong parameters object', this, parameters);
			}
		},

		/**
		 * @param {Boolean} state
		 *
		 * @returns {Void}
		 */
		onTaskManagerReportFormValidationEnable: function (state) {
			this.view.combo.allowBlank = !state;
			this.view.extension.allowBlank = !state;
		},

		/**
		 * @param {String} value
		 *
		 * @returns {Void}
		 *
		 * @legacy
		 * @deprecated
		 */
		setValueCombo: function (value) {
			if (!Ext.isEmpty(value)) {
				this.view.combo.setValue(value);

				this.cmfg('onTaskManagerReportFormEnable');
			}
		},

		/**
		 * @param {String} value
		 *
		 * @returns {Void}
		 *
		 * @legacy
		 * @deprecated
		 */
		setValueExtension: function (value) {
			if (!Ext.isEmpty(value)) {
				this.view.extension.setValue(value);

				this.cmfg('onTaskManagerReportFormEnable');
			}
		},

		/**
		 * Preset values in grid store, on report selection grid data will be merged to attribute values
		 *
		 * @param {Object} values
		 *
		 * @returns {Void}
		 *
		 * @legacy
		 * @deprecated
		 */
		setValueGrid: function (values) {
			this.view.grid.getStore().removeAll();
			this.cqlFields = eval(values[CQLFIELDS]) || [];
			if (Ext.isObject(values) && !Ext.Object.isEmpty(values)) {
				var records = [];

				Ext.Object.each(values, function (key, value, myself) {
					if (!Ext.isEmpty(value)) {
						var recordConf = {};
						recordConf[CMDBuild.core.constants.Proxy.NAME] = key;
						recordConf[CMDBuild.core.constants.Proxy.VALUE] = value;
						recordConf[CMDBuild.core.constants.Proxy.EDITING_MODE] = (this.cqlFields.indexOf(key) !== -1);

						records.push(recordConf);
					}
				}, this);
			}

			if (!Ext.isEmpty(records))
				this.view.grid.getStore().add(records);
		}
	});
	
	
	/* TODO : to inject in type classes */
	function getValueForType(type, value) {
	    if (type === "DATE") {
		var date = new Date(value);
		return date;
	    }
	    return value;
	}

})();


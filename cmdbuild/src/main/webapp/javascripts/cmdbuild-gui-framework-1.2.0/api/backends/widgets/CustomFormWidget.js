(function($) {

	var METADATA_FNPROPERTIES = "fn_properties";

	var CustomFormWidget = function(param, onReadyFunction, onReadyScope) {
		/*
		 * ATTRIBUTES
		 */
		this.widgetConfig = {};
		this.data =  [];
		this.metadata = {};

		this.instanceForm = null;
		this.widgetId = null;
		this.formname = null;
		this.fromGrid = null;

		this._fnvariables = [];
		this._fnvariablesresolved = {};
		this._maxid = null;

		this.extraproperties = {
			ID : "__id__",
			COMMANDS : "__commands__"
		};
		this.refreshtypes = {
			FIRST_TIME : "firstTime",
			EVERY_TIME : "everyTime"
		};

		/*
		 * PRIVATE ATTRIBUTES
		 */
		var onReadyFunction = onReadyFunction;
		var onReadyScope = onReadyScope;

		/*
		 * BASE FUNCTIONS
		 */
		this.init = function() {
			this.instanceForm = param.instanceForm;
			this.widgetId = param.widgetId;
			this.recordId = param.recordId;
			this.fromGrid = param.fromGrid === "true" || param.fromGrid === true;
			this.formname = $.Cmdbuild.widgets.CustomForm.formName(this.instanceForm, {_id : this.widgetId});

			this.widgetConfig = getWidgetConfig(this.instanceForm, this.widgetId);
			this.loadAttributes();
		};
		this.loadAttributes = function() {
			var attributes = $.parseJSON(this.widgetConfig.model);
			$.each(attributes, function(index, attribute) {
				attribute._id = attribute.name;
			});
			this.loadAttributesCallback(attributes);
		};
		// 
		this.loadAttributesCallback = function(attributes) {
			this.attributes = attributes;
			this.attributes.sort($.Cmdbuild.utilities.attributesSorter);
			this.loadData();
		};

		/*
		 * LOAD DATA FUNCTIONS
		 */
		/**
		 * Load data
		 */
		this.loadData = function() {
			var me = this;
			var data = $.Cmdbuild.dataModel.getData(this.formname);
			var refresh = this.getWidgetConfig().capabilities.refreshBehaviour;

			// function variables to array
			this._fnvariables = [];
			$.each(me.getWidgetConfig().variables, function(key, value) {
				me._fnvariables.push({
					key : key,
					value : value
				});
			});

			// use current data
			function useCurrentData() {
				me.setData(data);
				me._maxid = getMaxKey(data, me.extraproperties.ID);
				setTimeout(onObjectReady, 500);
			};

			// load data
			function loadData() {
				me._maxid = -1;

				// create empty data store
				$.Cmdbuild.dataModel.updateData(me.formname, []);
				me.setData([]);

				if (me.getWidgetConfig().data) {
					// load data from data parameter
					var widgetData = $.parseJSON(me.getWidgetConfig().data);
					$.each(widgetData, function(index, item) {
						me.addRecord(item);
					});
					setTimeout(onObjectReady, 500);
				} else if (me.getWidgetConfig().functionData) {
					// load data from function
					me.resolveFnVariables(function() {
						me.loadFnData();
					}, me);
				} else {
					// empty data
					setTimeout(onObjectReady, 500);
				}
			};

			/*
			 * Load data
			 */
			if (data === null) {
				// if data is not set
				loadData();
			} else if (refresh === this.refreshtypes.FIRST_TIME) {
				// if data is set and refresh behavior is "firstTime"
				useCurrentData();
			} else {
				var oldvariables = $.Cmdbuild.dataModel.getMetaData(this.formname, METADATA_FNPROPERTIES);
				// if data is set and refresh behavior is not "firstTime"
				this.resolveFnVariables(function() {
					if (!oldvariables || (!oldvariables && $.isEmptyObject(me._fnvariablesresolved))
							|| compareObjects(oldvariables, me._fnvariablesresolved)) {
						useCurrentData();
					} else {
						loadData();
					}
				}, this);
			}
		};
		/**
		 * Resolve function parameters
		 * @param {Function} callback
		 * @param {Object} callbackScope
		 */
		this.resolveFnVariables = function(callback, callbackScope) {
			var me = this;
			if (this._fnvariables.length) {
				// resolve variable
				var variable = this._fnvariables.splice(0, 1)[0];
				cqlEvaluate({
					form : me.instanceForm,
					filter : variable.value
				}, function(value) {
					if (value) {
						value = value.trim();
						if (value === $.Cmdbuild.global.CQLUNDEFINEDVALUE) {
							value = null;
						}
					}
					me._fnvariablesresolved[variable.key] = value;
					me.resolveFnVariables(callback, callbackScope);
				}, me);
			} else {
				// save function variables into store
				$.Cmdbuild.dataModel.updateMetaData(this.formname,
						METADATA_FNPROPERTIES, me._fnvariablesresolved);
				// execute callback
				callback.apply(callbackScope);
			}
		};
		/**
		 * Load function data
		 */
		this.loadFnData = function() {
			var me = this;
			// get all functions
			$.Cmdbuild.utilities.proxy.getFunctions({}, function(data, metadata) {
				// find current function
				var functions = $.grep(data, function(item, index) {
					return item.name === me.getWidgetConfig().functionData;
				});
				if (functions.length) {
					var fn = functions[0];
					// get function response
					$.Cmdbuild.utilities.proxy.getFunctionOutputs(fn._id, me._fnvariablesresolved, function(fn_data, fn_meta) {
						$.each(fn_data, function(index, record) {
							me.addRecord(record);
						});
						onObjectReady();
					}, me);
				} else {
					onObjectReady();
				}
			}, this);
		};

		/*
		 * DATA MANAGEMENT
		 */
		/**
		 * Updata data
		 * @param {Array} data
		 */
		this.updateData = function(data) {
			this.setData(data);
			// update store data
			$.Cmdbuild.dataModel.updateData(this.formname, data);
			// update store metadata
			$.Cmdbuild.dataModel.updateMetaData(this.formname,
					$.Cmdbuild.widgets.CustomForm.METADATA_HASDATA,
					data.length > 0);
		};
		/**
		 * Add record
		 * @param {Object} record
		 * @return {Object} Returns the record
		 */
		this.addRecord = function(record) {
			var me = this;
			var mixinObject = function() {
				var obj = {};
				obj[me.extraproperties.COMMANDS] = null;
				obj[me.extraproperties.ID] = ++me._maxid;
				return obj;
			}
			// update record
			var new_record = $.extend({}, getEmptyData(this.getAttributes()), record, mixinObject());
			// add record
			var data = this.getRawData().slice();
			data.push(new_record);
			this.updateData(data);
			return new_record;
		};
		/**
		 * Remove record
		 * @param {Integer} id
		 */
		this.removeRecord = function(id) {
			var me = this;
			var data = this.getRawData().slice();
			var newData = [];
			$.each(data, function(index, item) {
				if (item[me.extraproperties.ID] !== id) {
					newData.push(item);
				}
			});
			// update data store
			this.updateData(newData);
			this.removeRowErrors(id);
		};
		/**
		 * Add empty record
		 * @return {Object} Returns the record
		 */
		this.addEmptyRecord = function() {
			var item = getEmptyData({});
			var record = this.addRecord(item);
			// validate
			this.validateNewRecord(record);
			return record
		};
		/**
		 * Clone record
		 * @param {Integer} id
		 * @return {Object} Returns the record
		 */
		this.cloneRecord = function(id) {
			var me = this;
			var items = $.grep(this.getRawData(), function(i) {
				return i[me.extraproperties.ID] == id;
			});
			if (items.length) {
				var new_item = this.addRecord(items[0]);
				this.validateClonedRecord(id, new_item[me.extraproperties.ID]);
				return new_item;
			}
			return null;
		};
		/**
		 * Update record property
		 * @param {Integer} id
		 * @param {String} property
		 * @param {String|Integer|Numeric|Boolean} value
		 */
		this.updateRecordProperty = function(id, property, value) {
			var me = this;
			// update data
			var data = this.getRawData().slice();
			var items = $.grep(data, function(i) {
				return i[me.extraproperties.ID] == id;
			});
			if (items.length) {
				var item = items[0];
				item[property] = value;
				this.updateData(data);
			}
		};
		/*
		 * ERRORS MANAGEMENT
		 */
		/**
		 * Get errors
		 * @return {Object}
		 */
		this.getAllErrors = function() {
			return $.Cmdbuild.dataModel.getMetaData(this.formname, $.Cmdbuild.widgets.CustomForm.METADATA_ERRORS);
		};
		/**
		 * Update errors
		 * @param {Object} errors
		 */
		this.updateErrors = function(errors) {
			$.Cmdbuild.dataModel.updateMetaData(this.formname, $.Cmdbuild.widgets.CustomForm.METADATA_ERRORS, errors);
		};
		/**
		 * Remove row errors
		 */
		this.removeRowErrors = function(id) {
			// remove all errors for this field
			var otherErrors = $.grep(this.getAllErrors(), function(err) {
				return err.id !== id;
			});
			this.updateErrors(otherErrors);
		};
		/**
		 * Update error
		 */
		this.updateAttributeErrors = function(id, attribute, errors) {
			// remove all errors for this field
			var otherErrors = $.grep(this.getAllErrors(), function(err) {
				return !(err.id === id && err.attribute === attribute);
			});
			// add errors
			$.each(errors, function(index, error) {
				error["id"] = id;
				error["attribute"] = attribute;
				otherErrors.push(error);
			});
			this.updateErrors(otherErrors);
		};
		/**
		 * Validate new record
		 */
		this.validateNewRecord = function(record) {
			var me = this;
			$.each(this.getAttributes(), function(index, attribute) {
				if (attribute.mandatory && ! record[attribute.name]) {
					me.updateAttributeErrors(record[me.extraproperties.ID], attribute.name, [{
						field: attribute.description,
						message: $.validator.messages.required
					}]);
				}
			});
		};
		/**
		 * Validate cloned record
		 */
		this.validateClonedRecord = function(orig_id, new_id) {
			var me = this;
			var errors = $.grep(this.getAllErrors(), function(err) {
				return err.id === orig_id;
			});
			$.each(errors, function(index, error) {
				me.updateAttributeErrors(new_id, error.attribute, [{
					field: error.field,
					message: error.message
				}]);
			});
		};
		/**
		 * Get field errors
		 */
		this.getFieldErrors = function(id, attribute) {
			// remove all errors for this field
			return $.grep(this.getAllErrors(), function(err) {
				return err.id === id && err.attribute === attribute;
			});
		};


		/*
		 * GETTERS
		 */
		this.getAttributes = function() {
			return this.attributes;
		};
		this.getData = function() {
			if (this.getWidgetConfig().layout === "form") {
				if (this.data.length) {
					return this.data[0];
				} else {
					return {};
				}
			} else if (this.isFromGrid() && this.recordId !== undefined & this.recordId < this.data.length) {
				return this.data[this.recordId];
			} else {
				return this.data;
			}
		};
		this.getRawData = function() {
			return this.data;
		};
		this.getMetadata = function() {
			return this.metadata;
		};
		this.getWidgetConfig = function() {
			return this.widgetConfig;
		};
		this.isFromGrid = function() {
			return this.fromGrid;
		};

		/*
		 * SETTERS
		 */
		this.setData = function(data) {
			// save copy of data
			this.data = data.slice();
		}

		/*
		 * PRIVATE FUNCTIONS
		 */
		var onObjectReady = function() {
			onReadyFunction.apply(onReadyScope);
		};

		/*
		 * CUSTOM FUNCTIONS
		 */
		this.getTotalRows = function() {
			var metadata = this.getMetadata();
			return metadata && metadata.total ? metadata.total : this.getRawData().length;
		};

		/*
		 * Call init function and return object
		 */
		this.init();
	};
	$.Cmdbuild.standard.backend.CustomFormWidget = CustomFormWidget;

	/**
	 * @param {String} instanceForm 
	 * @return {Object}
	 */
	function getWidgetConfig(instanceForm, widgetId) {
		var instanceForm = $.Cmdbuild.dataModel.forms[instanceForm];
		var formWidgets = instanceForm.getBackendWidgets();
		var i = 0;
		while (i < formWidgets.length) {
			if (formWidgets[i]._id === widgetId) {
				return formWidgets[i].data;
			}
			i++;
		}
		return null;
	};

	/**
	 * @param {Array} attributes
	 * @return {Object}
	 */
	function getEmptyData(attributes) {
		var data = {};
		// dynamic data
		$.each(attributes, function(index, attribute) {
			data[attribute.name] = null;
		});
		return data;
	};

	/**
	 * Get max key
	 * @param {Array} items
	 * @return {Integer}
	 */
	function getMaxKey(items, property) {
		var max = -1;
		$.each(items, function(index, item) {
			if (item[property] > max) {
				max = item[property];
			}
		});
		return max;
	};

	/**
	 * @param {Object} obj1
	 * @param {Object} obj2
	 * @return {Boolean}
	 */
	function compareObjects(obj1, obj2) {
		if (Object.keys(obj1).length !== Object.keys(obj2).length) {
			return false;
		}
		for (var key in obj1) {
			if (obj1[key] !== obj2[key]) {
				return false;
			}
		}
		return true;
	};
}) (jQuery);

(function($) {

	var WIDGETTYPE = ".CustomForm";

	var _attributes_sorter = function (a,b) {
		if (a.index < b.index)
			return -1;
		if (a.index > b.index)
			return 1;
		return 0;
	};

	/**
	 * @param {String} widgetId
	 * @param {String} fieldName
	 */
	var _getWidgetAttributeName = function(widgetId, fieldName) {
		return widgetId + "_" + fieldName;
	};

	var InstanceAndCustomFormWidgets = function(param, onReadyFunction, onReadyScope) {
		// inheritance
		var backend = new $.Cmdbuild.standard.backend.Activity(param, onReadyFunction, onReadyScope);

		// custom backend variables
		backend.allAttributes = undefined;
		backend.cfwAttributes = undefined;
		backend.allData = undefined;
		backend.cfwData = undefined;

		/**
		 * @override
		 */
		backend.getAttributes = function() {
			if (this.allAttributes) {
				return this.allAttributes;
			}

			// Get base instance attributes
			var instanceAttributes = this.attributes;
			instanceAttributes.sort(_attributes_sorter);

			// Merge base attributes with widget attributes
			var attributes = $.merge(instanceAttributes, getAttributesFromWidgets());

			this.allAttributes = attributes;
			return attributes;
		};

		/**
		 * @override
		 */
		backend.getData = function() {
			if (this.allData) {
				return this.allData;
			}

			// merge objects
			var data = {};
			$.extend(data, this.data, getDataFromWidgets());

			this.allData = data;
			return data;
		};

		/**
		 * @param {Object} widget Widget configuration
		 * @returns {Array} List of attributes
		 */
		backend.extractWidgetAttributes = function(widget, start_index) {
			var attributes = [];
			start_index = start_index ? start_index : 0;
			var widgetconfig = widget.data;
			if (widgetconfig.model) {
				var fields = JSON.parse(widgetconfig.model);
				var readonly = backend.param.readOnly;
				readonly = readonly || widgetconfig.capabilities.readOnly;
				readonly = readonly || widgetconfig.capabilities.modifyDisabled;
				readonly = readonly || widgetconfig.capabilities.addDisabled;
				$.each(fields, function(fi, field) {
					// append 
					field.originalName = field.name;
					field.name = _getWidgetAttributeName(widget._id, field.name);
					field.index += start_index;
					field.group = widget.label;
					if (readonly || !field.writable) {
						field.interactivity = $.Cmdbuild.global.READ_ONLY;
					}
					attributes.push(field);
				});
			}
			return attributes;
		};

		/*
		 * Get attributes from widgets configuration
		 */
		var getAttributesFromWidgets = function() {
			if (backend.cfwAttributes) {
				return backend.cfwAttributes;
			}
			var attributes = [];
			if (backend.widgets) {
				// iterate widgets
				$.each(backend.widgets, function(index, widget) {
					var attr_base_index = attributes.length;
					if (widget.type === WIDGETTYPE && widget.active && widget.data.layout === "form") {
						// get attributes from custom form widgets 
						attributes = attributes.concat(backend.extractWidgetAttributes(widget, attr_base_index));
					}
				});
			}

			// sort attributes
			attributes.sort(_attributes_sorter);

			backend.cfwAttributes = attributes;
			return attributes;
		}

		/*
		 * Get data from widgets configuration
		 */
		var getDataFromWidgets = function() {
			if (backend.cfwData) {
				return backend.cfwData;
			}
			var data = {};
			if (backend.widgets) {
				// iterate widgets
				$.each(backend.widgets, function(index, widget) {
					if (widget.type === WIDGETTYPE && widget.active && widget.data.layout === "form") {
						// get data from custom form widgets 
						var widgetconfig = widget.data;
						var defaulData = {};
						if (widgetconfig.data) {
							var widgetdata = JSON.parse(widgetconfig.data);
							defaulData = widgetdata[0];
						}
						$.each(backend.cfwAttributes, function(index, attribute) {
							data[attribute.name] = defaulData[attribute.originalName];
						})
					}
				});
			}

			backend.cfwData = data;
			return data;
		};

		return backend;
	};

	$.Cmdbuild.standard.backend.InstanceAndCustomFormWidgets = InstanceAndCustomFormWidgets;
}) (jQuery);

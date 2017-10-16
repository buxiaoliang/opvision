(function($) {
	var widgets = {
		// methods for save data. 
		SAVEONCARD: "SAVEONCARD",
		SAVEAFTER: "SAVEAFTER",
		// there are widgets that save data directly in the card on which they are. (LinkCards)
		// there are widgets that save data in separated calls at server (OpenAttachment)
		
		/**
		 * Get widgets data
		 * @param {String} form
		 * @param {Array} widgets
		 * @param {Function} callback
		 * @param {jQuery} callbackScope
		 */
		getWidgetsData: function(form, widgets, callback, callbackScope) {
			$.Cmdbuild.authProxy.maskRequest();
			// get widgets data
			getWidgetsData(form, widgets, {}, callback, callbackScope);
		},

		getWidgetsErrors: function(form, widgets) {
			var me = this;
			var errors = [];

			if (widgets && widgets.length) {
				$.each(widgets, function(index, widget) {
					var widgetName = $.Cmdbuild.standard.widgetDiv.widgetName(widget.type);
					if ($.Cmdbuild.widgets[widgetName]) {
						if ($.Cmdbuild.widgets[widgetName].getWidgetErrors) {
							// get widget errors (Array)
							werrors = $.Cmdbuild.widgets[widgetName].getWidgetErrors(form, widget);
							if (werrors && werrors.length) {
								$.each(werrors, function(i, werror){
									errors.push({
										label : widget.label,
										error: werror,
										id : widget._id
									})
								});
							}
						}
					} else {
						// widget not implemented
						console.warn("Widget " + widget.type + " not found!");
					}
				});
			}

			return errors;
		},

		saveOnDataWidgets: function(card, widgetsData) {
			var _widgets = [];
			$.each(widgetsData, function(key, widget) {
				if (widget.saveType == $.Cmdbuild.widgets.SAVEONCARD) {
					var output = {};
					if (widget.widgetType === ".CustomForm") {
						output = widget.data;
					} else if (widget.widgetType === ".NavigationTree") {
						output = widget.data;
					} else {
						// TODO: why is needed this operation???
						for (var dkey in widget.data) {
							output[dkey] = {};
						}
					}
					_widgets.push({
						_id : key,
						output : output
					});
				}
			});
			card["_widgets"] = _widgets;
		},
		savePostponedWidgets: function(widgets, widgetData, param, parent_form, callback, callbackScope) {
			var widgetsArray = widgets.slice();
			widgetsArray = $.grep(widgetsArray, function(w, i) {
				return widgetData[w._id].saveType == $.Cmdbuild.widgets.SAVEAFTER;
			});
			this.savePostponedWidgetsRecursive(widgetsArray, widgetData, param, parent_form, function() {
				callback.apply(callbackScope, []);
			}, this);
			
		},
		savePostponedWidgetsRecursive: function(widgets, widgetData, param, parent_form, callback, callbackScope) {
			if (widgets.length <= 0) {
				callback.apply(callbackScope, []);
				return;
			}
			var widget = widgets[0];
			widgets.splice(0, 1);
			var data = widgetData[widget._id];
			if (! data) {
				callback.apply(callbackScope, []);
				return;
			}
			if (data.saveType == $.Cmdbuild.widgets.SAVEAFTER) {
				var widgetName = $.Cmdbuild.standard.widgetDiv.widgetName(data.widgetType);
				$.Cmdbuild.widgets[widgetName].flush(param, widgetData[widget._id].data, widget._id, parent_form, function() {
					this.savePostponedWidgetsRecursive(widgets, widgetData, param, parent_form, callback, callbackScope);
				}, this);
			} else {
				this.savePostponedWidgetsRecursive(widgets, widgetData, param, parent_form, callback, callbackScope);
			}
		},
		evaluateCqlFields: function(form, widgets) {
			for (var i = 0; i < widgets.length; i++) {
				var widget = widgets[i];
				var widgetName = $.Cmdbuild.standard.widgetDiv.widgetName(widget.type);
				if ($.Cmdbuild.widgets[widgetName] && $.Cmdbuild.widgets[widgetName].evaluateCql) {
					$.Cmdbuild.widgets[widgetName].evaluateCql(form, widget);
				}
			}
		},
		initialize: function(form, widgets) {
			for (var i = 0; i < widgets.length; i++) {
				var widget = widgets[i];
				var widgetName = $.Cmdbuild.standard.widgetDiv.widgetName(widget.type);
				if ($.Cmdbuild.widgets[widgetName] && $.Cmdbuild.widgets[widgetName].initialize) {
					$.Cmdbuild.widgets[widgetName].initialize(form, widget);
				}
			}
		},
		refreshCqlField: function(form, widgets) {
			if (widgets === undefined) {
				widgets = [];
			}
			for (var i = 0; i < widgets.length; i++) {
				var widget = widgets[i];
				var widgetName = $.Cmdbuild.standard.widgetDiv.widgetName(widget.type);
				if ($.Cmdbuild.widgets[widgetName] && $.Cmdbuild.widgets[widgetName].refreshCqlField) {
					$.Cmdbuild.widgets[widgetName].refreshCqlField(form, widget);
				}
			}
		},
		refreshTemplate: function(form, widgets, templateName) {
			for (var i = 0; i < widgets.length; i++) {
				var widget = widgets[i];
				var widgetName = $.Cmdbuild.standard.widgetDiv.widgetName(widget.type);
				if ($.Cmdbuild.widgets[widgetName] && $.Cmdbuild.widgets[widgetName].refreshTemplate) {
					$.Cmdbuild.widgets[widgetName].refreshTemplate(form, widgets[i], templateName);
				}
			}
		},
		prepareFields: function(widgets) {
			for (var i = 0; i < widgets.length; i++) {
				var widget = widgets[i];
				var widgetName = $.Cmdbuild.standard.widgetDiv.widgetName(widget.type);
				if ($.Cmdbuild.widgets[widgetName] && $.Cmdbuild.widgets[widgetName].prepareFields) {
					$.Cmdbuild.widgets[widgetName].prepareFields(widget);
				}
			}
		}
	};
	$.Cmdbuild.widgets = widgets;

	/**
	 * Get widgets data
	 * @param {String} form
	 * @param {Array} widgets
	 * @param {Object} widgetsdata
	 * @param {Function} callback
	 * @param {jQuery} callbackScope
	 */
	function getWidgetsData(form, widgets, widgetsdata, callback, callbackScope) {
		var me = this;
		var widgets_cp = widgets.slice();
		if (! widgetsdata) {
			widgetsdata = {}
		}

		function updateWidgetData(widget_id, widget_type, widget_name, data) {
			widgetsdata[widget_id] = {
				data : data,
				saveType : $.Cmdbuild.widgets[widget_name].saveMethod,
				widgetType : widget_type
			};
			getWidgetsData(form, widgets_cp, widgetsdata, callback, callbackScope);
		};

		if (widgets_cp.length) {
			var widget = widgets_cp.splice(0, 1)[0];
			var widgetName = $.Cmdbuild.standard.widgetDiv.widgetName(widget.type);
			if ($.Cmdbuild.widgets[widgetName]) {
				if ($.Cmdbuild.widgets[widgetName].getWidgetData) {
					$.Cmdbuild.widgets[widgetName].getWidgetData(form, widget, function(data) {
						updateWidgetData(widget._id, widget.type, widgetName, data);
					});
				} else {
					var data = $.Cmdbuild.widgets[widgetName].save(form, widget);
					updateWidgetData(widget._id, widget.type, widgetName, data);
				}
			} else {
				// widget not implemented
				console.warn("Widget " + widget.type + " not found!");
			}
		} else {
			$.Cmdbuild.authProxy.unmaskRequest();
			callback.apply(callbackScope, [widgetsdata]);
		}
	};
}) (jQuery);

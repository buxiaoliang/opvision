(function($) {

	var _getWidgetAttributeName = function(widgetId, fieldName) {
		return widgetId + "_" + fieldName;
	};

	var CustomForm = {
		METADATA_ERRORS : "errors",
		METADATA_HASDATA : "hasdata",

		saveMethod : $.Cmdbuild.widgets.SAVEONCARD,

		initialize : function(form, widget) {
			var formname = this.formName(form, widget);

			var metadata = {};
			metadata[this.METADATA_ERRORS] = [];

			$.Cmdbuild.dataModel.push({
				form : formname,
				type : "customformwidget",
				data : null,
				metadata : metadata
			});
		},

		formName : function(form, widget) {
			var name = form + "_" + widget._id + "_customform";
			return name;
		},

		getWidgetData : function(form, widget, callback) {
			// base form
			var baseForm = $.Cmdbuild.dataModel.forms[form];
			if (baseForm.config.backend === "InstanceAndCustomFormWidgets" && widget.active && widget.data.layout === "form") {
				var output = [];
				// inline form
				var formData = $.Cmdbuild.dataModel.getData(form);
				var backend = baseForm.getBackend();
				var attributes = backend.extractWidgetAttributes(widget);
				var item = {};
				$.each(attributes, function(index, attribute) {
					item[attribute.originalName] = formData[attribute.name];
				});
				// Server wants ouptut as string
				output.push(JSON.stringify(item));
				callback(output);
			} else {
				// popup form
				var me = this;
				var backend = new $.Cmdbuild.standard.backend.CustomFormWidget({
					instanceForm : form,
					widgetId : widget._id
				}, function() {
					var data = [];
					$.each(backend.getRawData(), function(index, item) {
						data.push(JSON.stringify(item));
					});
					callback(data);
				}, me);
			}
		},

		/**
		 * @param {String} form
		 * @param {Object} widget Widget configuration
		 * @returns {Array}
		 */
		getWidgetErrors : function(form, widget) {
			var errors = [];
			var formname = this.formName(form, widget);
			// required error
			if (widget.required && !$.Cmdbuild.dataModel.getMetaData(formname, this.METADATA_HASDATA)) {
				errors.push($.Cmdbuild.translations.getTranslation("cgf_core_cfw_required", "Data required"));
			}
			// data errors
			var data_errors = $.Cmdbuild.dataModel.getMetaData(formname, this.METADATA_ERRORS);
			if (data_errors && data_errors.length) {
				errors.push($.Cmdbuild.translations.getTranslation("cgf_core_cfw_wrongdata", "Wrong data"));
			}
			return errors;
		},

		cleanData : function(form, widget) {
			var name = this.formName(form, widget);
			$.Cmdbuild.dataModel.cleanForm(name);
		},

		createXmlButton: function(form, widget, container, readOnly) {
			var xmlStr;
			var id = form + "_" + widget._id;
			var widgetData = widget.data;
			var widgetLabel = widget.label.replace(/'/g, "\\'");
			xmlStr = "<button ";
			xmlStr += " id='" + id + "' ";
			xmlStr += " text='" + widgetLabel + "' >";
			xmlStr += "		<onClick>";
			xmlStr += "			<command>navigate</command>";
			xmlStr += "			<dialog>" + id + "_widgetDialog</dialog>";
			xmlStr += "			<container>" + container + "</container>";
			xmlStr += "			<form>" + id + "_dialogForm" + "</form>";
			xmlStr += "			<title>" + widget.label + "</title>";
			xmlStr += "		</onClick>";
			xmlStr += "		<params>";
			xmlStr += "			<dialog>" + id + "_widgetDialog</dialog>";
			xmlStr += "			<formDialog>" + id + "_widgetDialog</formDialog>";
			xmlStr += "			<widgetId>" + widget._id + "</widgetId>";
			xmlStr += "			<instanceForm>" + form + "</instanceForm>";
			xmlStr += "			<fromGrid>false</fromGrid>";
			xmlStr += "		</params>";
			xmlStr += "</button>";
			return xmlStr;
		},

		widgetForm : function(id, widget) {
			var widgetData = widget.data;
			// get file name
			var file = "CustomForm";
			if (widgetData.layout === "form") {
				file += "_form";
			} else if (widgetData.layout === "grid") {
				file += "_grid";
			}
			file += ".xml";
			// compose form string
			var xmlStr = '<form title="'+ widget.label +'" id="' + id + '_dialogForm' + '"';
			xmlStr += ' include="widgets/' + file + '"';
			xmlStr += ' fileType="core"';
			xmlStr += ' withId="' + id + '"';
			xmlStr += ' class="cmdbuildTabbedForm" />';
			return xmlStr;
		}

	};
	$.Cmdbuild.widgets.CustomForm = CustomForm;
})(jQuery);
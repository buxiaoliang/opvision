(function($) {
	// Navigation Tree definition
	var NavigationTree = {
		saveMethod: $.Cmdbuild.widgets.SAVEONCARD,

		/**
		 * Get form name
		 * 
		 * @param {String} form Form name
		 * @param {String} widget Widget id
		 * @return {String}
		 */
		formName : function(form, widget) {
			var name = form + "_" + widget._id + "_navigationtree";
			return name;
		},

		/**
		 * Initialize widget
		 * 
		 * @param {String} form
		 * @param {Object} widget Configuration
		 */
		initialize : function(form, widget) {
			var formname = this.formName(form, widget);

			$.Cmdbuild.dataModel.push({
				form : formname,
				type : "navigationtreewidget",
				data : []
			});
		},

		/**
		 * Clean data
		 * 
		 * @param {String} form Form name
		 * @param {String} widget Widget id
		 */
		cleanData : function(form, widget) {
			var name = this.formName(form, widget);
			$.Cmdbuild.dataModel.cleanForm(name);
		},

		/**
		 * Get data for save action
		 * 
		 * @param {String} form
		 * @param {String} widget
		 */
		save: function(form, widget) {
			return $.Cmdbuild.dataModel.getData(this.formName(form, widget));
		},

		/**
		 * Get the XML for the opening button
		 * 
		 * @param {String} form
		 * @param {String} widget
		 * @param {String} container
		 * @param {Boolean} readOnly
		 * @return {String}
		 */
		createXmlButton: function(form, widget, container, readOnly) {
			var xmlStr;
			var id = form + "_" + widget._id;
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
			xmlStr += "			<widgetId>" + widget._id + "</widgetId>";
			xmlStr += "			<instanceForm>" + form + "</instanceForm>";
			xmlStr += "		</params>";
			xmlStr += "</button>";
			return xmlStr;
		}
	};

	$.Cmdbuild.widgets.NavigationTree = NavigationTree;
})(jQuery);
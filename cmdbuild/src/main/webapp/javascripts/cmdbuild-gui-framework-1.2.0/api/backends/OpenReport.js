(function($) {
	var REPORT_FILTER_ATTRIBUTE = "title";
	var EXTENSION_ATTRIBUTE_ID = "_extension";

	var EXTENSION_ATTRIBUTE = {
		_id : EXTENSION_ATTRIBUTE_ID,
		name : EXTENSION_ATTRIBUTE_ID,
		description : $.Cmdbuild.translations.getTranslation("cgf_label_report_extension", "Extension"),
		index : -1,
		active : true,
		hidden : false,
		mandatory : true,
		type : "select",
		options : [{
			value : "pdf",
			label : "PDF"
		}, {
			value : "odt",
			label : "ODT"
		}, {
			value : "rtf",
			label : "RTF"
		}, {
			value : "csv",
			label : "CSV"
		}],
		defaultValue : null,
		writable : true
	}
	
	var OpenReport = function(params, onReadyFunction, onReadyScope) {
		/*
		 * ATTRIBUTES
		 */
		this.attributes = [];
		this.reportId = null;
		this.reportName = null;
		this.reportDescription = null;

		/*
		 * PRIVATE ATTRIBUTES
		 */
		var onReadyFunction = onReadyFunction;
		var onReadyScope = onReadyScope;

		/*
		 * BASE FUNCTIONS
		 */
		/**
		 * Initialize backend
		 */
		this.init = function() {
			this.reportName = params.name;
			this.reportId = params.id;

			// get report id
			var me = this;
			
			if (this.reportId) {
				// get report by id
				$.Cmdbuild.utilities.proxy.getReport(me.reportId, function(data, metadata) {
					if (data) {
						// load report attributes
						me.reportName = data.name;
						me.reportDescription = data.description;
						this.loadAttributes();
					} else {
						// object ready
						onObjectReady();
					}
				}, me);
			} else if (this.reportName) {
				// find report by name
				$.Cmdbuild.utilities.proxy.getReports({
					filter : {
						attribute : {
							simple : {
								attribute : REPORT_FILTER_ATTRIBUTE,
								operator : "equal",
								value : [me.reportName]
							}
						}
					}
				}, function(data, metadata) {
					if (data.length) {
						// load report attributes
						me.reportId = data[0]._id;
						me.reportDescription = data[0].description;
						this.loadAttributes();
					} else {
						// object ready
						onObjectReady();
					}
				}, me);
			} else {
				onObjectReady();
			}
		};
		/**
		 * Load attributes
		 */
		this.loadAttributes = function() {
			$.Cmdbuild.utilities.proxy.getReportAttributes(this.reportId,
					this.loadAttributesCallback, this);
		};
		/**
		 * Load attributes callback
		 */
		this.loadAttributesCallback = function(attributes) {
			attributes.push($.extend({}, EXTENSION_ATTRIBUTE));
			this.attributes = attributes;
			this.attributes.sort($.Cmdbuild.utilities.attributesSorter);
			onObjectReady();
		};

		/*
		 * GETTERS
		 */
		this.getAttributes = function() {
			return this.attributes;
		};
		this.getReportId = function () {
			return this.reportId;
		};
		this.getReportDescription = function () {
			return this.reportDescription;
		};

		/*
		 * SETTERS
		 */
		

		/*
		 * PRIVATE FUNCTIONS
		 */
		function onObjectReady() {
			onReadyFunction.apply(onReadyScope);
		};

		/*
		 * CUSTOM FUNCTIONS
		 */
		

		/*
		 * Call init function and return object
		 */
		this.init();
	};
	$.Cmdbuild.standard.backend.OpenReport = OpenReport;
})(jQuery);
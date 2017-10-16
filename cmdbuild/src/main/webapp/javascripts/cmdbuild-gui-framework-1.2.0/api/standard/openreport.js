(function($) {
	var openreport = function() {
		this.config = null;
		this.id = null;
		this.backend = null;

		/**
		 * Initialize Open Report
		 * @param {Object} params Configuration parameters
		 */
		this.init = function(params) {
			this.config = params;
			this.config.backend = "OpenReport";
			var backendFn = $.Cmdbuild.utilities.getBackend(this.config.backend);
			this.backend = new backendFn(this.config, this.onInitialized, this);
		};

		/**
		 * On form initialized
		 */
		this.onInitialized = function() {
			if (!this.getBackend().getReportId()) {
				// TODO: show error
				return false;
			}

			if (this.getBackendAttributes().length > 1 || !this.config.extension) {
				// show popup with attributes to download report
				this.showAttributesPopup();
			} else {
				// download report
				this.openReport({
					_extension : this.config.extension
				});
			}
		};

		/**
		 * Open report
		 * 
		 * @param {Object} parameters
		 */
		this.openReport = function(parameters) {
			var extension = parameters._extension;
			window.open($.Cmdbuild.utilities.proxy.getURIForReportDownload(this
					.getBackend().getReportId(), extension,
					parameters));
		};

		/**
		 * Show attributes popup
		 */
		this.showAttributesPopup = function() {
			var me = this;
			var base_id = "openreport_" + this.getBackend().getReportId();

			// create dialogs container
			var dialogcontainer_id = base_id + "_dialogcontainer";
			var $root = $($.Cmdbuild.global.getConfigurationDocument());
			$root.find("DATA").append($("<div></div>").attr("id", dialogcontainer_id));
			// create container and form
			var container_id = base_id + "_form_container";
			var $container = $("<div></div>").attr("id", container_id);
			var $form = createForm(base_id + "_form");
			$form.appendTo($container);

			// get attributes
			var attributes = this.getBackendAttributes();
			// get form validator
			var formValidator = $.Cmdbuild.utilities.getFormValidatorObject();

			// create dialog
			var $div = $('<div />').attr("id", base_id + "_dialog").html($container).dialog({
				title : me.getBackend().getReportDescription(),
				dialogClass : $.Cmdbuild.global.getThemeCSSClass() + " dialogOverflowVisible",
				closeText: $.Cmdbuild.translations.getTranslation("cgf_core_dialog_close", "Close"),
				width : 700,
				height : 400,
				buttons : [{
					text : "OK",
					click : function() {
						var data = getFormParameters($form, me.getBackendAttributes());
						if (data !== undefined) {
							me.openReport(data);
							$(this).dialog("close");
						}
					}
				}],
				close : function(event, ui) {
					$(this).dialog("destroy");
					$root.find("#" + dialogcontainer_id).remove();
					return false;
				},
				create: function( event, ui ) {
					me.drawForm($form, dialogcontainer_id, me.getBackendAttributes());
				}
			});
		};

		/**
		 * Draw form
		 * 
		 * @param {jQuery} $form
		 * @param {String} container_id
		 * @param {Array} attributes
		 */
		this.drawForm = function($form, container_id,  attributes) {
			// get form validator
			var formValidator = $.Cmdbuild.utilities.getFormValidatorObject();
			var jsonAttributes = {
					method : "evaluate",
					fields : {}
				};

			// update attributes with extension
			if (this.config.extension) {
				jsonAttributes.fields._extension = {
					defaultValue : this.config.extension,
					writable : false
				}
			};

			// update attributes with attributes override
			if (!$.isEmptyObject(this.config.customattrs)) {
				$.extend(jsonAttributes.fields, this.config.customattrs);
			}

			// merge json attributes with attributes
			if (! $.isEmptyObject(jsonAttributes.fields)) {
				$.Cmdbuild.dataModel.evaluateJSONAttributes(attributes, jsonAttributes);
			}

			// get form fields
			$.each(attributes, function(index, attribute) {
				// create field
				var $field = $.Cmdbuild.fieldsManager.generateHTML(attribute, $form.attr("id"),
						container_id, attribute.defaultValue);
				var validator = $.Cmdbuild.fieldsManager.getFieldValidator(attribute);
				if (validator && validator.rules && !$.isEmptyObject(validator.rules)) {
					formValidator.rules[attribute._id] = validator.rules;
				}
				$form.append($field);
			});
			$form.validate(formValidator);
		};

		/*
		 * Getters and Setters
		 */
		/**
		 * Get the backend object used for this form
		 * 
		 * @return {Object} The backend object
		 */
		this.getBackend = function() {
			return this.backend;
		};
		/**
		 * Set backend object for this form
		 * 
		 * @param {Object} backend The backend object
		 */
		this.setBackend = function(backend) {
			this.backend = backend;
		};
		/**
		 * Return data from the backend
		 * 
		 * @return {Object} Backend data
		 */
		this.getBackendData = function() {
			var backend = this.getBackend();
			if (!backend.getData) {
				console.warn("Missing getData method for backend "
						+ this.config.backend);
				return backend.data;
			}
			return backend.getData();
		};
		/**
		 * Return attributes from the backend
		 * 
		 * @return {Array} Backend attributes
		 */
		this.getBackendAttributes = function() {
			var backend = this.getBackend();
			if (!backend.getAttributes) {
				console.warn("Missing getAttributes method for backend "
						+ this.config.backend);
				return backend.attributes;
			}
			return backend.getAttributes();
		};
	};
	$.Cmdbuild.standard.openreport = openreport;

	/**
	 * @param {String} formName
	 * @return {jQuery} form object
	 */
	function createForm (formName) {
		var form = $("<form></form>").attr("action", "#")
				.attr("name", formName).attr("id", formName);
		return form;
	};

	/**
	 * Download report
	 * 
	 * @param {jQuery} $form
	 * @param {Array} attributes
	 */
	function getFormParameters($form, attributes) {
		// validate form
		if (!$form.valid()) {
			var errors = [];
			var formErrors = $form.validate().errorList;
			$.each(formErrors, function(index, error) {
				var attributeId = $(error.element).attr("name");
				var attrList = $.grep(attributes, function(a) {
					return a._id == attributeId;
				})
				var attribute = attrList.length > 0 ? attrList[0] : null;
				if (attribute) {
					errors.push({
						field : attribute.description,
						message : error.message
					});
				}
			});
			// show error message
			$.Cmdbuild.errorsManager.popupOnRequestFields(errors);
			return undefined;
		} else {
			var data = {};
			$.each(attributes, function(index, attribute) {
				var id = $.Cmdbuild.fieldsManager.getFieldId($form.attr("id"), attribute._id);
				data[attribute._id] = $.Cmdbuild.utilities.getHtmlFieldValue("#" + id);
			});
			return data;
		}
	};
})(jQuery);
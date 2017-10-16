(function($) {
	var customform_form = function() {
		this.config = null;
		this.id = null;
		this.backend = null;

		/**
		 * Initialize CustomForm Grid
		 * @param {Object} params Configuration parameters
		 */
		this.init = function(params) {
			this.config = params;
			this.config.backend = "CustomFormWidget";
			this.id = params.form;
			var backendFn = $.Cmdbuild.utilities.getBackend(this.config.backend);
			this.backend = new backendFn(this.config, this.show, this);
		};

		/**
		 * Backend loaded callback
		 */
		this.show = function() {
			var me = this;
			// initialize CQL
			$.Cmdbuild.CqlManager.compile(this.config.instanceForm, this.getBackendAttributes());

			// empty container
			var $container = $("#" + this.config.container);
			$container.empty();

			// create form 
			var $form = createForm(this.id);
			$form.appendTo($container);

			// add empty record
			if ($.isEmptyObject(this.getBackend().getData())) {
				this.getBackend().addEmptyRecord();
			}

			// get attributes
			var attributes = this.getBackendAttributes();
			// create fields
			var data = this.getBackendData();
			// get form validator
			var formValidator = $.Cmdbuild.utilities.getFormValidatorObject();

			// get form fields
			$.each(attributes, function(index, attribute) {
				var value = data[attribute._id];
				// read-only forms
				if (me.readonlyForm()) {
					attribute.writable = false;
				}
				// create field
				var $field = $.Cmdbuild.fieldsManager.generateHTML(attribute, me.id,
								me.config.container, value, me.config.instanceForm);
				var v_attribute = attribute;
//				if (me.getBackendWidgetConfig().layout === "grid") {
//					var v_attribute = $.extend({}, attribute, {
//						mandatory : false
//					});
//				}
				var validator = $.Cmdbuild.fieldsManager.getFieldValidator(v_attribute);
				if (validator && validator.rules && !$.isEmptyObject(validator.rules)) {
					formValidator.rules[attribute._id] = validator.rules;
				}
				$form.append($field);

				// refresh WYSIWYG editor - Fixes bug on Firefox
				if (attribute.type === $.Cmdbuild.fieldsManager.types.TEXT && attribute.editorType === "HTML"
						&& (attribute.writable === true || attribute.writable === "true")) {
					$field.find("textarea").cleditor()[0].refresh();
				}
			});
			$form.validate(formValidator);

			// save data on dialog close
			var dialog_id;
			if (this.getBackend().isFromGrid()) {
				dialog_id = me.config.gridId + "_form_dialog";
			} else {
				dialog_id = this.config.instanceForm + "_"
						+ this.config.widgetId + "_widgetDialog";
			}
			var $dialog = $("#" + this.config.container).parents("[role=dialog]");
			function onDialogClose(event, ui) {
					var errors = me.change();
					if (errors.length > 0 && me.getBackendWidgetConfig().layout === "form") {
						var popupId = "errorDialog";
						var message = $.Cmdbuild.errorsManager
								.getAttributesErrorsMessage(errors);
						// show confirmation popup
						$.Cmdbuild.utilities.showConfirmPopup("Error!", message, popupId, {
							text : $.Cmdbuild.translations.getTranslation("cgf_core_dialog_close", "Close"),
							click : function() {
								$("#" + popupId).dialog("close");
								$dialog.off( "dialogbeforeclose", onDialogClose);

								// get original popup
								var $origDialog = $("#" + $dialog.attr("aria-describedby"));
								$origDialog.dialog("close");
							}
						}, {
							text : $.Cmdbuild.translations.getTranslation("cgf_core_dialog_fixerrors", "Fix errors"),
							click : function() {
								$("#" + popupId).dialog("close");
							}
						}, 400, 400);
						return false;
					} else {
						$dialog.off("dialogbeforeclose");
						$container.remove();
						if (me.getBackend().isFromGrid()) {
							var formObject = $.Cmdbuild.dataModel.forms[me.config.gridId];
							formObject.refreshTable();
						}
					}
				}
			$dialog.on( "dialogbeforeclose", onDialogClose);
		};

		/**
		 * Check if form is read-only mode
		 * @return {Boolean}
		 */
		this.readonlyForm = function() {
			var capabilities = this.getBackendWidgetConfig().capabilities;
			return capabilities.readOnly && (capabilities.readOnly === true || capabilities.readOnly === "true");
		};

		/**
		 * Update form data and validate
		 */
		this.change = function() {
			var me = this;

			var $form = $("#" + this.id);

			var attributes = this.getBackendAttributes();
			var data = this.getBackendData();
			var row_id = data[me.getBackend().extraproperties.ID];
			var errors = [];

			// remove row errors
			me.getBackend().removeRowErrors(row_id);

			// validate form
			if (!$form.valid()) {
				var formErrors = $form.validate().errorList;
				$.each(formErrors, function(index, error) {
					var err;
					var attributeId = $(error.element).attr("name");
					var attrList = $.grep(attributes, function(a) {
						return a._id == attributeId;
					})
					var attribute = attrList.length > 0 ? attrList[0] : null;
					if (attribute) {
						err = {
							field : attribute.description,
							message : error.message
						};
						errors.push(err);
					}
					// get all attribute errors
					var errs = me.getBackend().getFieldErrors(row_id, attribute.name);
					if (!errs) {
						errs = []
					}
					errs.push(err);
					// add error into backend
					me.getBackend().updateAttributeErrors(row_id, attribute.name, errs);
				});
			}
			// update backend data
			$.each(attributes, function(index, attribute) {
				var id = $.Cmdbuild.fieldsManager.getFieldId(me.id, attribute._id);
				var value = $.Cmdbuild.utilities.getHtmlFieldValue("#" + id);
				if (value !== data[attribute._id]) {
					me.getBackend().updateRecordProperty(data[me.getBackend().extraproperties.ID], attribute.name, value);
				}
			});
			return errors;
		};

		/*
		 * Getters and Setters
		 */
		/**
		 * Get the backend object used for this form
		 * @return {Object} The backend object
		 */
		this.getBackend = function() {
			return this.backend;
		};
		/**
		 * Set backend object for this form
		 * @param {Object} backend The backend object
		 */
		this.setBackend = function(backend) {
			this.backend = backend;
		};
		/**
		 * Return data from the backend
		 * @return {Object} Backend data
		 */
		this.getBackendData = function() {
			var backend = this.getBackend();
			if (!backend.getData) {
				console.warn("Missing getData method for backend " + this.config.backend);
				return backend.data;
			}
			return backend.getData();
		};
		/**
		 * Set data into the backend
		 * @param {Object} data New data
		 */
		this.setBackendData = function(data) {
			var backend = this.getBackend();
			if (!backend.setData) {
				console.warn("Missing setData method for backend " + this.config.backend);
				backend.data = data;
			} else {
				backend.setData(data);
			}
		};
		/**
		 * Return attributes from the backend
		 * @return {Array} Backend attributes
		 */
		this.getBackendAttributes = function() {
			var backend = this.getBackend();
			if (!backend.getAttributes) {
				console.warn("Missing getAttributes method for backend " + this.config.backend);
				return backend.attributes;
			}
			return backend.getAttributes();
		};
		/**
		 * Set attributes into the backend
		 * @param {Array} attributes New attributes
		 */
		this.setBackendAttributes = function(attributes) {
			var backend = this.getBackend();
			if (!backend.setAttributes) {
				console.warn("Missing setAttributes method for backend " + this.config.backend);
				backend.attributes = attributes;
			} else {
				backend.setAttributes(attributes);
			}
		};
		/**
		 * Return widget configuration from the backend
		 * @return {Object} Backend widget configuration
		 */
		this.getBackendWidgetConfig = function() {
			var backend = this.getBackend();
			if (!backend.getWidgetConfig) {
				console.warn("Missing getAttributes method for backend " + this.config.backend);
				return backend.widgetConfig;
			}
			return backend.getWidgetConfig();
		};
	};
	$.Cmdbuild.standard.customform_form = customform_form;

	/**
	 * @param {String} formName
	 * @return {jQuery} form object
	 */
	function createForm (formName) {
		var form = $("<form></form>").attr("action", "#")
				.attr("name", formName).attr("id", formName);
		return form;
	};
})(jQuery);
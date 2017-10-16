(function($) {
	
	var ERRORCLASS = "errorfield-cell";

	var customform_grid = function() {
		this.config = {};
		this.id = null;
		this.backend = null;
		this.permissions = {
			_add : false,
			_modify : false,
			_delete : false,
			_clone : false,
			_export : false,
			_import : false
		};
		this.maxid = null;

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
			// init permissions
			this.initPermissions();
			// get container
			var $container = $("#" + this.config.container);
			$container.empty();
			// buttons container
			var $div = $("<div></div>").attr("id", this.getButtonsContainerId());
			$div.append(createButtons(this));
			$("#" + this.config.container).append($div);
			// table
			var $table = $("<table></table>").attr("id", this.id).addClass("display");
			$("#" + this.config.container).append($table);

			// get data
			var data = this.getBackendData();
			// data table
			$table.DataTable({
				columns : getColumns(this.getBackendAttributes(), this),
				paging : false,
				searching: false,
				info : false,
				data : data,
				language : {
					zeroRecords : "",
					emptyTable : ""
				}
			});
			// add custom events
			$table.on({
				customformrefreshgrid : me.refreshTable
			});

			// add validation message on dialog close
			var $dialog = $("#" + this.config.container).parents("[role=dialog]");
			function onDialogClose(event, ui) {
				var errors = me.getBackend().getAllErrors();
				if (errors && errors.length) {
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
					// remove event
					return false;
				}
			};
			$dialog.on( "dialogbeforeclose", onDialogClose);
		};

		/**
		 * Initialize permissions
		 */
		this.initPermissions = function() {
			var capabilities = this.getBackendWidgetConfig().capabilities;
			if (capabilities.readOnly && (capabilities.readOnly === true || capabilities.readOnly === "true")) {
				return;
			}
			if (capabilities.addDisabled === false || capabilities.addDisabled == "false") {
				this.permissions._add = true;
			}
			if (capabilities.modifyDisabled === false || capabilities.modifyDisabled === "false") {
				this.permissions._modify = true;
			}
			if (capabilities.deleteDisabled === false || capabilities.deleteDisabled === "false") {
				this.permissions._delete = true;
			}
			if (capabilities.cloneDisabled === false || capabilities.cloneDisabled === "false") {
				this.permissions._clone = true;
			}
			if (capabilities.exportDisabled === false || capabilities.exportDisabled === "false") {
				this.permissions._export = true;
			}
			if (capabilities.importDisabled === false || capabilities.importDisabled === "false") {
				this.permissions._import = true;
			}
		};

		/**
		 * Add row into table
		 * @param {Object} data
		 */
		this.addRow = function(data) {
			var $table = $("#" + this.id).DataTable();
			$table.row.add(data).draw();
		};

		/**
		 * Add new empty row
		 */
		this.addEmptyRow = function() {
			// add empty row into store
			var emptyRow = this.getBackend().addEmptyRecord();
			// draw row
			this.addRow(emptyRow);
		};

		/**
		 * Update row value
		 * @param {Integer} rowId
		 * @param {String} column
		 * @param {String|Integer|Numeric|Boolean} newvalue
		 */
		this.updateRowValue = function(rowId, column, newvalue) {
			// update data
			this.getBackend().updateRecordProperty(rowId, column, newvalue);
		};

		/**
		 * Clone row
		 * @param {Integer} rowId
		 */
		this.cloneRow = function(rowId) {
			// clone item on store
			var item = this.getBackend().cloneRecord(rowId);
			// add item into table
			if (item) {
				this.addRow(item);
			}
		};

		/**
		 * Delete row
		 * @param {Integer} rowId
		 * @param {DOM} cell
		 */
		this.deleteRow = function(rowId, cell) {
			// remove item from store
			this.getBackend().removeRecord(rowId);
			// remove row
			var $table = $("#" + this.id).DataTable();
			$table.row($(cell).parents('tr')).remove().draw();
		};

		/**
		 * Modify row
		 * @param {Integer} recordId
		 */
		this.modifyRow = function(recordId) {
			var me = this;
			var id = me.id + "_" + recordId;
			var base_string = me.config.instanceForm + "_" + me.config.widgetId;
			var formdialog = base_string + "customform_widget_grid_form_dialog";
			// caller parameters
			$.Cmdbuild.dataModel.prepareCallerParameters(id, {
				instanceForm : me.config.instanceForm,
				widgetId : me.config.widgetId,
				recordId : recordId,
				gridId : me.id,
				fromGrid : true,
				formDialog : formdialog
			});
			// open popup
			$.Cmdbuild.eventsManager
					.onEvent({
						id : id,
						command : "navigate",
						dialog : formdialog,
						form : base_string + "include_customform_widget_grid_form_dialog",
						title : me.getBackendWidgetConfig().label
					});
		};

		/**
		 * Refresh table
		 */
		this.refreshTable = function() {
			var $table = $("#" + this.id).DataTable();
			// remove all rows
			$table.rows().clear();
			$table.rows.add(this.getBackendData()).draw();
		};

		/**
		 * Get the id of the buttons container
		 * @return {String}
		 */
		this.getButtonsContainerId = function() {
			return this.id + "_buttons"
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
	$.Cmdbuild.standard.customform_grid = customform_grid;

	/**
	 * @param {Array} attributes
	 * @return {Array}
	 */
	function getColumns(attributes, form) {
		var columns = [];
		var column_id = form.getBackend().extraproperties.ID;
		var column_commands = form.getBackend().extraproperties.COMMANDS;
		// id column
		columns.push({
			title : column_id,
			name : column_id,
			data : column_id,
			visible : false
		});
		// attributes columns
		$.each(attributes, function(index, attribute) {
			var visible = attribute.hidden !== undefined && (attribute.hidden === false || attribute.hidden === "false");
			var label = attribute.description;
			// add asterisk to mandatory fields labels
			if (attribute.mandatory) {
				label = "* " + label;
			}
			var column = {
				title : label,
				name : attribute.name,
				data : attribute.name,
				id : attribute._id,
				type : attribute.type,
				visible : visible,
				createdCell : function(cell, cellData, rowData, rowIndex, colIndex) {
					if (visible) {
						getReadOnlyField (cell, attribute, rowData[column_id], cellData, form);
					}
				}
			};
			if ((attribute.type === "reference") || (attribute.type === "lookup")) {
				column.sType = "reference-sorter"
			}
			columns.push(column);
		});

		// reference sorters
		jQuery.fn.dataTableExt.oSort['reference-sorter-asc']  = function(a, b) {
			var a_text = $("#" + form.id + " input[value=" + a + "]:first-child").parent().text();
			var b_text = $("#" + form.id + " input[value=" + b + "]:first-child").parent().text();
			return a_text < b_text
		};
		jQuery.fn.dataTableExt.oSort['reference-sorter-desc']  = function(a,b) {
			return jQuery.fn.dataTableExt.oSort['reference-sorter-asc'](b, a);
		};

		// commands column
		columns.push({
			title : "",
			name : column_commands,
			data : column_commands,
			width : "85px",
			createdCell : function( cell, cellData, rowData, rowIndex, colIndex ) {
				// modify button
				$(cell).append($("<a></a>").attr("href", "#").button({
					disabled : ! form.permissions._modify,
					icons : {
						primary: "ui-icon-pencil"
					},
					label : $.Cmdbuild.translations.getTranslation("cgf_core_cfw_modify_row", "Modify row"),
					text : false
				}).click(function() {
					form.modifyRow(rowData[column_id]);
					return false;
				}));
				// clone button
				$(cell).append($("<a></a>").attr("href", "#").button({
					disabled : ! form.permissions._clone,
					icons : {
						primary: "ui-icon-copy"
					},
					label : $.Cmdbuild.translations.getTranslation("cgf_core_cfw_clone_row", "Clone row"),
					text : false
				}).click(function() {
					form.cloneRow(rowData[column_id]);
					return false;
				}));
				// delete button
				$(cell).append($("<a></a>").attr("href", "#").button({
					disabled : ! form.permissions._delete,
					icons : {
						primary: "ui-icon-trash"
					},
					label : $.Cmdbuild.translations.getTranslation("cgf_core_cfw_delete_row", "Delete row"),
					text : false
				}).click(function() {
					form.deleteRow(rowData[column_id], cell);
					// Fix bug - tooltip doesn't disappear
					var fadetime = 500;
					var tooltipid = $(this).attr("aria-describedby");
					$("#" + tooltipid).fadeOut(fadetime);
					setTimeout(function() {
						$("#" + tooltipid).remove();
					}, fadetime);
					return false;
					
				}));
			}
		});
		return columns;
	};

	/**
	 * Get read-only field
	 * @param {DOM} cell
	 * @param {Object} attribute
	 * @param {Integer} rowId
	 * @param {String|Integer|Numeric|Boolean} value
	 * @param {Object} form
	 */
	function getReadOnlyField (cell, attribute, rowId, value, form) {
		$(cell).empty();
		// add read-only field
		var attr = $.extend({}, attribute, {
			_id : "row_" + rowId + "_" + attribute.name,
			writable : false
		});
		var $field = $.Cmdbuild.fieldsManager.getFormField(attr, form.id, form.config.container, value);
		$(cell).append($field);
		// errors
		var fielderrors = form.getBackend().getFieldErrors(rowId, attribute.name);
		if (fielderrors.length) {
			$(cell).addClass(ERRORCLASS);
		}
		// add click event listener to cell
		if (form.permissions._modify
				&& attribute.writable
				&& !$.Cmdbuild.global.getApplicationConfig().widgets.customform.disableinlineediting) {
			$(cell).off("clickoutside");
			$(cell).click(function() {
				getEditableField(cell, attribute, rowId, value, form);
				return false;
			});
		}
	};

	/**
	 * Get editable field
	 * @param {DOM} cell
	 * @param {Object} attribute
	 * @param {Integer} rowId
	 * @param {String|Integer|Numeric|Boolean} value
	 * @param {Object} form
	 */
	function getEditableField (cell, attribute, rowId, value, form) {
		var attr_id = "row_" + rowId + "_" + attribute.name;
		var $cell = $(cell);
		$cell.removeClass(ERRORCLASS);
		var $form = $("<form></form>").attr("name", attr_id + "_fieldform")
				.attr("id", attr_id + "_fieldform").submit(function() {
					return false;
				});
		
		// add form to cell
		$cell.empty();
		$form.appendTo($cell);

		// add editable field
		var attr = $.extend({}, attribute, {
			_id : attr_id,
			mandatory : false
		});
		var $field = $.Cmdbuild.fieldsManager.getFormField(attr, $form.attr("id"), form.config.container, value, form.config.instanceForm);
		$form.append($field);
		var $input = $field;
		if ($.isArray($field)) {
			$input = $field[0];
		}
		$input.focus();

		// add validation
		var formValidator = $.Cmdbuild.utilities.getFormValidatorObject();
		var validator = $.Cmdbuild.fieldsManager.getFieldValidator(attr);
		if (validator && validator.rules && !$.isEmptyObject(validator.rules)) {
			formValidator.rules[attr_id] = validator.rules;
		}
		$form.validate(formValidator);

		function addClickoutsideEvent() {
			var events = $._data(cell, "events");
			if (!(events && events.clickoutside)) {
				$cell.on("clickoutside", function(event, target) {
					// if target is the calendar, do not execute event
					if ($(target).closest("#ui-datepicker-div, .ui-datepicker-header").length) {
						return;
					}

					var errors = [];
					// validate form
					if (!$form.valid()) {
						var formErrors = $form.validate().errorList;
						$.each(formErrors, function(index, error) {
							errors.push({
								field : attribute.description,
								message : error.message
							});
						});
					} 
					// add errors on backend
					form.getBackend().updateAttributeErrors(rowId, attribute.name, errors);

					// add read-only field
					var newval = $input.val();
					getReadOnlyField(cell, attribute, rowId, newval, form);
					form.updateRowValue(rowId, attribute.name, newval);

					return false;
				});
			}
		};
		function removeClickoutsideEvent() {
			$cell.off("clickoutside");
		};
		function removeClickEvent() {
			$cell.off("click");
		};

		// clickout event
		if (attribute.type === $.Cmdbuild.fieldsManager.types.REFERENCE) {
			// add clickout event when field is ready
			$input.on({
				cmdbuildfieldready : function() {
					removeClickEvent();
					addClickoutsideEvent();
				},
				searchreferenceitem : function() {
					removeClickoutsideEvent();
				}
			});
			$("#" + $input.attr("id") + "_lookupDialog").on("dialogclose", function(event, ui) {
				addClickoutsideEvent();
			});
		} else {
			removeClickEvent();
			addClickoutsideEvent();
		}
	};

	/**
	 * @param {Object} form
	 */
	function createButtons(form) {
		var buttons = [];
		// add button
		buttons.push($("<a></a>").attr("href", "#").button({
			disabled : ! form.permissions._add,
			icons : {
				primary: "ui-icon-plusthick"
			},
			label : $.Cmdbuild.translations.getTranslation("cgf_core_cfw_add_row", "Add row"),
			text : true
		}).click(function() {
			form.addEmptyRow();
			return false;
		}));
		return buttons;
	};

})(jQuery);

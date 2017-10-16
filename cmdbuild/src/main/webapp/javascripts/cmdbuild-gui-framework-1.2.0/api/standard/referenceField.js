(function($) {
	var TARGET_CLASS_BACKEND = "CardList";
	var TARGET_PROCESS_BACKEND = "ReferenceActivityList";

	/**
	 * @param {Object} config
	 * @param {String} config.id
	 * @param {String} config.targetClass
	 * @param {String} config.targetType
	 * @param {Object} config.filter
	 * @param {Boolean} config.readOnly
	 * @param {Integer} config.optionsLimit Max number of options within the select
	 * @param {*} config.value
	 * @param {String} config.displayAttribute
	 * @param {Boolean} config.mandatory
	 * @param {Boolean} config.preselectIfUnique
	 * @param {String} config.cqlRefForm
	 * @param {String} config.cqlRefField
	 * @param {String} config.customBackend
	 * @param {String} config.sortAttribute
	 * @param {String} config.sortDirection
	 */
	var referenceField = function(config) {
		this.config = config;
		this.backend = undefined;
		
		this.init = function() {
			if (!this.config.displayAttribute) {
				this.config.displayAttribute = $.Cmdbuild.standard.configuration.reference.displayAttribute;
			}
			if (!this.config.optionsLimit) {
				this.config.optionsLimit = $.Cmdbuild.standard.configuration.reference.optionsLimit;
			}
			if (!this.config.sortAttribute) {
				this.config.sortAttribute = $.Cmdbuild.standard.configuration.reference.sort.attribute;
			}
			if (!this.config.sortDirection) {
				this.config.sortDirection = $.Cmdbuild.standard.configuration.reference.sort.direction;
			}
			var backendName = getBackendName(this.config.targetType, this.config.targetClass, this.config.customBackend);

			// backend
			var backendFn = $.Cmdbuild.utilities.getBackend(backendName);
			var params = {
				className : this.config.targetClass
			};
			this.setBackend(new backendFn(params, this.initReference, this));
		};

		this.initReference = function() {
			var me = this;

			// add dialog
			var $selectMenu = $("#" + this.config.id);
			addDialog(this.config.id + "_lookupDialog");

			// create dialog form
			$.Cmdbuild.standard.elements.lookupDialog(this.config.id, {
				formName : $selectMenu.attr("form"),
				fieldName : $selectMenu.attr("name"),
				className : this.config.targetClass,
				backend : getBackendName(this.config.targetType, this.config.targetClass, this.config.customBackend),
				toExecCommand : this.config.id,
				bReference : "",
				cqlRefForm : this.config.cqlRefForm,
				cqlRefField : this.config.cqlRefField,
				container : this.config.container,
				sort : this.config.sortAttribute,
				direction : this.config.sortDirection
			});

			// add event listeners
			$selectMenu.on({
				clearreference : function(event) {
					me.clear();
				},
				searchreferenceitem : function(event) {
					var id = me.config.id;
					$.Cmdbuild.standard.commands.navigate({
						form : id + "_dialog",
						dialog : id + "_lookupDialog",
						title : getPopupTitle(me.config.targetClass, me.config.targetType),
						width : "90%"
					});
				},
				itemselectedfromgrid : function(event) {
					var new_value = $.Cmdbuild.dataModel.getValue(me.config.id
							+ "_dialogGrid", "_id");
					me.updateValue(new_value);
				},
				refreshfield : function(event) {
					me.loadReference();
				}
			});

			this.loadReference();
		};

		/**
		 * Init reference
		 */
		this.loadReference = function() {
			var me = this;
			if (this.config.readOnly) {
				this.loadReadOnlyReference();
				return;
			}

			$.Cmdbuild.CqlManager.resolve(me.config.cqlRefForm, me.config.cqlRefField, function(filter) {
				/*
				 * if filter is undefined or there is an error or 
				 * a field present in the filter is not valorized
				 */
				if (filter == undefined || $.Cmdbuild.CqlManager.isUndefined(filter)) {
					me.addEmptyOption();
					return;
				}
				if (filter) {
					me.config.filter = {
							CQL: filter
					};
					me.getBackend().filter = this.config.filter;
				}
				me.loadData();
			}, this);
		};

		/**
		 * Load read-only reference
		 */
		this.loadReadOnlyReference = function() {
			var me = this;
			if (this.config.value) {
				var $input = $("#" + this.config.id);
				var $span = $("<span></span>").addClass("referenceLabel");
				$input.after($span);
				// load reference item data
				if (isClass(this.config.targetType, this.config.targetClass)) {
					$.Cmdbuild.utilities.proxy.getCardData(this.config.targetClass, this.config.value, {}, function(data, metadata) {
						$span.text(data[me.config.displayAttribute]);
						// field ready
						me.fieldReady();
					}, this);
				} else {
					$.Cmdbuild.utilities.proxy.getCardProcess(this.config.targetClass, this.config.value, {}, function(data, metadata) {
						$span.text(data[me.config.displayAttribute]);
						// field ready
						me.fieldReady();
					}, this);
				}
			}
		};

		/**
		 * Add empty option
		 */
		this.addEmptyOption = function() {
			// get select and empty
			var $selectMenu = $("#" + this.config.id);
			$selectMenu.empty();

			// append options
			var $option = $("<option></option>").attr("selected", "selected");
			$selectMenu.append($option);

			// set value
			$selectMenu.val("");
			this.fieldChanged();
			// this ready
			this.fieldReady();
		};

		/**
		 * Add options from backend data
		 */
		this.addOptionsFromBackend = function() {
			var me = this;
			// get select and empty
			var $selectMenu = $("#" + this.config.id);
			$selectMenu.empty();

			var data = this.getBackend().getData();
			var isMandatory = this.config.mandatory === "true"
					|| this.config.mandatory === true;

			// append options
			$selectMenu.append($("<option></option>"));
			$.each(data, function(index, item) {
				var $option = $("<option></option>").attr("value", item._id).text(item[me.config.displayAttribute]);
				if (item._id == me.config.value || (data.length === 1 && (isMandatory || me.config.preselectIfUnique))){
					$option.attr("selected", "selected");
					$selectMenu.val(me.config.value);
				}
				$selectMenu.append($option);
			});

			// set value
			this.fieldChanged();
			// field ready
			this.fieldReady();
		};

		/**
		 * Add option for current value
		 */
		this.addOptionForCurrentValue = function() {
			var me = this;
			// get select and empty
			var $selectMenu = $("#" + this.config.id);
			$selectMenu.empty();

			if (isClass(this.config.targetType, this.config.targetClass)) {
				$.Cmdbuild.utilities.proxy.getCardData(this.config.targetClass, this.config.value, {}, function(data, metadata) {
					// append options
					$selectMenu.append($("<option></option>").attr("value", data._id).text(data[me.config.displayAttribute]));
					$selectMenu.val(data._id);

					// set value
					me.fieldChanged();
					// field ready
					me.fieldReady();
				}, this);
			} else {
				$.Cmdbuild.utilities.proxy.getCardProcess(this.config.targetClass, this.config.value, {}, function(data, metadata) {
					// append options
					$selectMenu.append($("<option></option>").attr("value", data._id).text(data[me.config.displayAttribute]));
					$selectMenu.val(data._id);

					// set value
					me.fieldChanged();
					// field ready
					me.fieldReady();
				}, this);
			}
		};

		/**
		 * Propagate field changed event
		 */
		this.fieldChanged = function() {
			if ($.Cmdbuild.custom.commands && $.Cmdbuild.custom.commands.fieldChanged) {
				$.Cmdbuild.custom.commands.fieldChanged(this.config);
			} else {
				$.Cmdbuild.standard.commands.fieldChanged(this.config);
			}
			$("#" + this.config.id).selectmenu("refresh");
			$("#" + this.config.id).trigger("cmdbuildfieldchanged");
		};

		/**
		 * Propagate field changed event
		 */
		this.fieldReady = function() {
			$("#" + this.config.id).trigger("cmdbuildfieldready");
		};

		/**
		 * Load reference items
		 */
		this.loadData = function() {
			var me = this;
			var config = {
				page : 0,
				start : 0,
				nRows : me.config.optionsLimit,
				sort : me.config.sortAttribute,
				direction: me.config.sortDirection
			};
			
			this.getBackend().loadData(config, this.showReference, this);
		};

		/**
		 * Show reference options
		 */
		this.showReference = function(data, metadata) {
			var me = this;
			var $selectMenu = $("#" + this.config.id);
			var showOptions = this.getBackend().getTotalRows() < this.config.optionsLimit;
			if (showOptions) {
				this.addOptionsFromBackend();
			} else if (this.config.value) {
				this.addOptionForCurrentValue();
			} else {
				this.addEmptyOption();
			}

			// disable open dialog event
			$selectMenu.off( "selectmenuopen", openDialogFn);
			if (!showOptions) {
				// enable open dialog event only if options are not shown
				$selectMenu.on( "selectmenuopen", openDialogFn);
			}
		};

		this.updateValue = function(new_value) {
			var me = this;
			this.config.value = new_value;
			if (this.getBackend().getTotalRows() < this.config.optionsLimit) {
				$("#" + me.config.id).val(new_value);
				me.fieldChanged();
			} else {
				me.addOptionForCurrentValue()
			}
		};

		/**
		 * Clear reference field
		 */
		this.clear = function() {
			var $selectMenu = $("#" + this.config.id);
			var showOptions = this.getBackend().getTotalRows() < this.config.optionsLimit;
			if (! showOptions) {
				this.addEmptyOption();
			} else {
				$selectMenu.val("");
				this.fieldChanged();
			}
		};

		/**
		 * @return {Backend} 
		 */
		this.getBackend = function() {
			return this.backend;
		}
		/**
		 * @param {Backend} backend 
		 */
		this.setBackend = function(backend) {
			this.backend = backend;
		}
		
		this.init();
	};
	$.Cmdbuild.standard.referenceField = referenceField;

	/**
	 * @param {String} targetType
	 * @param {String} targetClass
	 * @return {Boolean}
	 */
	function isClass(targetType, targetClass) {
		return (targetType && targetType === "class") || (!targetType && $.Cmdbuild.dataModel.isAClass(targetClass));
	}
	/**
	 * @param {String} targetType
	 * @param {String} targetClass
	 * @return {Boolean}
	 */
	function isProcess(targetType, targetClass) {
		return (targetType && targetType === "process") || (!targetType && $.Cmdbuild.dataModel.isAProcess(targetClass));
	}

	/**
	 * @param {String} targetType
	 * @param {String} targetClass
	 * @return {String}
	 */
	function getBackendName(targetType, targetClass, customBackend) {
		if (customBackend) {
			return customBackend;
		}
		if (isClass(targetType, targetClass)) {
			return TARGET_CLASS_BACKEND;
		} else if (isProcess(targetType, targetClass)) {
			return TARGET_PROCESS_BACKEND;
		} 
	};

	function addDialog(dialogId) {
		var $div = $("<div></div>").attr("id", dialogId);
		$div.dialog({
			autoOpen: false,
			modal: true,
			dialogClass : $.Cmdbuild.global.getThemeCSSClass(),
			closeText: $.Cmdbuild.translations.getTranslation("cgf_core_dialog_close", "Close"),
			show: {
				effect: "fade",
				duration: 250
			},
			hide: {
				effect: "explode",
				duration: 500
			}
		});
	};

	/**
	 * Returns class or process description
	 * 
	 * @param {String} targetId
	 * @param {String} targetType
	 * @returns {String} description
	 */
	function getPopupTitle(targetId, targetType) {
		if (isClass(targetType, targetId)) {
			return $.Cmdbuild.utilities.getClassDescription(targetId);
		} else if (isProcess(targetType, targetId)) {
			return $.Cmdbuild.utilities.getProcessDescription(targetId);
		};
	};

	/**
	 * Trigger searchreferenceitem event
	 * 
	 * @param event
	 * @param ui
	 */
	function openDialogFn ( event, ui ) {
		$(event.target).trigger("searchreferenceitem");
	};
}) (jQuery);

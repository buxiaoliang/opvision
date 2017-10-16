(function($) {
	
	/**
	 * @param {Object} params
	 * @param {String} params.form
	 * @param {String} params.id
	 * @param {Boolean} params.readOnly
	 * @param {String} params.backend
	 * @param {Array} params.options List of objects {value : '', label : ''}
	 * @param {String|Numeric} params.value
	 * @param {Boolean} params.hideEmptyOption
	 * @param {String} params.refreshGridAfterInit
	 */
	var selectField = function(params) {
		this.config = null;
		this.backend = undefined;

		/**
		 * Initialize
		 */
		this.init = function() {
			try {
				var me = this;
				this.config = params;

				if (this.config.options) {
					me.show();
				} else if (this.config.backend) {
					var backendFn = $.Cmdbuild.utilities.getBackend(this.config.backend);
					this.backend = new backendFn(this.config, function() {
						me.show();
					}, this);
				}
			}
			catch (e) {
				$.Cmdbuild.errorsManager.log(e);
			}
		};

		/**
		 * Show 
		 */
		this.show = function() {
			var me = this;
			// must add timeout to show select parameters in popups
			setTimeout(function() {
				if (me.config.readOnly === true || me.config.readOnly === "true") {
					me.drawReadOnlySelect();
				} else {
					me.drawOptions();
				}
			}, 300);
		};

		/**
		 * Draw options
		 */
		this.drawOptions = function() {
			var options = [];
			var $select = $("#" + this.config.id);
			var value = this.getValue();

			// empty select
			$select.empty();

			// insert empty option
			if (!this.config.hideEmptyOption){
				var $option = $("<option></option>").attr("value", "").attr("entryValue", "");
				if (! value) {
					$option.attr("selected", "selected");
				}
				$select.append($option);
			}

			// insert options
			$.each(this.getData(), function(index, option) {
				var $option = $("<option></option>").attr("value", option.value)
						.attr("entryValue", option.value)
						.text(option.label);
				if (value && value == option.value) {
					$option.attr("selected", "selected");
				}
				$select.append($option);
			});
			$select.selectmenu("refresh");

			// call init complete
			this.onInitComplete();
		};

		/**
		 * Draw read only select
		 */
		this.drawReadOnlySelect = function() {
			var value = this.getValue()

			// add html
			var $input = $("#" + this.config.id);

			$.each(this.getData(), function(index, option) {
				if (value && value == option.value) {
					// fix bug
					$input.parent().find("span").remove();
					
					$input.after($("<span></span>").text(option.label));
					return;
				}
			});
		};

		/**
		 * Get value
		 */
		this.getValue = function() {
			return (this.config.value == "$fromBackend") ? this.backend
					.getValue() : this.config.value;
		};

		/**
		 * On inti complete
		 */
		this.onInitComplete = function() {
			if (this.config.refreshGridAfterInit) {
				$.Cmdbuild.standard.commands.refreshGrid({
					form: this.config.refreshGridAfterInit
				});
			}
		};

		/**
		 * Return data from the backend
		 * 
		 * @return {Object} Backend data
		 */
		this.getBackendData = function() {
			var backend = this.backend;
			if (!backend.getData) {
				console.warn("Missing getData method for backend " + this.config.backend);
				return backend.data;
			}
			return backend.getData();
		};

		/**
		 * @return {Array}
		 */
		this.getData = function() {
			var options = [];
			if (this.config.options) {
				options = this.config.options;
			} else {
				var data = this.getBackendData();
				$.each(data, function(index, item) {
					options.push({
						value : item._id,
						label : item.description
					});
				});
			}
			return options;
		}

		this.init();
	};
	$.Cmdbuild.standard.selectField = selectField;
	// statics
	$.Cmdbuild.standard.selectField.setValue = function(id, value) {
		var selectMenu = $("#" + id);
		selectMenu.val("");
		selectMenu.selectmenu("refresh");
	};
	$.Cmdbuild.standard.selectField.clearValue = function(id) {
		var selectMenu = $("#" + id);
		selectMenu.val("");
		selectMenu.selectmenu("refresh");
	};
}) (jQuery);

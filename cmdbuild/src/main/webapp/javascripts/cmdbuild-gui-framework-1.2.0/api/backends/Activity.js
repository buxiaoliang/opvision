(function($) {

	var ATTRIBUTE_TITLE = "activityTitle";
	var FAKE_ATTRIBUTE_TITLE = {
		type : "title",
		displayableInList : false,
		active : true,
		name : ATTRIBUTE_TITLE,
		index : -1
	};

	/**
	 * @param {Object} param
	 * @param {String} param.className
	 * @param {Integer} param.cardId
	 * @param {String} param.activityInstanceId
	 * @param {Boolean} param.displayFirstAvailableActivity
	 * @param {Boolean} param.showActivityTitle
	 * @param {Function} onReadyFunction
	 * @param {jQuery} onReadyScope
	 */
	var Activity = function(param, onReadyFunction, onReadyScope) {
		if (param.backend !== "Activity") {
			$.Cmdbuild.errorsManager.warn(param.backend
					+ " backend is deprecated. Please use Activity backend.");
		};

		/*
		 * ATTRIBUTES
		 */
		this.config = null;
		this.hasActivity = null;
		this.newInstance = null;
		this.activityId = null;

		this.writable = false;

		this.activityTitle = null;
		this.processAttributes = [];
		this.attributes = [];
		this.widgets = [];
		this.data = {};
		this.widgetsData = [];

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
			this.config = param;
			this.hasActivity = true;
			this.newInstance = this.config.cardId === undefined;
			this.loadAttributes();
		};

		/*
		 * ATTRIBUTES
		 */
		/**
		 * Load attributes
		 */
		this.loadAttributes = function() {
			if (!this.config.className) {
				var msg = "No _type specified for form: " + this.config.form;
				$.Cmdbuild.errorsManager.warn(msg);
				this.attributes = [];
				return;
			}
			$.Cmdbuild.utilities.proxy.getProcessAttributes(this.config.className,
					this.loadAttributesCallback, this);
		};
		/**
		 * Load attributes callback
		 * @param {Array} attributes
		 */
		this.loadAttributesCallback = function(attributes) {
			// set attributes to backend
			this.processAttributes = attributes;
			this.originalAttributes = attributes.slice();

			if (this.newInstance) {
				// new process instance
				$.Cmdbuild.utilities.proxy.getStartProcessActivities(this.config.className,
						this.onActivitiesLoaded, this);
			} else if (! this.config.cardId) {
				onObjectReady();
			} else if (this.config.activityInstanceId) {
				// load activity data
				this.activityId = this.config.activityInstanceId;
				this.loadActivity();
			} else if (this.config.displayFirstAvailableActivity && this.config.displayFirstAvailableActivity == "true") {
				// show process instance with attributes of first available activity
				$.Cmdbuild.utilities.proxy.getActivity(this.config.className,
						this.config.cardId, this.onActivitiesLoaded, this);
			} else {
				this.loadNoActivityAttributes();
			}
		};
		/**
		 * On activities loaded callback
		 * @param {Array} activities
		 */
		this.onActivitiesLoaded = function(activities) {
			if (activities.length) {
				this.activityId = activities[0]._id;
				this.loadActivity();
			} else {
				this.loadNoActivityAttributes();
			}
		};
		/**
		 * Load activity
		 */
		this.loadActivity = function() {
			if (this.newInstance) {
				// new process instance
				$.Cmdbuild.utilities.proxy.getStartProcessAttributes(
						this.config.className, this.activityId,
						this.onActivityLoaded, this);
			} else {
				// existing process instance
				$.Cmdbuild.utilities.proxy.getStepProcessAttributes(this.config.className,
						this.config.cardId, this.activityId,
						this.onActivityLoaded, this);
			}
		};
		/**
		 * On activity loaded callback
		 * @param {Array} response
		 */
		this.onActivityLoaded = function(activity) {
			var me = this;
			var attributes = [];
			this.activityTitle = activity.description;
			this.writable = activity.writable;

			// add title attribute
			if (this.config.showActivityTitle) {
				attributes.push(FAKE_ATTRIBUTE_TITLE);
			}

			// load attributes
			$.each(activity.attributes, function(index, a_attribute) {
				var p_attributes = $.grep(me.processAttributes, function(p_attribute) {
					return a_attribute._id === p_attribute._id;
				});
				if (p_attributes.length) {
					var attribute = $.extend({}, p_attributes[0], a_attribute);
					attributes.push(attribute);
				}
			});
			$.Cmdbuild.utilities.changeAttributeType(attributes, "Notes", "text");
			this.setAttributes(attributes);
			this.setWidgets(activity.widgets);
			this.loadData();
		};
		/**
		 * Load noActivityFields
		 */
		this.loadNoActivityAttributes = function() {
			var me = this;
			this.hasActivity = false;
			// get form
			var form = $.Cmdbuild.dataModel.forms[this.config.form];
			// extract noActivityFields
			var fields = getNoActivityFields(form.xmlForm);
			// update attributes
			if (fields && fields.attributes && fields.attributes.length) {
				this.attributes = [];
				$.each(fields.attributes, function(index, field) {
					var p_attributes = $.grep(me.processAttributes, function(p_attribute) {
						return field === p_attribute.name;
					});
					if (p_attributes.length) {
						var attribute = $.extend({}, p_attributes[0]);
						me.attributes.push(attribute);
					}
				});
			} else {
				this.attributes = this.processAttributes.slice()
			}
			// load data
			this.loadData();
		};

		/*
		 * DATA MANAGEMENT
		 */
		/**
		 * Load data
		 */
		this.loadData = function() {
			if (this.newInstance) {
				var data = {};
				$.each(this.attributes, function(index, attribute) {
					data[attribute._id] = null;
				});
				data.writable = this.writable;
				this.loadDataCallback(data, {});
			} else {
				$.Cmdbuild.utilities.proxy.getCardProcess(
						this.config.className, this.config.cardId, {},
						this.loadDataCallback, this);
			}
		};
		/**
		 * Load data callback
		 * @param {Object} data
		 * @param {Object} metadata
		 */
		this.loadDataCallback = function(data, metadata) {
			var me = this;
			this.data = $.extend(data, {
				activityTitle : me.activityTitle,
				advanceEnabled : me.hasActivity,
				readOnly : ! me.hasActivity,
				writable : me.writable
			});
			this.metadata = metadata;
			onObjectReady();
		};
		/**
		 * Save data
		 * @param {Object} param
		 * @param {Function} callback
		 */
		this.updateData = function(param, callback) {
			var me = this;
			var data = {};
			$.each(this.attributes, function(index, attribute) {
				data[attribute._id] = param.data[attribute._id];
			});

			// update data
			data = $.extend(data, {
				_advance : false,
				_activity : me.activityId
			});

			// save widgets after instance saving
			function saveWidgets(instance) {
				$.Cmdbuild.widgets.savePostponedWidgets(me.widgets, me.widgetsData, {
					type: me.config.className,
					id: instance._id
				}, me.config.form, function() {
					onWidgetsSaved(instance);
				}, me);
			};

			// advance process
			function onWidgetsSaved(instance) {
				if (param.advance === "true" || param.advance === true) {
					$.Cmdbuild.utilities.proxy.getActivity(me.config.className,
							me.config.cardId, function(response) {
							// update instance data
							var data = {
									_advance : true,
									_activity : response[0]._id
							};
							// advance process instance
							$.Cmdbuild.utilities.proxy.putStepProcess(
									instance._type, instance._id, data,
									function(instanceid) {
										callback(instance);
									}, me);
					}, me);
				} else {
					callback(instance);
				}
			};

			$.Cmdbuild.widgets.getWidgetsData(param.form, this.widgets, function(widgetsData) {
				// get widget data
				me.widgetsData = widgetsData;
				// update data with widget data
				$.Cmdbuild.widgets.saveOnDataWidgets(data, me.widgetsData);
				if (me.newInstance) {
					// post instance
					$.Cmdbuild.utilities.proxy.postNewProcess(me.config.className, data, function(instanceid) {
						me.config.cardId = instanceid;
						$.Cmdbuild.utilities.proxy.getCardProcess(me.config.className, instanceid, {}, function(i_data, i_metadata) {
							saveWidgets(i_data);
						});
					}, this);
				} else {
					// put instance
					$.Cmdbuild.utilities.proxy.putStepProcess(me.config.className, me.config.cardId,
							data, function(instanceid) {
						$.Cmdbuild.utilities.proxy.getCardProcess(me.config.className, me.config.cardId, {}, function(i_data, i_metadata) {
							saveWidgets(i_data);
						});
					}, this);
				}
			}, this);
		};

		/*
		 * OTHER METHODS
		 */
		/**
		 * Is read-only form
		 * 
		 * @return {Boolean}
		 */
		this.isReadOnly = function() {
			return !(this.writable === true || this.writable === "true" || this.newInstance);
		};

		/**
		 * 
		 */
		this.deleteMail = function(param) {
			for (var i = 0; i < this.data.mails.length; i++) {
				var mail = this.data.mails[i];
				if (mail._id === param.cardId) {
					this.data.mails.splice(i, 1);
				}
			}
		};

		/*
		 * GETTERS
		 */
		this.getAttributes = function() {
			return this.attributes;
		};
		this.getOriginalAttributes = function() {
			return this.originalAttributes;
		};
		this.getData = function() {
			return this.data;
		};
		this.getMetadata = function() {
			return this.metadata;
		};
		this.getWidgets = function() {
			return this.widgets;
		};

		/*
		 * SETTERS
		 */
		this.setAttributes = function(attributes) {
			attributes.sort($.Cmdbuild.utilities.attributesSorter);
			this.attributes = attributes.slice();
		};
		this.setWidgets = function(widgets) {
			this.widgets = widgets.slice();
		};

		/*
		 * PRIVATE FUNCTIONS
		 */
		var onObjectReady = function() {
			onReadyFunction.apply(onReadyScope);
		};

		/*
		 * CALL INIT FUNCTION AND RETURN OBJECT
		 */
		this.init();
	};
	$.Cmdbuild.standard.backend.Activity = Activity;

	/**
	 * @deprecated
	 */
	$.Cmdbuild.standard.backend.NewActivity = Activity;

	function getNoActivityFields(xmlElement) {
		var $xml = $(xmlElement);
		// get noActivityFields tag
		var $fields = $xml.find("noActivityFields");
		if (! $fields.length) {
			return undefined;
		}
		var response = {};
		if ($fields.children("field").length == 0) {
			// response["fields"] remain undefined this clear the model
			// so for this form the fields are again the original values from the server
			return response;
		}
		response.attributes = [];
		$.each($fields.children("field"), function(index, field) {
			var fieldname = $(field).children("name").text();
			response.attributes.push(fieldname);
		});
		return response;
	};
	
}) (jQuery);

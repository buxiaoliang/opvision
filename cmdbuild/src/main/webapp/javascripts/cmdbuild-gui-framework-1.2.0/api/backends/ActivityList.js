(function($) {
	var ActivityList = function(param, onReadyFunction, onReadyScope) {
		/**
		 * Attributes
		 */
		this.type = param.className;
		this.data =  [];
		this.metadata = {};
		this.listData = []; // there is a difference from the cards that comes from list and getCard :(
		this.typeFilter = "attribute";
		this.conditions = 	$.Cmdbuild.utilities.getConditionsFromParam(param);

		this.positionOf = param.positionOf;
		this.positions = {};

		this.defaultSort = param.sort;
		this.defaultDirection = param.direction;

		this.disableMultipleActivities = param.disableMultipleActivities === "true"
				|| param.disableMultipleActivities === true;

		if (! param.noUser) {
			this.conditions.push({
				field: param.paramUser,
				value: param.user
			});
		}
		this.cqlfilter = param.cqlFilter;
		this.cqlfilterFn = param.cqlFilterFn;

		this.filter = {};
		this.setFilter = function(param) {
			var oldCqlFilter = this.filter["CQL"];
			var attributes = this.conditions.slice();
			if (param.flowStatus) {
				if (param.flowStatus !== undefined) {
					attributes.push({
						field: "_status",
						value: param.flowStatus
					});
				}
			}
			var filterAttributes = $.Cmdbuild.utilities.getAttributesFilterFromConditions(attributes);
			this.filter["attribute"] = filterAttributes;

			// CQL Filter
			if (this.cqlfilter) {
				this.filter["CQL"] = this.cqlfilter;
				this.noValidFilter = false;
			} else if (this.cqlfilterFn) {
				this.noValidFilter = false;
				this.filter["CQL"] = this.cqlfilterFn.apply();
			} else {
				this.filter["CQL"] = oldCqlFilter;				
			}
		};

		this.updateFilter = function() {
			if (this.cqlfilterFn) {
				this.filter["CQL"] = this.cqlfilterFn.apply();
			}
		};

		this.getStatus = function() {
			return this.flowStatus;
		};
				
		/**
		 * Private attributes
		 */
		var onReadyFunction = onReadyFunction;
		var onReadyScope = onReadyScope;

		/**
		 * Base functions
		 */
		this.deleteRow = function(param, callback) {
			var data = $.Cmdbuild.dataModel.getValues(param.form);
			$.Cmdbuild.utilities.proxy.abortProcess(data._type, data._id, {}, function(response) {
					callback(response);
				}
			, this);
		};
		this.init = function() {
			$.Cmdbuild.utilities.proxy.getProcessStatuses(function(response) {
				this.flowStatuses = response;
				$.Cmdbuild.utilities.proxy.getProcess(this.type, function(process) {
					if (param.flowStatus) {
						this.setFilter({
							flowStatus: process.defaultStatus
						});
					}
					else {
						this.setFilter({});
					}
					this.loadAttributes();
				}, this);
			}, this);
		};
		this.loadAttributes = function() {
			if (!this.type) {
				var msg = "No _type specified for form: " + param.form;
				$.Cmdbuild.errorsManager.warn(msg);
				return;
			}

			$.Cmdbuild.utilities.proxy.getProcessAttributes(this.type,
					this.loadAttributesCallback, this);
		};
		// load Attributes and its callback
		this.loadAttributesCallback = function(attributes) {
			this.attributes = attributes;

			if (this.positionOf) {
				this.loadPositions();
			} else {
				onObjectReady();
			}
		};
		this.loadPositions = function() {
			var me = this;
			this.updateFilter();
			var config = {
					sort : this.defaultSort,
					direction : this.defaultDirection || "ASC",
					positionOf : this.positionOf,
					filter : this.filter
			};
			this.makeAjaxRequest(config, function(data, metadata) {
				me.positions = metadata.positions;

				// clear data and metadata
				me.data = [];
				me.metadata = {};

				// call callback
				onObjectReady();
			}, this);
		};

		this.loadData = function(param, callback, callbackScope) {
			this.data = [];
			if (this.noValidFilter) {
				callback.apply(callbackScope, this.data);
				return;
			}
			this.updateFilter();
			var config = {
					page : param.currentPage,
					start : param.firstRow,
					limit : param.nRows,
					sort : param.sort,
					direction : param.direction,
					filter : this.filter,
					active: true
			};

			this.makeAjaxRequest(config, function(data, metadata) {
				this.data = [];
				this.listData = data;
				this.metadata = metadata;
				this.expandData(0, [], callback, callbackScope);
			}, this);
		};
		/* private make ajax request */
		this.makeAjaxRequest = function(config, callback, callbackScope) {
			$.Cmdbuild.utilities.proxy.getActivityList(this.type, config,
				function(response, metadata) {
					callback.apply(callbackScope, [response, metadata]);
			}, this);
		};

		this.expandData = function(index, data, callback, callbackScope) {
			if (this.listData.length <= index) {
				this.data = data;
				callback.apply(callbackScope, this.data);
				return;
			}
			var card = this.listData[index];
			$.Cmdbuild.utilities.proxy.getActivity(card._type, card._id, function(response) {
				if(response.length == 0) {
					card["writable"] = false;
					data.push(card);
				}
				else {
					if (this.disableMultipleActivities) {
						card["writable"] = response[0].writable;
						data.push(card);
					} else {
						for (var i = 0; i < response.length; i++) {
							var cardActivity = $.Cmdbuild.utilities.clone(card);
							cardActivity["ActivityInstanceId"] = response[i]._id;
							cardActivity["activityTitle"] = response[i].description;
							cardActivity["writable"] = response[i].writable;
							data.push(cardActivity);
						}
					}
				}
				this.expandData(index + 1, data, callback, callbackScope);
			}, this);
		};
		this.getAttributes = function() {
			return this.attributes;
		};
		this.getData = function() {
			return this.data;
		};
		this.getMetadata = function() {
			return this.metadata;
		};

		/**
		 * Private functions
		 */
		var onObjectReady = function() {
			onReadyFunction.apply(onReadyScope);
		};

		/**
		 * Custom functions
		 */
		this.getStatus = function() {
			return this.flowStatus;
		};
		this.getTotalRows = function() {
			var metadata = this.getMetadata();
			return metadata && metadata.total ? metadata.total : this.getData().length;
		};

		/**
		 * Call init function and return object
		 */
		this.init();
	};
	$.Cmdbuild.standard.backend.ActivityList = ActivityList;
}) (jQuery);

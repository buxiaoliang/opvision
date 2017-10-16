(function($) {
	var OnGraphRelations = function(param, onReadyFunction, onReadyScope) {
		/**
		 * Attributes
		 */
		var onReadyFunction = onReadyFunction;
		var onReadyScope = onReadyScope;

		/**
		 * Base functions
		 */
		this.model = $.Cmdbuild.customvariables.model;
		this.config = param;
		this.filter = {};
		this.attributes = [];
		this.alldata = [];
		this.data = [];
		this.metadata = {};
		this.init = function() {
			this.loadAttributes();
		};
		this.loadAttributes = function() {
			this.attributes = [ {
				type : "string",
				name : "domainDescription",
				description : $.Cmdbuild.translations.getTranslation("COLUMNHEADER_RELATION", "Relation"),
				displayableInList : true
			}, {
				type : "string",
				name : "classId",
				description : $.Cmdbuild.translations.getTranslation("attr_typeId", 'Class Id'),
				displayableInList : false
			}, {
				type : "string",
				name : "cardDescription",
				description : $.Cmdbuild.translations.getTranslation("COLUMNHEADER_CARD", "Card"),
				displayableInList : true
			}, {
				type : "string",
				name : "classDescription",
				description : $.Cmdbuild.translations.getTranslation("COLUMNHEADER_CLASS", "Class"),
				displayableInList : true
			} ];

			var me = this;
			setTimeout(function() {
				me.preLoadData();
			}, 100);
		};
		this.cyCollection2Array = function(cardId, collection) {
			var array = [];
			for (var i = 0; i < collection.length; i++) {
				var element = collection[i];
				var idTarget = $.Cmdbuild.g3d.Model.getGraphData(element, "target");
				var cardTarget = $.Cmdbuild.customvariables.cacheCards.get(idTarget);
				var domainId = $.Cmdbuild.g3d.Model.getGraphData(element, "domainId");
				var domainDescription = $.Cmdbuild.g3d.Model.getGraphData(element, "label");
				var relationId = $.Cmdbuild.g3d.Model.getGraphData(element, "relationId");
				var classId = cardTarget._type;
				var classDescription = cardTarget.Name;
				var cardId = idTarget;
				var cardDescription = cardTarget.Description;
				this.pushItem(domainId, domainDescription, relationId, classId, classDescription, cardId,
						cardDescription);
			}
			return array;
		};
		this.preLoadData = function() {
			this.alldata = [];
			var me = this;
			var edgesCollection = $.Cmdbuild.customvariables.model.connectedEdges(param.cardId);
			var edges = me.cyCollection2Array(param.cardId, edgesCollection);
			onObjectReady();
		};
		this.pushItem = function(domainId, domainDescription, relationId, classId, classDescription, cardId,
				cardDescription) {
			var item = {
				domainId : domainId,
				domainDescription : domainDescription,
				relationId : relationId,
				classId : classId,
				classDescription : classDescription,
				cardId : cardId,
				cardDescription : cardDescription,
				attributes : {}
			};

			this.alldata.push(item);
		};

		this.loadData = function(param, callback, callbackScope) {
			// filter data
			var all_data;
			if (this.filter && this.filter.query) {
				var query = this.filter.query.trim().toLowerCase();
				all_data = this.alldata.filter(function(el) {
					return el.domainDescription.toLowerCase().search(query) !== -1
							|| el.classDescription.toLowerCase().search(query) !== -1
							|| el.cardDescription.toLowerCase().search(query) !== -1;
				});
			} else {
				all_data = this.alldata;
			}
			this.metadata.total = all_data.length;
			// sort data
			if (param.sort) {
				var sortingColumn = param.sort;
				this.alldata.sort(function(a, b) {
					var val_a = a[sortingColumn];
					var val_b = b[sortingColumn];
					if (typeof val_a === "string") {
						val_a = val_a.toUpperCase();
					}
					if (typeof val_b === "string") {
						val_b = val_b.toUpperCase();
					}
					if (param.direction === "ASC") {
						return (val_a > val_b) ? 1 : -1;
					} else {
						return (val_a < val_b) ? 1 : -1;
					}
				});
			}
			// apply pagination
			var limit = param.firstRow + parseInt(param.nRows);
			this.data = all_data.slice(param.firstRow, limit);
			callback.apply(callbackScope, this.data);
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
		this.getTotalRows = function() {
			var metadata = this.getMetadata();
			return metadata && metadata.total ? metadata.total : this.alldata.length;
		};

		/**
		 * Call init function and return object
		 */
		this.init();
	};
	$.Cmdbuild.custom.backend.OnGraphRelations = OnGraphRelations;
	function compact(data) {
		returnData = {};
		for (var i = 0; i < data.length; i++) {
			returnData[data[i]._id] = data[i];
		}
		data = [];
		for ( var key in returnData) {
			data.push(returnData[key]);
		}
		return data;
	}
})(jQuery);


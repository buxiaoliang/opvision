(function($) {
	var methods = {
		GET : "GET",
		POST : "POST",
		PUT : "PUT",
		DELETE : "DELETE"
	};

	var proxy = {
		getGraphConfiguration : function(callback, callbackScope) {
			var url = $.Cmdbuild.global.getApiUrl() + 'configuration/graph';
			$.Cmdbuild.authProxy.makeAjaxRequest(url, methods.GET, function(response) {
				callback.apply(callbackScope, [ response ]);
			});
		},

		getDomainTrees : function(config, callback, callbackScope) {
			// params
			var params = $.Cmdbuild.utilities.proxy.prepareParamsForList(config);
			// get url and make request
			callbackObj = {
				success : function(data, metadata) {
					callback.apply(callbackScope, [ data, metadata ]);
				},
				fail : function(response) {
					callback.apply(callbackScope, [ [], [] ]);
				}
			};
			var url = $.Cmdbuild.global.getApiUrl() + 'domainTrees/';
			$.Cmdbuild.authProxy.makeAjaxRequest(url, methods.GET, callbackObj, params);
		},
		getDomainTree : function(id, callback, callbackScope) {
			var url = $.Cmdbuild.global.getApiUrl() + 'domainTrees/' + id;
			$.Cmdbuild.authProxy.makeAjaxRequest(url, methods.GET, function(data, metadata) {
				callback.apply(callbackScope, [ data, metadata ]);
			}, {});
		},

		// transforms processes in classes
		getClassAttributes : function(type, callback, callbackScope) {
			if (type === $.Cmdbuild.g3d.constants.GUICOMPOUNDNODE) {
				console.log("ERROR GUICOMPOUNDNODE", Error().stack);
				callback.apply(callbackScope, []);
			} else if ($.Cmdbuild.customvariables.cacheProcess.isProcess(type)) {
				$.Cmdbuild.utilities.proxy.getProcessAttributes(type, callback, callbackScope);

			} else {
				$.Cmdbuild.utilities.proxy.getClassAttributes(type, callback, callbackScope);
			}
		},
		getCardData : function(type, cardId, config, callback, callbackScope) {
			if (type === $.Cmdbuild.g3d.constants.GUICOMPOUNDNODE) {
				console.log("ERROR GUICOMPOUNDNODE", Error().stack);
				callback.apply(callbackScope, []);
			} else if ($.Cmdbuild.customvariables.cacheProcess.isProcess(type)) {
				$.Cmdbuild.utilities.proxy.getCardProcess(type, cardId, config, callback, callbackScope);

			} else {
				$.Cmdbuild.utilities.proxy.getCardData(type, cardId, config, callback, callbackScope);
			}
		},
		getClass : function(type, callback, callbackScope) {
			if (type === $.Cmdbuild.g3d.constants.GUICOMPOUNDNODE) {
				console.log("ERROR GUICOMPOUNDNODE", Error().stack);
				callback.apply(callbackScope, []);
			} else if ($.Cmdbuild.customvariables.cacheProcess.isProcess(type)) {
				$.Cmdbuild.utilities.proxy.getProcess(type, callback, callbackScope);

			} else {
				$.Cmdbuild.utilities.proxy.getClass(type, callback, callbackScope);
			}
		},
		// here only for this release. It's just committed in the new CORE
		getIcons : function(config, callback, callbackScope) {
			// params
			var params = $.Cmdbuild.utilities.proxy.prepareParamsForList(config);
			// get url and make request
			var url = $.Cmdbuild.global.getApiUrl() + 'icons/';
			var callbackObj = undefined;
			if (typeof (callback) === "function") {
				callbackObj = {
					success : function(data, metadata) {
						callback.apply(callbackScope, [ data, metadata ]);
					},
					fail : function(response) {
						console.log("Error on icons! The icons cannot be load");
						callback.apply(callbackScope, [ [], [] ]);
					}
				};
			} else {
				callbackObj = callback;
			}
			$.Cmdbuild.authProxy.makeAjaxRequest(url, methods.GET, callbackObj, params);
		},
		getRelatedCards : function(type, config, callback, callbackScope) {
			// params
			var params = $.Cmdbuild.utilities.proxy.prepareParamsForList(config);
			// get url and make request
			var url = "";
			if ($.Cmdbuild.customvariables.cacheProcess.isProcess(type)) {
				url = $.Cmdbuild.global.getApiUrl() + 'processes/' + type + '/instances';

			} else {
				url = $.Cmdbuild.global.getApiUrl() + 'classes/' + type + '/cards';
			}
			var callbackObj = {
				success : function(data, metadata) {
					callback.apply(callbackScope, [ data, metadata ]);
				},
				fail : function(response) {
					callback.apply(callbackScope, [ [], [] ]);
				}
			};
			$.Cmdbuild.authProxy.makeAjaxRequest(url, methods.GET, callbackObj, params);
		},
		getRelatedCardsOnTemporaryFilter : function(type, config, callback, callbackScope) {
			if (filterDimension(config.filter) < 100) {
				this.getRelatedCards(type, config, callback, callbackScope);
				return;
			}
			// params
			$.Cmdbuild.g3d.proxy.postTemporaryFilter(type, config.filter, function(data) {
				config.filter = {
					"_temporaryId" : data[0]._id
				};
				if (!$.Cmdbuild.customvariables.cacheProcess.isProcess(type)) {
					// classes
					$.Cmdbuild.utilities.proxy.getCardList(type, config, function(data, metadata) {
						callback.apply(callbackScope, [ data, metadata ]);
					}, this);
				} else {
					// processes
					$.Cmdbuild.utilities.proxy.getActivityList(type, config, callback, callbackScope);
				}
			}, this);
		},
		postTemporaryFilter : function(type, filter, callback, callbackScope) {
			var url = $.Cmdbuild.global.getApiUrl() + 'classes/' + type + '/temporary_filters';
			callbackObj = {
				success : function(data, metadata) {
					callback.apply(callbackScope, [ [ data ], [ metadata ] ]);
				},
				fail : function(response) {
					callback.apply(callbackScope, [ [], [] ]);
				}
			};
			filter = {
				name : "tempfilter",
				description : "tempfilter",
				configuration : JSON.stringify(filter)
			};
			var params = JSON.stringify(filter);
			$.Cmdbuild.authProxy.makeAjaxRequest(url, methods.POST, callbackObj, params);
		},
		/**
		 * @param {Object}
		 *            parameters
		 * 
		 * @returns {Void}
		 */
		getAllRelatedClasses : function(params, callback, callbackScope) {
			params = {parameters:JSON.stringify(params) };
			var url = $.Cmdbuild.global.getApiUrl() + 'functions' + '/';
			$.Cmdbuild.authProxy.makeAjaxRequest(url, methods.GET, function(data, metadata) {
				var functionId = getAllClassesFunctionId(data);
				url = url + functionId + '/outputs/';

				$.Cmdbuild.authProxy.makeAjaxRequest(url, methods.GET, function(data, metadata) {
					callback.apply(callbackScope, [data, metadata]);
				}, params);
			}, {});
		}
	};
	$.Cmdbuild.g3d.proxy = proxy;
	function getAllClassesFunctionId(data) {
		var name = $.Cmdbuild.g3d.constants.RELATED_CLASSES_FUNCTION;
		for (var i = 0; i < data.length; i++) {
			if (name === data[i].name) {
				return data[i]._id;
			}
		}
		console.log("Error: the function " + name + " not found!");
	}
	function filterDimension(filter) {
		var size = 0;
		for (var i = 0; i < filter.relation; i++) {
			size += filter.relation[i].cards.length;
		}
		return size;
	}
})(jQuery);

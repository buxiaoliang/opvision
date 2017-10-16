(function($) {
	$.Cmdbuild.g3d.constants = {
		GUICOMPOUNDNODE : "GUICOMPOUNDNODE",
		GUICOMPOUNDNODEDESCRIPTION : "Compound node",
		ICON_DELETE : "cross.png",
		DEFAULT_SHAPE : "cmdbuildDefaultShape",
		SELECTION_SHAPE : "cmdbuildSelectionShape",
		TEMPLATES_PATH : "theme/templates/",
		SPRITES_PATH : "theme/images/sprites/",
		ICONS_PATH : "theme/images/icons/",
		LABELS_ON_SELECTED : "selected",
		NO_LABELS : "none",
		RANGE_VIEWPOINTDISTANCE : 100,
		EXPANDING_THRESHOLD : 30,
		MIN_MOVEMENT : 5,
		TOOLTIP_WINDOW : "viewerInformation",
		REMOVE_NAVIGATON_TREE : "removeNavigatonTree",
		REMOVE_NAVIGATON_TREE_STRING : "Disable navigation tree",
		PRINT_TEMPLATE : "print.html",
		CMDBUILD_NETWORK_IMAGE : "CMDBUILD_NETWORK_IMAGE",
		PRINT_NETWORK_IMAGE : "PRINT_NETWORK_IMAGE",
		RELATED_CLASSES_FUNCTION: "_graph_get_related_classes",
		COMPOUND_ATTRIBUTES : [ {
			type : "string",
			_id : "type",
			description : "Type",
			displayableInList : true
		}, {
			type : "string",
			_id : "description",
			description : "Description",
			displayableInList : true
		} ],
		FILTER_OPERATORS : {
			EQUAL : "equal",
			NOT_EQUAL : "notequal",
			NULL : "isnull",
			NOT_NULL : "isnotnull",
			GREATER_THAN : "greater",
			LESS_THAN : "less",
			BETWEEN : "between",
			LIKE : "like",
			CONTAIN : "contain",
			NOT_CONTAIN : "notcontain",
			BEGIN : "begin",
			NOT_BEGIN : "notbegin",
			END : "end",
			NOT_END : "notend",

			NET_CONTAINS : "net_contains",
			NET_CONTAINED : "net_contained",
			NET_CONTAINSOREQUAL : "net_containsorequal",
			NET_CONTAINEDOREQUAL : "net_containedorequal",
			NET_RELATION : "net_relation"
		},
		OBJECT_STATUS_MOVED : "moved",
		OBJECT_STATUS_NEW : "new",
	};
	$.Cmdbuild.g3d.constants.FILTERS_FOR_TYPE = {
		FILTER_RANGEOPERATORS : [
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.EQUAL,
						"FILTER_EQUALS", 1 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NULL,
						"FILTER_ISNULL", 0 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NOT_NULL,
						"FILTER_ISNOTNULL", 0 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NOT_EQUAL,
						"FILTER_DIFFERENT", 1 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.GREATER_THAN,
						"FILTER_GREATERTHAN", 1 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.LESS_THAN,
						"FILTER_LESSTHAN", 1 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.BETWEEN,
						"FILTER_BETWEEN", 2 ] ],

		FILTER_TEXTOPERATORS : [
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.BEGIN,
						"FILTER_BEGINSWITH", 1 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.CONTAIN,
						"FILTER_CONTAINS", 1 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.END,
						"FILTER_ENDSWITH", 1 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.EQUAL,
						"FILTER_EQUALS", 1 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NOT_BEGIN,
						"FILTER_ENDSWITH", 1 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NOT_CONTAIN,
						"FILTER_DOESNOTCONTAIN", 1 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NOT_END,
						"FILTER_DOESNOTENDWITH", 1 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NOT_EQUAL,
						"FILTER_DIFFERENT", 1 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NOT_NULL,
						"FILTER_ISNOTNULL", 0 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NULL,
						"FILTER_ISNULL", 0 ] ],

		FILTER_LOOKUPOPERATORS : [
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.EQUAL,
						"FILTER_EQUALS", 1 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NULL,
						"FILTER_ISNULL", 0 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NOT_NULL,
						"FILTER_ISNOTNULL", 0 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NOT_EQUAL,
						"FILTER_DIFFERENT", 1 ] ],

		FILTER_BOOLEANOPERATORS : [
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.EQUAL,
						"FILTER_EQUALS", 1 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NULL,
						"FILTER_ISNULL", 0 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NOT_NULL,
						"FILTER_ISNOTNULL", 0 ] ],

		FILTER_INETOPERATORS : [
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.EQUAL,
						"FILTER_EQUALS", 1 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NOT_NULL,
						"FILTER_ISNOTNULL", 0 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NET_CONTAINS,
						"FILTER_CONTAINS", 1 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NET_CONTAINED,
						"FILTER_CONTAINED", 1 ],
				[
						$.Cmdbuild.g3d.constants.FILTER_OPERATORS.NET_CONTAINSOREQUAL,
						"FILTER_CONTAINSOREQUAL", 1 ],
				[
						$.Cmdbuild.g3d.constants.FILTER_OPERATORS.NET_CONTAINEDOREQUAL,
						"FILTER_CONTAINEDOREQUAL", 1 ],
				[ $.Cmdbuild.g3d.constants.FILTER_OPERATORS.NET_RELATION,
						"FILTER_RELATION", 2 ] ]
	};
	$.Cmdbuild.g3d.constants.DEFAULT_TRANSLATIONS_FOR_FILTER = {
		FILTER_EQUALS : "Equals",
		FILTER_DIFFERENT : "Different",
		FILTER_ISNULL : "Is null",
		FILTER_ISNOTNULL : "Is not null",
		FILTER_BEGINSWITH : "Begins with",
		FILTER_ENDSWITH : "Ends with",
		FILTER_CONTAINS : "Contains",
		FILTER_DOESNOTBEGINWITH : "Does not begin with",
		FILTER_DOESNOTENDWITH : "Does not end with",
		FILTER_DOESNOTCONTAIN : "Does not contain",
		FILTER_BETWEEN : "Between",
		FILTER_GREATERTHAN : "Greater than",
		FILTER_LESSTHAN : "Less than",
		FILTER_CONTAINED : "Contained",
		FILTER_CONTAINSOREQUAL : "Contains or equal",
		FILTER_CONTAINEDOREQUAL : "Contained or equal",
		FILTER_RELATION : "Relation"
	};

	$.Cmdbuild.g3d.constants.OPERATORS_FOR_TYPE = {
		"string" : $.Cmdbuild.g3d.constants.FILTERS_FOR_TYPE.FILTER_TEXTOPERATORS,
		"date" : $.Cmdbuild.g3d.constants.FILTERS_FOR_TYPE.FILTER_RANGEOPERATORS,
		"lookup" : $.Cmdbuild.g3d.constants.FILTERS_FOR_TYPE.FILTER_LOOKUPOPERATORS,
		"boolean" : $.Cmdbuild.g3d.constants.FILTERS_FOR_TYPE.FILTER_BOOLEANOPERATORS,
		"inet" : $.Cmdbuild.g3d.constants.FILTERS_FOR_TYPE.FILTER_INETOPERATORS
	};

})(jQuery);
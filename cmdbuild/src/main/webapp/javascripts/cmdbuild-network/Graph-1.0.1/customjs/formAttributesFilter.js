(function($) {
	var NOGROUP = "_NOGROUP_";
	var GROUPOTHERS = "Others";

	var formAttributesFilter = function() {
		this.config = {};
		this.backend = undefined;
		this.xmlForm = undefined;

		this.init = function(param) {
			this.config = param;
			if (!$.Cmdbuild.customvariables.selectObservers) {
				$.Cmdbuild.customvariables.selectObservers = [];
			}
			if ($.inArray(this, $.Cmdbuild.customvariables.selectObservers) === -1) {
				$.Cmdbuild.customvariables.selectObservers.push(this);
			}
			// fields to show
			this.xmlForm = $.Cmdbuild.elementsManager
					.getElement(this.config.form);
			try {
				var backendFn = $.Cmdbuild.utilities.getBackend(param.backend);
				var backend = new backendFn(param, this.show, this);
				this.setBackend(backend);
			} catch (e) {
				console.log("WARNING: No data message " + e.message);
				var htmlContainer = $("#" + this.param.container)[0];
				htmlContainer.innerHTML = "<h1>NO DATA</h1>";
			}
		};

		this.show = function() {
			var formId = this.config.form;
			var $container = $("#" + this.config.container);
			$container.empty();
			// create form
			var $form = createForm(this.config.form);
			$container.append($form);

			// create fields
			this.selectValues = {};
			var data = this.getBackendData();
			var attributes = this.getBackendAttributes();
			this.showAttributes(this.config.classId, attributes, data, formId,
					$form);

			// add children tags
			var childrenHtml = $.Cmdbuild.elementsManager
					.insertChildren(this.xmlForm);
			if (childrenHtml) {
				$form.append(childrenHtml);
			}

			// execute on init complete
			if (this.config.onInitComplete) {
				window[this.config.onInitComplete]();
			}
		};
		this.showAttributes = function(classId, attributes, data, formId, $form) {
			for (var i = 0; i < attributes.length; i++) {
				var attribute = attributes[i];
				// create field
				var value = "";
				var $fieldset = $("<fieldset></fieldset>");
				var $legend = $("<legend>" + attribute.description
						+ "</legend>");
				$fieldset.append($legend);
				var selects = [];
				this.showOperatorsRows(classId, attribute, $fieldset, formId,
						data, selects);
				$form.append($fieldset);
				$.Cmdbuild.scriptsManager.execute();
				for (var j = 0; j < selects.length; j++) {
					$('#' + selects[j]).selectmenu("widget" ).addClass(  "cell-filter-select" );
				}
			}
		};
		this.showOperatorsRows = function(classId, attribute, $fieldset,
				formId, data, selects) {
			var attributeData = data[attribute._id];
			var base_url = $.Cmdbuild.global.getAppConfigUrl()
					+ $.Cmdbuild.g3d.constants.ICONS_PATH;
			var deleteImage = base_url + $.Cmdbuild.g3d.constants.ICON_DELETE;
			for (var i = 0; i < attributeData.length; i++) {
				var row = attributeData[i];
				var selectId = attribute._id + "_operatorsSelect_" + i + "_"
						+ this.config.idSuffix;
				var $rowDiv = $("<div></div>").attr("class", "attribute-filter-row");
				var $button = $("<input></input>").attr('type', 'image').attr(
						"src", deleteImage).attr("indexData", i).on("click",
						deleteAttributeOnClass);
				selects.push(selectId);
				$button.attr("class", "cell-filter-attribute");
				$button.attr("classId", classId);
				$button.attr("attributeId", attribute._id);
				$button.attr("indexData", i);
				$button.attr("navigationForm", this.config.navigationForm);
				$button.attr("navigationContainer",
						this.config.navigationContainer);
				var $operatorsSelect = $("<select></select>").attr("id",
						selectId);
				this.appendSpecificOperators($operatorsSelect, attribute);
				$operatorsSelect.val(row.operator);
				$rowDiv.append($button);
				$rowDiv.append($operatorsSelect);
				$fieldset.append($rowDiv);
				this.showOperatorsFields(row, attribute, $rowDiv, i, formId);
				var operatorsList = $.Cmdbuild.custom.formAttributesFilter
						.getSpecificOperators(attribute);
				var param = {
					script : "selectFilter",
					id : selectId,
					context : this,
					indexData : row,
					navigationForm : this.config.navigationForm,
					navigationContainer : this.config.navigationContainer,
					operatorsList : operatorsList

				};
				$.Cmdbuild.scriptsManager.push(param);
			}
		};
		function deleteAttributeOnClass(ev) {
			var index = ev.currentTarget.getAttribute("indexData");
			var attributeId = ev.currentTarget.getAttribute("attributeId");
			var classId = ev.currentTarget.getAttribute("classId");
			var navigationContainer = ev.currentTarget
					.getAttribute("navigationContainer");
			var navigationForm = ev.currentTarget
					.getAttribute("navigationForm");
			var rows = $.Cmdbuild.custom.configuration.temporaryFilterByAttributes[classId][attributeId].data;
			if (rows.length > 1) {
				rows.splice(index, 1);
			} else if (rows.length == 1) {
				delete $.Cmdbuild.custom.configuration.temporaryFilterByAttributes[classId][attributeId];
			}
			if ($
					.isEmptyObject($.Cmdbuild.custom.configuration.temporaryFilterByAttributes[classId])) {
				delete $.Cmdbuild.custom.configuration.temporaryFilterByAttributes[classId];
			}
			$.Cmdbuild.standard.commands.navigate({
				form : navigationForm,
				container : navigationContainer,
				classId : classId
			});
			return false;
		}
		this.showOperatorsFields = function(row, attribute, $fieldset,
				currentAttributeIndex, formId) {
			for (var i = 0; i < row.operator[2]; i++) {
				var currentAttribute = $.Cmdbuild.utilities.clone(attribute);
				currentAttribute._id += "_" + currentAttributeIndex + "_" + i;
				var $field = $.Cmdbuild.fieldsManager.getFormField(
						currentAttribute, formId, this.config.container,
						((i === 0) ? row.data.firstParameter: row.data.secondParameter));
				this.prepareSelect(attribute, $field, row,
						currentAttributeIndex);
				if ($field.change) {
					this.setChange($field, row, i);
				}
				$.each($field,function(k) {
					$(this).attr("class", "cell-filter-attribute");
				});				
				$fieldset.append($field);
			}
		};
		this.prepareSelect = function(attribute, $field, row, index) {
			if (attribute.type === "lookup" || attribute.type === "reference") {
				var id = ($.isArray($field)) ? $field[0].attr("id") : $field
						.attr("id");
				this.selectValues[id] = row;
			}
		};
		this.changedSelect = function(configuration) {
//			var field = $("#" + configuration.id);
//			if (this.selectValues[configuration.id]) { // from form
//				this.selectValues[configuration.id].data.firstParameter = field
//						.val();
//			}
		};
		this.setChange = function($field, row, indexParameter) {
			var closureRow = row;
			$field.change(function() {
				var dt = $.Cmdbuild.utilities.convertDateGUI2DB(this.value);//$.datepicker.formatDate('yy-mm-dd', new Date(this.value));
				if (indexParameter === 1) {
					closureRow.data.secondParameter = dt;
				}
				else {
					closureRow.data.firstParameter = dt;
				}
			});
		};
		this.appendSpecificOperators = function(jqueryfield, attribute) {
			var options = $.Cmdbuild.custom.formAttributesFilter
					.getSpecificOperators(attribute);
			for (var i = 0; i < options.length; i++) {
				var t = $.Cmdbuild.translations.getTranslation(options[i][1],
						$.Cmdbuild.g3d.constants.DEFAULT_TRANSLATIONS_FOR_FILTER[options[i][1]]);
				var $option = $("<option></option>").val(options[i][0]).text(t);
				jqueryfield.append($option);
			}
		};
		this.refreshField = function(param) {
			var id = $.Cmdbuild.fieldsManager.getFieldId(param.form,
					param.field);
			/*
			 * ATTENTION: for now only on referenceFields refreshField come from
			 * the cql configurator
			 */
			var $selectMenu = $("#" + id);
			if ($selectMenu.length) {
				$selectMenu.trigger("refreshfield");
			}
		};
		this.getValue = function(param) {
			var id = $.Cmdbuild.fieldsManager.getFieldId(param.form,
					param.field);
			var val = $.Cmdbuild.utilities.getHtmlFieldValue("#" + id);
			if (val === null) {
				val = $.Cmdbuild.dataModel.getValue(param.form, param.field);
			}
			return val;
		};
		this.getBackend = function() {
			return this.backend;
		};
		this.setBackend = function(backend) {
			this.backend = backend;
		};
		this.getBackendAttributes = function() {
			var backend = this.getBackend();
			if (!backend.getAttributes) {
				console.warn("Missing getData method for backend "
						+ this.config.backend);
				return backend.attributes;
			}
			return backend.getAttributes();
		};
		this.getBackendData = function() {
			var backend = this.getBackend();
			if (!backend.getData) {
				console.warn("Missing getData method for backend "
						+ this.config.backend);
				return backend.data;
			}
			return backend.getData();
		};
	};

	$.Cmdbuild.custom.formAttributesFilter = formAttributesFilter;

	function createForm(formName) {
		var form = $("<form></form>").attr("action", "#")
				.attr("name", formName).attr("id", formName);
		return form;
	}
	$.Cmdbuild.custom.formAttributesFilter.getSpecificOperators = function(
			attribute) {
		var fFilters = $.Cmdbuild.g3d.constants.FILTERS_FOR_TYPE;
		var operator = $.Cmdbuild.g3d.constants.OPERATORS_FOR_TYPE[attribute.type];
		return (operator) ? operator : fFilters.FILTER_TEXTOPERATORS;
	};

	$.Cmdbuild.custom.formAttributesFilter.getOrs = function(attributeId, rows) {
		var ors = [];
		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			ors.push({
				simple : {
					attribute : attributeId,
					operator : row.operator[0],
					value : row.data.firstParameter,
					parameterType : "fixed"
				}
			});
		}
		return ors;
	};
	$.Cmdbuild.custom.formAttributesFilter.getFilters4Classes = function() {
		var classes = $.Cmdbuild.custom.configuration.filterByAttributes;
		var returnObject = {};
		for ( var keyClass in classes) {
			var ors = [];
			var classFilter = {};
			var data = classes[keyClass];
			for ( var key in data) {
				ors.push(this.getOrs(key, data[key].data));
			}
			if (ors.length > 1) {
				classFilter.and = {};
				classFilter.and.or = [];
				for (var i = 0; i < ors.length; i++) {
					classFilter.and.or.push(ors[i]);
				}
			} else if (ors.length === 1) {
				if (ors[0].length > 1) {
					classFilter.or = ors[0];
				} else {
					classFilter = ors[0];
				}
			}
			returnObject[keyClass] = classFilter;
		}
		return returnObject;
	};
	$.Cmdbuild.custom.formAttributesFilter.inFilter = function(classId, filter) {
		var nodes = $.Cmdbuild.customvariables.model
				.getNodesByClassName(classId);
		var ids = [];
		for (var i = 0; i < nodes.length; i++) {
			var cardId = $.Cmdbuild.g3d.Model.getGraphData(nodes[i], "id");
			ids.push(cardId);
		}

		return ids;
	};

})(jQuery);

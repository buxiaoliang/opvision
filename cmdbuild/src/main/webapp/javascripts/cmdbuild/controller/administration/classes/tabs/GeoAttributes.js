(function () {

	Ext.define('CMDBuild.controller.administration.classes.tabs.GeoAttributes', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.classes.tabs.GeoAttributes'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.classes.Classes}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onClassesTabGeoAttributesAbortButtonClick',
			'onClassesTabGeoAttributesAddButtonClick',
			'onClassesTabGeoAttributesAddClassButtonClick',
			'onClassesTabGeoAttributesClassSelected',
			'onClassesTabGeoAttributesMaxZoomDrag',
			'onClassesTabGeoAttributesMinZoomDrag',
			'onClassesTabGeoAttributesModifyButtonClick = onClassesTabGeoAttributesItemDoubleClick',
			'onClassesTabGeoAttributesRemoveButtonClick',
			'onClassesTabGeoAttributesRowSelected',
			'onClassesTabGeoAttributesSaveButtonClick',
			'onClassesTabGeoAttributesShow',
			'onClassesTabGeoAttributesTypeSelect'
		],


		/**
		 * @property {CMDBuild.view.administration.classes.tabs.geoAttributes.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.administration.classes.tabs.geoAttributes.GridPanel}
		 */
		grid: undefined,

		/**
		 * @property {CMDBuild.model.classes.tabs.geoAttributes.Attribute}
		 *
		 * @private
		 */
		selectedAttribute: undefined,

		/**
		 * Used to filter style attributes by type
		 *
		 * @cfg {Object}
		 */
		styleAttributesNamesByType: {
			LINESTRING: [
				CMDBuild.core.constants.Proxy.STROKE_DASHSTYLE,
				CMDBuild.core.constants.Proxy.STROKE_OPACITY,
				CMDBuild.core.constants.Proxy.STROKE_COLOR,
				CMDBuild.core.constants.Proxy.STROKE_WIDTH
			],
			POINT: [
				CMDBuild.core.constants.Proxy.EXTERNAL_GRAPHIC,
				CMDBuild.core.constants.Proxy.FILL_OPACITY,
				CMDBuild.core.constants.Proxy.FILL_COLOR,
				CMDBuild.core.constants.Proxy.POINT_RADIUS,
				CMDBuild.core.constants.Proxy.STROKE_DASHSTYLE,
				CMDBuild.core.constants.Proxy.STROKE_OPACITY,
				CMDBuild.core.constants.Proxy.STROKE_COLOR,
				CMDBuild.core.constants.Proxy.STROKE_WIDTH
			],
			POLYGON: [
				CMDBuild.core.constants.Proxy.FILL_OPACITY,
				CMDBuild.core.constants.Proxy.FILL_COLOR,
				CMDBuild.core.constants.Proxy.STROKE_DASHSTYLE,
				CMDBuild.core.constants.Proxy.STROKE_OPACITY,
				CMDBuild.core.constants.Proxy.STROKE_COLOR,
				CMDBuild.core.constants.Proxy.STROKE_WIDTH
			]
		},

		/**
		 * @cfg {CMDBuild.view.administration.classes.tabs.geoAttributes.GeoAttributesView}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.classes.Classes} configurationObject.parentDelegate
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.administration.classes.tabs.geoAttributes.GeoAttributesView', { delegate: this });

			// Shorthands
			this.form = this.view.form;
			this.grid = this.view.grid;
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		manageAttributeType: function () {
			switch (this.form.typeField.getValue()) {
				case 'LINESTRING':
					return this.form.customPropertiesContainer.add([
						this.form.fieldDashstyleStroke,
						this.form.fieldOpacityStroke,
						this.form.fieldColorStroke,
						this.form.fieldWidthStroke
					]);

				case 'POINT':
					return this.form.customPropertiesContainer.add([
						this.form.fieldExternalGraphic,
						this.form.fieldOpacityFill,
						this.form.fieldColorFill,
						this.form.fieldRadiusPoint,
						this.form.fieldDashstyleStroke,
						this.form.fieldOpacityStroke,
						this.form.fieldColorStroke,
						this.form.fieldWidthStroke
					]);

				case 'POLYGON':
					return this.form.customPropertiesContainer.add([
						this.form.fieldOpacityFill,
						this.form.fieldColorFill,
						this.form.fieldDashstyleStroke,
						this.form.fieldOpacityStroke,
						this.form.fieldColorStroke,
						this.form.fieldWidthStroke
					]);
			}
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabGeoAttributesAbortButtonClick: function () {
			if (!this.classesTabGeoAttributesSelectedAttributeIsEmpty()) {
				this.cmfg('onClassesTabGeoAttributesShow');
			} else {
				this.form.reset();
				this.form.setDisabledModify(true, true, true);
			}
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabGeoAttributesAddButtonClick: function () {
			this.grid.getSelectionModel().deselectAll();

			this.classesTabGeoAttributesSelectedAttributeReset();

			this.form.reset();
			this.form.setDisabledModify(false, true);
			this.form.loadRecord(Ext.create('CMDBuild.model.classes.tabs.geoAttributes.Attribute'));
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabGeoAttributesAddClassButtonClick: function () {
			this.view.disable();
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabGeoAttributesClassSelected: function () {
			this.view.setDisabled(
				this.cmfg('classesSelectedClassIsEmpty')
				|| this.cmfg('classesSelectedClassGet', CMDBuild.core.constants.Proxy.TABLE_TYPE) == CMDBuild.core.constants.Global.getTableTypeSimpleTable()
				|| !CMDBuild.configuration.gis.get(CMDBuild.core.constants.Proxy.ENABLED)
			);
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabGeoAttributesMaxZoomDrag: function () {
			if (this.form.minZoomField.getValue() > this.form.maxZoomField.getValue())
				this.form.minZoomField.setValue(this.form.maxZoomField.getValue());
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabGeoAttributesMinZoomDrag: function () {
			if (this.form.minZoomField.getValue() > this.form.maxZoomField.getValue())
				this.form.maxZoomField.setValue(this.form.minZoomField.getValue());
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabGeoAttributesModifyButtonClick: function () {
			if (!Ext.isEmpty(this.form))
				this.form.setDisabledModify(false);
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabGeoAttributesRemoveButtonClick: function () {
			Ext.Msg.show({
				title: CMDBuild.Translation.common.confirmpopup.title,
				msg: CMDBuild.Translation.common.confirmpopup.areyousure,
				buttons: Ext.Msg.YESNO,
				scope: this,

				fn: function (buttonId, text, opt) {
					if (buttonId == 'yes')
						this.removeItem();
				}
			});
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabGeoAttributesRowSelected: function () {
			if (this.grid.getSelectionModel().hasSelection()) {
				CMDBuild.proxy.administration.classes.tabs.GeoAttributes.read({
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.LAYERS];

						if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
							var selectedRecord = this.grid.getSelectionModel().getSelection()[0],
								layerObject = Ext.Array.findBy(decodedResponse, function (layer, index) {
								return (
									layer[CMDBuild.core.constants.Proxy.MASTER_TABLE_NAME] == selectedRecord.get(CMDBuild.core.constants.Proxy.MASTER_TABLE_NAME)
									&& layer[CMDBuild.core.constants.Proxy.NAME] == selectedRecord.get(CMDBuild.core.constants.Proxy.NAME)
								);
							}, this);

							if (Ext.isObject(layerObject) && !Ext.Object.isEmpty(layerObject)) {
								this.classesTabGeoAttributesSelectedAttributeSet({ value: layerObject });

								this.form.loadRecord(this.classesTabGeoAttributesSelectedAttributeGet());
								this.form.loadRecord(this.classesTabGeoAttributesSelectedAttributeGet(CMDBuild.core.constants.Proxy.STYLE)); // Load style data

								this.form.setDisabledModify(true, true);
							} else {
								_error('onClassesTabGeoAttributesRowSelected(): layer not found', this, this.grid.getSelectionModel().getSelection()[0].get(CMDBuild.core.constants.Proxy.NAME));
							}
						}
					}
				});
			}
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabGeoAttributesSaveButtonClick: function () {
			if (this.validate(this.form)) {
				var filteredtyleValuesObject = {};
				var formData = this.form.getData(true);
				var formDataModel = Ext.create('CMDBuild.model.classes.tabs.geoAttributes.Attribute', formData);

				// Build filtered style value object
				Ext.Object.each(formData, function (name, value) {
					if (Ext.Array.contains(this.styleAttributesNamesByType[formData[CMDBuild.core.constants.Proxy.TYPE]], name))
						filteredtyleValuesObject[name] = value;
				}, this);

				var params = {};
				params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('classesSelectedClassGet', CMDBuild.core.constants.Proxy.NAME);
				params[CMDBuild.core.constants.Proxy.DESCRIPTION] = formDataModel.get(CMDBuild.core.constants.Proxy.DESCRIPTION);
				params[CMDBuild.core.constants.Proxy.MAX_ZOOM] = formDataModel.get(CMDBuild.core.constants.Proxy.MAX_ZOOM);
				params[CMDBuild.core.constants.Proxy.MIN_ZOOM] = formDataModel.get(CMDBuild.core.constants.Proxy.MIN_ZOOM);
				params[CMDBuild.core.constants.Proxy.NAME] = formDataModel.get(CMDBuild.core.constants.Proxy.NAME);
				params[CMDBuild.core.constants.Proxy.STYLE] = Ext.encode(filteredtyleValuesObject);
				params[CMDBuild.core.constants.Proxy.TYPE] = formDataModel.get(CMDBuild.core.constants.Proxy.TYPE);

				if (this.classesTabGeoAttributesSelectedAttributeIsEmpty()) {
					params[CMDBuild.core.constants.Proxy.FORCE_CREATION] = true;

					CMDBuild.proxy.administration.classes.tabs.GeoAttributes.create({
						params: params,
						scope: this,
						success: this.success
					});
				} else {
					CMDBuild.proxy.administration.classes.tabs.GeoAttributes.update({
						params: params,
						scope: this,
						success: this.success
					});
				}
			}
		},

		/**
		 * @param {String} recordNameToSelect
		 *
		 * @returns {Void}
		 */
		onClassesTabGeoAttributesShow: function (recordNameToSelect) {
			if (!this.cmfg('classesSelectedClassIsEmpty'))
				this.grid.getStore().load({
					scope: this,
					callback: function (records, operation, success) {
						this.grid.getStore().clearFilter();
						this.grid.getStore().filterBy(function (record, id) {
							return (
								Ext.isObject(record) && !Ext.Object.isEmpty(record)
								&& record.get(CMDBuild.core.constants.Proxy.MASTER_TABLE_NAME) == this.cmfg('classesSelectedClassGet', CMDBuild.core.constants.Proxy.NAME)
							);
						}, this);

						// Record selection
						var selectedRecordIndex = this.grid.getStore().find(CMDBuild.core.constants.Proxy.NAME, recordNameToSelect);

						this.grid.getSelectionModel().select(
							selectedRecordIndex > 0 ? selectedRecordIndex : 0,
							true
						);
					}
				});
		},

		/**
		 * @returns {Void}
		 */
		onClassesTabGeoAttributesTypeSelect: function () {
			this.form.customPropertiesContainer.removeAll(false);

			if (!Ext.isEmpty(this.form.typeField.getValue())) {
				this.manageAttributeType();

				this.form.loadRecord(Ext.create('CMDBuild.model.classes.tabs.geoAttributes.Style'));
				this.form.setDisabledModify(false);
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		removeItem: function () {
			if (!this.classesTabGeoAttributesSelectedAttributeIsEmpty()) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.MASTER_TABLE_NAME] = this.classesTabGeoAttributesSelectedAttributeGet(CMDBuild.core.constants.Proxy.MASTER_TABLE_NAME);
				params[CMDBuild.core.constants.Proxy.NAME] = this.classesTabGeoAttributesSelectedAttributeGet(CMDBuild.core.constants.Proxy.NAME);

				CMDBuild.proxy.administration.classes.tabs.GeoAttributes.remove({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						this.classesTabGeoAttributesSelectedAttributeReset();

						this.form.reset();
						this.form.setDisabledModify(true, true, true, true);

						this.cmfg('onClassesTabGeoAttributesShow');
					}
				});
			}
		},

		// SelectedAttribute property functions
			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 *
			 * @private
			 */
			classesTabGeoAttributesSelectedAttributeGet: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedAttribute';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageGet(parameters);
			},

			/**
			 * @param {Array or String} attributePath
			 *
			 * @returns {Mixed or undefined}
			 *
			 * @private
			 */
			classesTabGeoAttributesSelectedAttributeIsEmpty: function (attributePath) {
				var parameters = {};
				parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedAttribute';
				parameters[CMDBuild.core.constants.Proxy.ATTRIBUTE_PATH] = attributePath;

				return this.propertyManageIsEmpty(parameters);
			},

			/**
			 * @returns {Void}
			 *
			 * @private
			 */
			classesTabGeoAttributesSelectedAttributeReset: function () {
				this.propertyManageReset('selectedAttribute');
			},

			/**
			 * @param {Object} parameters
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			classesTabGeoAttributesSelectedAttributeSet: function (parameters) {
				if (Ext.isObject(parameters) && !Ext.Object.isEmpty(parameters)) {
					parameters[CMDBuild.core.constants.Proxy.MODEL_NAME] = 'CMDBuild.model.classes.tabs.geoAttributes.Attribute';
					parameters[CMDBuild.core.constants.Proxy.TARGET_VARIABLE_NAME] = 'selectedAttribute';

					this.propertyManageSet(parameters);
				}
			},

		/**
		 * @param {Object} response
		 * @param {Object} options
		 * @param {Object} decodedResponse
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		success: function (response, options, decodedResponse) {
			var formData = this.form.getData(true);

			/**
			 * @deprecated
			 */
			_CMCache.onGeoAttributeSaved();

			this.cmfg('onClassesTabGeoAttributesShow', formData[CMDBuild.core.constants.Proxy.NAME]);
		}
	});

})();

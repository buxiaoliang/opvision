(function () {

	Ext.define('CMDBuild.view.administration.classes.tabs.geoAttributes.FormPanel', {
		extend: 'Ext.form.Panel',

		requires: [
			'CMDBuild.core.constants.FieldWidths',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.proxy.administration.classes.tabs.GeoAttributes'
		],

		mixins: ['CMDBuild.view.common.PanelFunctions'],

		/**
		 * @cfg {CMDBuild.controller.administration.classes.tabs.GeoAttributes}
		 */
		delegate: undefined,

		/**
		 * @property {Ext.container.Container}
		 */
		customPropertiesContainer: undefined,

		/**
		 * @property {Ext.form.field.Text}
		 */
		descriptionField: undefined,

		/**
		 * @property {CMDBuild.view.common.field.picker.Color}
		 */
		fieldColorFill: undefined,

		/**
		 * @property {CMDBuild.view.common.field.picker.Color}
		 */
		fieldColorStroke: undefined,

		/**
		 * @property {Ext.form.field.ComboBox}
		 */
		fieldDashstyleStroke: undefined,

		/**
		 * @property {CMDBuild.view.common.field.comboBox.Icon}
		 */
		fieldExternalGraphic: undefined,

		/**
		 * @property {Ext.slider.Single}
		 */
		fieldOpacityFill: undefined,

		/**
		 * @property {Ext.slider.Single}
		 */
		fieldOpacityStroke: undefined,

		/**
		 * @property {Ext.form.field.Number}
		 */
		fieldRadiusPoint: undefined,

		/**
		 * @property {Ext.form.field.Number}
		 */
		fieldWidthStroke: undefined,

		/**
		 * @property {Ext.slider.Single}
		 */
		maxZoomField: undefined,

		/**
		 * @property {Ext.slider.Single}
		 */
		minZoomField: undefined,

		/**
		 * @property {Ext.form.field.ComboBox}
		 */
		typeField: undefined,

		bodyCls: 'cmdb-gray-panel',
		border: false,
		cls: 'x-panel-body-default-framed cmdb-border-top',
		frame: false,
		split: true,
		region: 'center',

		layout: {
			type: 'hbox',
			align: 'stretch'
		},

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			// Build form fields
				Ext.apply(this, {
					fieldColorFill: Ext.create('CMDBuild.view.common.field.picker.Color', {
						name: CMDBuild.core.constants.Proxy.FILL_COLOR,
						fieldLabel: CMDBuild.Translation.fillColor,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_MEDIUM
					}),
					fieldColorStroke: Ext.create('CMDBuild.view.common.field.picker.Color', {
						name: CMDBuild.core.constants.Proxy.STROKE_COLOR,
						fieldLabel: CMDBuild.Translation.strokeColor,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_MEDIUM
					}),
					fieldDashstyleStroke: Ext.create('Ext.form.field.ComboBox', {
						name: CMDBuild.core.constants.Proxy.STROKE_DASHSTYLE,
						fieldLabel: CMDBuild.Translation.strokeDashstyle,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_MEDIUM,
						valueField: CMDBuild.core.constants.Proxy.VALUE,
						displayField: CMDBuild.core.constants.Proxy.DESCRIPTION,
						forceSelection: true,
						editable: false,

						store: CMDBuild.proxy.administration.classes.tabs.GeoAttributes.getStoreStrokeDashstyle(),
						queryMode: 'local'
					}),
					fieldExternalGraphic: Ext.create('CMDBuild.view.common.field.comboBox.Icon', {
						name: CMDBuild.core.constants.Proxy.EXTERNAL_GRAPHIC,
						fieldLabel: CMDBuild.Translation.icon,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
						valueField: CMDBuild.core.constants.Proxy.PATH,
						displayField: CMDBuild.core.constants.Proxy.DESCRIPTION,

						store: CMDBuild.proxy.administration.classes.tabs.GeoAttributes.getStoreExternalGraphic(),
						queryMode: 'local'
					}),
					fieldRadiusPoint: Ext.create('Ext.form.field.Number', {
						name: CMDBuild.core.constants.Proxy.POINT_RADIUS,
						fieldLabel: CMDBuild.Translation.pointRadius,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_SMALL,
						allowDecimals: false,
						minValue: 0,
						maxValue: 100
					}),
					fieldOpacityFill: Ext.create('Ext.slider.Single', {
						name: CMDBuild.core.constants.Proxy.FILL_OPACITY,
						fieldLabel: CMDBuild.Translation.fillOpacity,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
						minValue: 0,
						maxValue: 1,
						decimalPrecision: 1,
						increment: 0.1,

						tipText: function (thumb) {
							return thumb.value * 100 + '%';
						}
					}),
					fieldOpacityStroke: Ext.create('Ext.slider.Single', {
						name: CMDBuild.core.constants.Proxy.STROKE_OPACITY,
						fieldLabel: CMDBuild.Translation.strokeOpacity,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
						minValue: 0,
						maxValue: 1,
						decimalPrecision: 1,
						increment: 0.1,

						tipText: function (thumb) {
							return thumb.value * 100 + '%';
						}
					}),
					fieldWidthStroke: Ext.create('Ext.form.field.Number', {
						name: CMDBuild.core.constants.Proxy.STROKE_WIDTH,
						fieldLabel: CMDBuild.Translation.strokeWidth,
						labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
						maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_SMALL,
						allowDecimals: false,
						minValue: 0,
						maxValue: 10
					})
				});

			Ext.apply(this, {
				dockedItems: [
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'top',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_TOP,

						items: [
							Ext.create('CMDBuild.core.buttons.iconized.Modify', {
								text: CMDBuild.Translation.modifyAttribute,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onClassesTabGeoAttributesModifyButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.iconized.Remove', {
								text: CMDBuild.Translation.removeAttribute,
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onClassesTabGeoAttributesRemoveButtonClick');
								}
							})
						]
					}),
					Ext.create('Ext.toolbar.Toolbar', {
						dock: 'bottom',
						itemId: CMDBuild.core.constants.Proxy.TOOLBAR_BOTTOM,
						ui: 'footer',

						layout: {
							type: 'hbox',
							align: 'middle',
							pack: 'center'
						},

						items: [
							Ext.create('CMDBuild.core.buttons.text.Save', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onClassesTabGeoAttributesSaveButtonClick');
								}
							}),
							Ext.create('CMDBuild.core.buttons.text.Abort', {
								scope: this,

								handler: function (button, e) {
									this.delegate.cmfg('onClassesTabGeoAttributesAbortButtonClick');
								}
							})
						]
					})
				],
				items: [
					Ext.create('Ext.form.FieldSet', {
						title: CMDBuild.Translation.baseProperties,
						flex: 1,
						overflowY: 'auto',

						layout: {
							type: 'vbox',
							align: 'stretch'
						},

						items: [
							Ext.create('Ext.form.field.Text', {
								name: CMDBuild.core.constants.Proxy.NAME,
								fieldLabel: CMDBuild.Translation.name,
								labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
								maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
								allowBlank: false,
								disableEnableFunctions: true,
								vtype: 'alphanum',

								enableKeyEvents: true,

								listeners: {
									scope: this,
									change: function (field, newValue, oldValue, eOpts) {
										this.fieldSynch(this.descriptionField, newValue, oldValue);
									}
								}
							}),
							this.descriptionField = Ext.create('Ext.form.field.Text', {
								name: CMDBuild.core.constants.Proxy.DESCRIPTION,
								fieldLabel: CMDBuild.Translation.descriptionLabel,
								labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
								maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
								allowBlank: false
							}),
							this.minZoomField = Ext.create('Ext.slider.Single', {
								name: CMDBuild.core.constants.Proxy.MIN_ZOOM,
								fieldLabel: CMDBuild.Translation.minimumZoom,
								labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
								maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
								minValue: 0,
								maxValue: 25,

								listeners: {
									scope: this,
									drag: function (field, e, eOpts) {
										this.delegate.cmfg('onClassesTabGeoAttributesMinZoomDrag');
									}
								}
							}),
							this.maxZoomField = Ext.create('Ext.slider.Single', {
								name: CMDBuild.core.constants.Proxy.MAX_ZOOM,
								fieldLabel: CMDBuild.Translation.maximumZoom,
								labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
								maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_BIG,
								minValue: 0,
								maxValue: 25,

								listeners: {
									scope: this,
									drag: function (field, e, eOpts) {
										this.delegate.cmfg('onClassesTabGeoAttributesMaxZoomDrag');
									}
								}
							})
						]
					}),
					{ xtype: 'splitter' },
					Ext.create('Ext.form.FieldSet', {
						title: CMDBuild.Translation.style,
						flex: 1,
						overflowY: 'auto',

						layout: {
							type: 'vbox',
							align: 'stretch'
						},

						items: [
							this.typeField = Ext.create('Ext.form.field.ComboBox', {
								name: CMDBuild.core.constants.Proxy.TYPE,
								fieldLabel: CMDBuild.Translation.type,
								labelWidth: CMDBuild.core.constants.FieldWidths.LABEL,
								maxWidth: CMDBuild.core.constants.FieldWidths.ADMINISTRATION_MEDIUM,
								valueField: CMDBuild.core.constants.Proxy.VALUE,
								displayField: CMDBuild.core.constants.Proxy.DESCRIPTION,
								allowBlank: false,
								disableEnableFunctions: true,
								forceSelection: true,
								editable: false,

								store: CMDBuild.proxy.administration.classes.tabs.GeoAttributes.getStoreType(),
								queryMode: 'local',

								listeners: {
									scope: this,
									change: function (field, newValue, oldValue, eOpts) {
										this.delegate.cmfg('onClassesTabGeoAttributesTypeSelect');
									}
								}
							}),
							this.customPropertiesContainer = Ext.create('Ext.container.Container', {
								layout: {
									type: 'vbox',
									align: 'stretch'
								},

								items: []
							})
						]
					})
				]
			});

			this.callParent(arguments);

			this.setDisabledModify(true, true, true);
		}
	});

})();

(function() {
	var TOGGLE_PANEL_ID = "togglePanel";
	var PAN_BUTTON_ID = "panButton";
	var ROTATE_BUTTON_ID = "rotateButton";

	var SLIDER_PANEL_ID = "sliderPanel";
	var ZOOM_SLIDER_ID = "zoomSlider";
	var TRANSPARENT_SLIDER_ID = "transparentSlider";
	var EXPOSE_SLIDER_ID = "exposeSlider";

	Ext.define("CMDBuild.bim.management.view.CMBimControlPanelDelegate", {
		onBimControlPanelResetButtonClick : function() {
		},
		onBimControlPanelFrontButtonClick : function() {
		},
		onBimControlPanelSideButtonClick : function() {
		},
		onBimControlPanelTopButtonClick : function() {
		},
		onBimControlPanelPanButtonClick : function() {
		},
		onBimControlPanelRotateButtonClick : function() {
		},
		/**
		 * @param {Number}
		 *            value the current value of the slider
		 */
		onBimControlPanelZoomSliderChange : function(value) {
		},
		/**
		 * @param {Number}
		 *            value the current value of the slider
		 */
		onBimControlPanelExposeSliderChange : function(value) {
		},
		/**
		 * @param {Number}
		 *            value the current value of the slider
		 */
		onBimControlPanelTransparentSliderChange : function(value) {
		}
	});

	Ext.define("CMDBuild.bim.management.view.CMBimControlPanel", {
		extend : "Ext.panel.Panel",

		initComponent : function() {
			this.title = CMDBuild.Translation.controls;

			if (!this.delegate) {
				this.delegate = new CMDBuild.bim.management.view.CMBimControlPanelDelegate();
			}

			this.bodyPadding = "5 5 5 5";

			var me = this;

			this.items = [ {
				xtype : "fieldset",
				title : CMDBuild.Translation.camera,
				padding : "0 5 5 5",
				layout : {
					type : 'hbox'
				},
				items : [ {
					xtype : "button",
					text : CMDBuild.Translation.reset,
					flex : 1,
					handler : function() {
						me.delegate.onBimControlPanelResetButtonClick();
					}
				}, {
					xtype : "button",
					text : CMDBuild.Translation.front,
					flex : 1,
					handler : function() {
						me.delegate.onBimControlPanelFrontButtonClick();
					}
				}, {
					xtype : "button",
					text : CMDBuild.Translation.side,
					flex : 1,
					handler : function() {
						me.delegate.onBimControlPanelSideButtonClick();
					}
				}, {
					xtype : "button",
					text : CMDBuild.Translation.top,
					flex : 1,
					handler : function() {
						me.delegate.onBimControlPanelTopButtonClick();
					}
				} ]
			}, {
				itemId : SLIDER_PANEL_ID,
				border : false,
				layout : {
					type : 'vbox',
					align : 'stretch'
				},
				items : [{
					xtype : "slider",
					fieldLabel : CMDBuild.Translation.transparent,
					value : 50,
					minValue : 0,
					maxValue : 100,
					labelAlign : "top",
					itemId : TRANSPARENT_SLIDER_ID,
					listeners : {
						change : function(slider, value) {
							me.delegate.onBimControlPanelTransparentSliderChange(value);
						}
					}
				} ]
			// } ]
			} ];

			this.callParent(arguments);
		},

		reset : function() {
			// reset toggle buttons
			var pan = this.query("#" + PAN_BUTTON_ID)[0];
			var rotate = this.query("#" + ROTATE_BUTTON_ID)[0];

			pan.toggle(false);
			rotate.toggle(true);

			// reset sliders
			this.query("#" + ZOOM_SLIDER_ID)[0].setValue(0);
			this.query("#" + EXPOSE_SLIDER_ID)[0].setValue(0);
			// this.query("#" + TRANSPARENT_SLIDER_ID)[0].setValue(0);

			this.disableObjectSliders();
		},

		enableObjectSliders : function() {
			this.query("#" + EXPOSE_SLIDER_ID)[0].enable();
			// this.query("#" + TRANSPARENT_SLIDER_ID)[0].enable();
		},

		disableObjectSliders : function() {
			this.query("#" + EXPOSE_SLIDER_ID)[0].disable();
			// this.query("#" + TRANSPARENT_SLIDER_ID)[0].disable();
		}
	});

})();
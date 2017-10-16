(function () {

	Ext.define('CMDBuild.controller.management.classes.map.LayerTree', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.view.management.classes.map.LayerTree'
		],

		/**
		 * @cfg {??}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onVisibilityChange'
		],

		/**
		 * @property {CMDBuild.view.administration.userAndGroup.user.UserView}
		 */
		view: undefined,

		map: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {String} configurationObject.title
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.management.classes.map.LayerTree', { 
				delegate: this,
				title : configurationObject.title,
				interactionDocument : this.interactionDocument
			});

		},

		/**
		 * @param {Object} card
		 * @param {Number} card.Id
		 * @param {Number} card.IdClass
		 * 
		 * @returns {Void}
		 */
		onVisibilityChange: function(event) {
			this.interactionDocument.setLayerVisibility(event.layer, event.checked);
			this.interactionDocument.changed();
		}
	});

})();


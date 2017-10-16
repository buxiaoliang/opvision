(function () {

	/**
	 * Emulation of Ext.selection.Model
	 */
	Ext.define('CMDBuild.controller.management.widget.navigationTree.SelectionModel', {

		requires: ['CMDBuild.core.constants.Proxy'],

		/**
		 * @property {Array}
		 *
		 * @private
		 */
		selections: {},

		/**
		 * @param {CMDBuild.model.management.widget.navigationTree.Node or Number} selection
		 *
		 * @returns {Void}
		 */
		deselect: function (selection) {
			switch (Ext.typeOf(selection)) {
				case 'number':
					return delete this.selections[selection];

				case 'object': {
					if (!Ext.isEmpty(this.selections[selection.get(CMDBuild.core.constants.Proxy.CARD_ID)]))
						delete this.selections[selection.get(CMDBuild.core.constants.Proxy.CARD_ID)];
				} break;
			}
		},

		/**
		 * @returns {Void}
		 */
		deselectAll: function () {
			this.selections = {};
		},

		/**
		 * @returns {Array}
		 */
		getSelection: function () {
			return Ext.Object.getValues(this.selections);
		},

		/**
		 * @param {Number or String} id
		 *
		 * @returns {Boolean}
		 */
		isSelected: function (id) {
			if (!Ext.isEmpty(id))
				return Ext.Array.contains(Ext.Object.getKeys(this.selections), String(id));

			return false;
		},

		/**
		 * @param {CMDBuild.model.management.widget.navigationTree.Node or object} selection
		 *
		 * @returns {Void}
		 */
		select: function (selection) {
			if (Ext.isObject(selection) && !Ext.Object.isEmpty(selection))
				if (!Ext.isEmpty(selection[CMDBuild.core.constants.Proxy.CARD_ID]) && !Ext.isEmpty(selection[CMDBuild.core.constants.Proxy.CLASS_NAME])) {
					var selectionObject = {};
					selectionObject[CMDBuild.core.constants.Proxy.CARD_ID] = selection[CMDBuild.core.constants.Proxy.CARD_ID];
					selectionObject[CMDBuild.core.constants.Proxy.CLASS_NAME] = selection[CMDBuild.core.constants.Proxy.CLASS_NAME];

					this.selections[selection[CMDBuild.core.constants.Proxy.CARD_ID]] = selectionObject;
				} else if (Ext.isFunction(selection.get)) {
					var selectionObject = {};
					selectionObject[CMDBuild.core.constants.Proxy.CARD_ID] = selection.get(CMDBuild.core.constants.Proxy.CARD_ID);
					selectionObject[CMDBuild.core.constants.Proxy.CLASS_NAME] = selection.get(CMDBuild.core.constants.Proxy.CLASS_NAME);

					this.selections[selection.get(CMDBuild.core.constants.Proxy.CARD_ID)] = selectionObject;
				}
		}
	});

})();

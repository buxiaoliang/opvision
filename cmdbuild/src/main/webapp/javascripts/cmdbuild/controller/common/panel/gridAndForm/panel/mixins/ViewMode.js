(function () {

	Ext.define('CMDBuild.controller.common.panel.gridAndForm.panel.mixins.ViewMode', {

		/**
		 * @property {String}
		 *
		 * @private
		 */
		viewMode: 'read',

		/**
		 * @property {Array}
		 *
		 * @private
		 */
		viewModeManaged: ['add', 'edit', 'read', 'readOnly'],

		/**
		 * Mode parameter could be also an array to check if current viewMode is present in array
		 *
		 * @param {String or Array} mode
		 *
		 * @returns {Boolean}
		 */
		panelGridAndFormMixinsViewModeEquals: function (mode) {
			mode = Ext.isArray(mode) ? Ext.Array.clean(mode) : Ext.Array.clean([mode]);

			if (Ext.isArray(mode) && !Ext.isEmpty(mode))
				return Ext.Array.contains(mode, this.viewMode);

			return false;
		},

		/**
		 * @returns {String}
		 */
		panelGridAndFormMixinsViewModeGet: function () {
			return this.viewMode;
		},

		/**
		 * @param {String} mode
		 *
		 * @returns {Void}
		 */
		panelGridAndFormMixinsViewModeSet: function (mode) {
			mode = Ext.isString(mode) && Ext.Array.contains(this.viewModeManaged, mode) ? mode : 'read';

			this.viewMode = mode;
		}
	});

})();

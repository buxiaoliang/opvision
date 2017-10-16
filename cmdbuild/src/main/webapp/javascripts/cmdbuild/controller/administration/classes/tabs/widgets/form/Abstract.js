(function () {

	// External implementation to avoid overrides
	Ext.require(['CMDBuild.core.constants.Proxy']);

	/**
	 * @abstract
	 */
	Ext.define('CMDBuild.controller.administration.classes.tabs.widgets.form.Abstract', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		/**
		 * @cfg {CMDBuild.controller.administration.classes.tabs.widgets.Widgets}
		 */
		parentDelegate: undefined,

		/**
		 * @cfg {String}
		 *
		 * @private
		 */
		definitionModelName: undefined,

		/**
		 * @returns {Void}
		 */
		classesTabWidgetsWidgetAdd: function () {
			this.view.reset();
			this.view.setDisabledModify(false, true);
			this.view.loadRecord(Ext.create(this.cmfg('classesTabWidgetsWidgetDefinitionModelNameGet')));
		},

		// DefinitionModelName property methods
			/**
			 * @returns {String}
			 */
			classesTabWidgetsWidgetDefinitionModelNameGet: function () {
				if (!this.classesTabWidgetsWidgetDefinitionModelNameIsEmpty())
					return this.definitionModelName;

				return '';
			},

			/**
			 * @returns {Boolean}
			 *
			 * @private
			 */
			classesTabWidgetsWidgetDefinitionModelNameIsEmpty: function () {
				return !Ext.isString(this.definitionModelName) || Ext.isEmpty(this.definitionModelName);
			}
	});

})();

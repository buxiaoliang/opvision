(function () {

	Ext.define('CMDBuild.core.templateResolver.Utils', {
		uses: ['CMDBuild.core.constants.TemplateResolver'],
		
		singleton: true,

		/**
		 * @param {String} string
		 *
		 * @returns {Boolean}
		 *
		 * @private
		 */
		hasTemplatesForStrings: function (string) {
			return !Ext.Array.every(CMDBuild.core.constants.TemplateResolver.getTemplateList(), function (template, i, allTemplates) {
				return string.indexOf(template) < 0; // Stops loop at first template found
			}, this);
		},

		/**
		 * @param {Mixed} target
		 *
		 * @returns {Boolean}
		 */
		hasTemplates: function (target) {
			switch (Ext.typeOf(target)) {
				case 'array':
				case 'object':
					return CMDBuild.core.templateResolver.Utils.hasTemplatesForStrings(Ext.encode(target));

				case 'string':
					return CMDBuild.core.templateResolver.Utils.hasTemplatesForStrings(target);

				default:
					return _error('hasTemplates(): unmanaged target type', this, target);
			}
		}
	});

})();

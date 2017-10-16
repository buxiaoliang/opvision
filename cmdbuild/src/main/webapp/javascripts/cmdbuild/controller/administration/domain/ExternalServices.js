(function () {

	Ext.define('CMDBuild.controller.administration.domain.ExternalServices', {
		/**
		 * @returns {Void}
		 */
		domainExternalServicesAddButtonClick: function (parameters) {
			var accordionController = this.cmfg('mainViewportAccordionControllerGet', CMDBuild.core.constants.ModuleIdentifiers.getDomain()),
				moduleController = this.cmfg('mainViewportModuleControllerGet', CMDBuild.core.constants.ModuleIdentifiers.getDomain());

			Ext.apply(accordionController, {
				disableSelection: true,
				scope: this,
				callback: function () {
					accordionController.cmfg('accordionDeselect');

					moduleController.cmfg('onDomainAddButtonClick');
				}
			});

			accordionController.cmfg('accordionExpand');
		},

		/**
		 * Foreign services item double click only selects row
		 *
		 * @param {Object} parameters
		 * @param {Number} parameters.id
		 *
		 * @returns {Void}
		 */
		domainExternalServicesItemDoubleClick: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (!Ext.isNumber(parameters.id) || Ext.isEmpty(parameters.id))
					return _error('domainExternalServicesItemDoubleClick(): unmanaged id parameter', this, parameters.id);
			// END: Error handling

			if (this.cmfg('mainViewportAccordionControllerExists', this.cmfg('domainIdentifierGet'))) {
				var accordionController = this.cmfg('mainViewportAccordionControllerGet', this.cmfg('domainIdentifierGet'));

				Ext.apply(accordionController, {
					disableSelection: true,
					scope: this,
					callback: function () {
						accordionController.cmfg('accordionDeselect');
						accordionController.cmfg('accordionNodeByIdSelect', { id: parameters.id });
					}
				});

				accordionController.cmfg('accordionExpand');
			}
		},

		/**
		 * @param {Object} parameters
		 * @param {Number} parameters.id
		 *
		 * @returns {Void}
		 */
		domainExternalServicesModifyButtonClick: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};

			// Error handling
				if (!Ext.isNumber(parameters.id) || Ext.isEmpty(parameters.id))
					return _error('domainExternalServicesModifyButtonClick(): unmanaged id parameters', this, parameters.id);
			// END: Error handling

			if (
				this.cmfg('mainViewportAccordionControllerExists', this.cmfg('domainIdentifierGet'))
				&& this.cmfg('mainViewportModuleControllerExists', this.cmfg('domainIdentifierGet'))
			) {
				var accordionController = this.cmfg('mainViewportAccordionControllerGet', this.cmfg('domainIdentifierGet')),
					moduleController = this.cmfg('mainViewportModuleControllerGet', this.cmfg('domainIdentifierGet'));

				Ext.apply(accordionController, {
					disableSelection: true,
					scope: this,
					callback: function () {
						accordionController.cmfg('accordionDeselect');
						accordionController.cmfg('accordionNodeByIdSelect', { id: parameters.id });

						Ext.Function.createDelayed(function () { // FIXME: fix me avoid delay
							moduleController.cmfg('onDomainModifyButtonClick');
						}, 100, this)();
					}
				});

				accordionController.cmfg('accordionExpand');
			}
		}
	});

})();

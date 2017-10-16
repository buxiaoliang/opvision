(function () {

	/**
	 * Panel expansion mode manager. If we are in FullScreenMode or we have manually expanded to full screen mode, panels are expanded following regular logic focus rules.
	 *
	 * NOTE: "form" and "grid" (or "tree") pointers are required to work with UI state module
	 */
	Ext.define('CMDBuild.controller.common.panel.gridAndForm.panel.mixins.ExpansionMode', {

		/**
		 * @returns {Boolean}
		 *
		 * @private
		 */
		panelGridAndFormMixinsExpansionModeAreBothDisplayed: function () {
			var topPanel = Ext.isEmpty(this.grid) ? this.tree : this.grid;

			return topPanel.isVisible() && this.form.isVisible();
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.force
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		panelGridAndFormMixinsExpansionModeDisplayBoth: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.force = Ext.isBoolean(parameters.force) ? parameters.force : false;

			var topPanel = Ext.isEmpty(this.grid) ? this.tree : this.grid;

			// Error handling
				if (!Ext.isObject(this.form) || Ext.Object.isEmpty(this.form) || !this.form instanceof Ext.panel.Panel)
					return _error('panelGridAndFormMixinsExpansionModeDisplayBoth(): unmanaged form property', this, this.form);

				if (!Ext.isObject(topPanel) || Ext.Object.isEmpty(topPanel) || !topPanel instanceof Ext.panel.Panel)
					return _error('panelGridAndFormMixinsExpansionModeDisplayBoth(): unmanaged topPanel property', this, topPanel);
			// END: Error handling

			var fullscreen = parameters[CMDBuild.core.constants.Proxy.FULL_SCREEN_MODE];
			if (fullscreen === undefined) {
				fullscreen = CMDBuild.configuration.userInterface.get(CMDBuild.core.constants.Proxy.FULL_SCREEN_MODE);
			}

			if (
				fullscreen
				|| !this.panelGridAndFormMixinsExpansionModeAreBothDisplayed()
				|| parameters.force
			) {
				Ext.suspendLayouts();

				// Show top panel to center
				topPanel.show();
				topPanel.region = 'center';

				// Show bottom panel to south
				this.form.show();
				this.form.region = 'south';

				this.panelGridAndFormMixinsExpansionModeStyleClsAdd(); // Add style classes to panels

				Ext.resumeLayouts(true);
			}
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.force
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		panelGridAndFormMixinsExpansionModeMaximizeBottom: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.force = Ext.isBoolean(parameters.force) ? parameters.force : false;

			var topPanel = Ext.isEmpty(this.grid) ? this.tree : this.grid;

			// Error handling
				if (!Ext.isObject(this.form) || Ext.Object.isEmpty(this.form) || !this.form instanceof Ext.panel.Panel)
					return _error('panelGridAndFormMixinsExpansionModeMaximizeBottom(): unmanaged form property', this, this.form);

				if (!Ext.isObject(topPanel) || Ext.Object.isEmpty(topPanel) || !topPanel instanceof Ext.panel.Panel)
					return _error('panelGridAndFormMixinsExpansionModeMaximizeBottom(): unmanaged topPanel property', this, topPanel);
			// END: Error handling

			var fullscreen = parameters[CMDBuild.core.constants.Proxy.FULL_SCREEN_MODE];
			if (fullscreen === undefined) {
				fullscreen = CMDBuild.configuration.userInterface.get(CMDBuild.core.constants.Proxy.FULL_SCREEN_MODE);
			}

			if (
				fullscreen
				|| !this.panelGridAndFormMixinsExpansionModeAreBothDisplayed()
				|| parameters.force
			) {
				Ext.suspendLayouts();

				// Hide top panel
				topPanel.hide();
				topPanel.region = '';

				// Show and maximize bottom panel
				this.form.show();
				this.form.region = 'center';

				this.panelGridAndFormMixinsExpansionModeStyleClsRemove(); // Remove style classes from panels

				Ext.resumeLayouts(true);
			}
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.force
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		panelGridAndFormMixinsExpansionModeMaximizeTop: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.force = Ext.isBoolean(parameters.force) ? parameters.force : false;

			var topPanel = Ext.isEmpty(this.grid) ? this.tree : this.grid;

			// Error handling
				if (!Ext.isObject(this.form) || Ext.Object.isEmpty(this.form) || !this.form instanceof Ext.panel.Panel)
					return _error('panelGridAndFormMixinsExpansionModeMaximizeTop(): unmanaged form property', this, this.form);

				if (!Ext.isObject(topPanel) || Ext.Object.isEmpty(topPanel) || !topPanel instanceof Ext.panel.Panel)
					return _error('panelGridAndFormMixinsExpansionModeMaximizeTop(): unmanaged topPanel property', this, topPanel);
			// END: Error handling

			var fullscreen = parameters[CMDBuild.core.constants.Proxy.FULL_SCREEN_MODE];
			if (fullscreen === undefined) {
				fullscreen = CMDBuild.configuration.userInterface.get(CMDBuild.core.constants.Proxy.FULL_SCREEN_MODE);
			}

			if (
				fullscreen
				|| !this.panelGridAndFormMixinsExpansionModeAreBothDisplayed()
				|| parameters.force
			) {
				Ext.suspendLayouts();

				// Show and maximize top panel
				topPanel.show();
				topPanel.region = 'center';

				// Hide bottom panel
				this.form.hide();
				this.form.region = '';

				this.panelGridAndFormMixinsExpansionModeStyleClsRemove(); // Remove style classes from panels

				Ext.resumeLayouts(true);
			}
		},

		/**
		 * @param {Object} parameters
		 * @param {Boolean} parameters.force
		 * @param {String} parameters.maximize
		 *
		 * @returns {Void}
		 */
		panelGridAndFormMixinsExpansionModeSet: function (parameters) {
			parameters = Ext.isObject(parameters) ? parameters : {};
			parameters.maximize = Ext.isString(parameters.maximize) ? parameters.maximize : 'both';

			var params = {};
			params.force = parameters.force;
			params[CMDBuild.core.constants.Proxy.FULL_SCREEN_MODE] = parameters[CMDBuild.core.constants.Proxy.FULL_SCREEN_MODE];

			switch (parameters.maximize) {
				case 'bottom':
					return this.panelGridAndFormMixinsExpansionModeMaximizeBottom(params);

				case 'top':
					return this.panelGridAndFormMixinsExpansionModeMaximizeTop(params);

				case 'both':
					return this.panelGridAndFormMixinsExpansionModeDisplayBoth(params);

				default:
					return _error('panelGridAndFormMixinsExpansionModeSet(): unmanaged maximize parameter', this, parameters.maximize);
			}
		},

		/**
		 * @param {Ext.panel.Panel} panel
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		panelGridAndFormMixinsExpansionModeStyleClsAdd: function () {
			var topPanel = Ext.isEmpty(this.grid) ? this.tree : this.grid;

			// Error handling
				if (!Ext.isObject(this.form) || Ext.Object.isEmpty(this.form) || !this.form instanceof Ext.panel.Panel)
					return _error('panelGridAndFromFullScreenRemoveStyleCls(): unmanaged form property', this, this.form);

				if (!Ext.isObject(topPanel) || Ext.Object.isEmpty(topPanel) || !topPanel instanceof Ext.panel.Panel)
					return _error('panelGridAndFromFullScreenRemoveStyleCls(): unmanaged topPanel property', this, topPanel);
			// END: Error handling

			if (!topPanel.hasCls('cmdb-border-bottom'))
				topPanel.addCls('cmdb-border-bottom');

			if (!this.form.hasCls('cmdb-border-top'))
				this.form.addCls('cmdb-border-top');
		},

		/**
		 * @param {Ext.panel.Panel} panel
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		panelGridAndFormMixinsExpansionModeStyleClsRemove: function () {
			var topPanel = Ext.isEmpty(this.grid) ? this.tree : this.grid;

			// Error handling
				if (!Ext.isObject(this.form) || Ext.Object.isEmpty(this.form) || !this.form instanceof Ext.panel.Panel)
					return _error('panelGridAndFromFullScreenRemoveStyleCls(): unmanaged form property', this, this.form);

				if (!Ext.isObject(topPanel) || Ext.Object.isEmpty(topPanel) || !topPanel instanceof Ext.panel.Panel)
					return _error('panelGridAndFromFullScreenRemoveStyleCls(): unmanaged topPanel property', this, topPanel);
			// END: Error handling

			if (topPanel.hasCls('cmdb-border-bottom'))
				topPanel.removeCls('cmdb-border-bottom');

			if (this.form.hasCls('cmdb-border-top'))
				this.form.removeCls('cmdb-border-top');
		}
	});

})();

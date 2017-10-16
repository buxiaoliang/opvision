(function () {

	Ext.define('CMDBuild.controller.login.Login', {
		extend: 'CMDBuild.controller.common.abstract.Base',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.CookiesManager',
			'CMDBuild.proxy.Session'
		],

		/**
		 * @cfg {Array}
		 */
		cmfgCatchedFunctions: [
			'onLoginLoginButtonClick'
		],

		/**
		 * @property {CMDBuild.view.login.FormPanel}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.login.LoginViewport}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		constructor: function (configurationObject) {
			this.callParent(arguments);

			this.view = Ext.create('CMDBuild.view.login.LoginViewport', { delegate: this });

			// Shorthands
			this.form = this.view.formContainer.form;

			Ext.ns('CMDBuild.configuration.runtime');

			this.loginUiUpdate();
		},

		/**
		 * Setup UI items visibility and values
		 *
		 * @returns {Void}
		 */
		loginUiUpdate: function () {
			var availableGroups = CMDBuild.configuration.runtime.get(CMDBuild.core.constants.Proxy.GROUPS),
				userName = CMDBuild.configuration.runtime.get(CMDBuild.core.constants.Proxy.USERNAME);

			// User field setup
			this.form.user.setValue(Ext.isString(userName) && !Ext.isEmpty(userName) ? userName : '');
			this.form.user.setDisabled(!Ext.isEmpty(this.form.user.getValue()));

			if (Ext.isEmpty(this.form.user.getValue()))
				this.form.user.focus();

			// Password field setup
			this.form.password.setVisible(Ext.isEmpty(this.form.user.getValue()));

			// Group field setup
			this.form.group.setVisible(!Ext.isEmpty(availableGroups));

			if (!Ext.isEmpty(availableGroups)) {
				this.form.group.getStore().loadData(availableGroups);
				this.form.user.focus();
			}
		},

		/**
		 * @returns {Void}
		 */
		onLoginLoginButtonClick: function () {
			if (this.form.group.isHidden())
				return this.sessionCreate();

			return this.sessionUpdate();
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		sectionRedirect: function () {
			if (/administration.jsp$/.test(window.location)) {
				window.location = 'administration.jsp' + window.location.hash;
			} else {
				window.location = 'management.jsp' + window.location.hash;
			}
		},

		/**
		 * @returns {Void}
		 *
		 * @private
		 */
		sessionCreate: function () {
			if (this.validate(this.form)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.PASSWORD] = this.form.password.getValue();
				params[CMDBuild.core.constants.Proxy.USERNAME] = this.form.user.getValue();

				CMDBuild.proxy.Session.create({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

						if (Ext.isObject(decodedResponse) && !Ext.Object.isEmpty(decodedResponse)) {
							CMDBuild.core.CookiesManager.authorizationSet(decodedResponse[CMDBuild.core.constants.Proxy.SESSION_ID]);

							var group = decodedResponse[CMDBuild.core.constants.Proxy.GROUP],
								groups = decodedResponse[CMDBuild.core.constants.Proxy.GROUPS],
								language = decodedResponse[CMDBuild.core.constants.Proxy.LANGUAGE];

							// Succesfully logged
							if (Ext.isString(group) && !Ext.isEmpty(group))
								return this.sectionRedirect();

							// Group needs to be selected
							if (Ext.isArray(groups) && !Ext.isEmpty(groups)) {
								CMDBuild.configuration.runtime.set(CMDBuild.core.constants.Proxy.USERNAME, this.form.user.getValue());
								CMDBuild.configuration.runtime.set(CMDBuild.core.constants.Proxy.GROUPS, groups);

								return this.loginUiUpdate();
							}

							return _error('sessionCreate(): unmanaged response', this, decodedResponse);
						} else {
							_error('sessionCreate(): unmanaged response', this, decodedResponse);
						}
					}
				});
			}
		},

		/**
		 * Update session with selected group
		 *
		 * @returns {Void}
		 *
		 * @private
		 */
		sessionUpdate: function () {
			if (this.validate(this.form)) {
				var params = {};
				params[CMDBuild.core.constants.Proxy.GROUP] = this.form.group.getValue();
				params[CMDBuild.core.constants.Proxy.SESSION] = CMDBuild.core.CookiesManager.authorizationGet();

				CMDBuild.proxy.Session.update({
					params: params,
					scope: this,
					success: this.sectionRedirect
				});
			}
		}
	});

})();

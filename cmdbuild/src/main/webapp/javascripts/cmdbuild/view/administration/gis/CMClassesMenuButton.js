(function () {

	Ext.define('CMDBuild.view.administration.gis.CMClassesMenuButtonDelegate', {
		/**
		 *
		 * @param {Ext.menu.Menu} menu
		 * @param {CMDBUild EntryType} entryType
		 */
		onCMClassesMenuButtonItemClick: function(menu, entryType){}
	});

	Ext.define('CMDBuild.view.administration.gis.CMClassesMenuButton', {
		extend: 'Ext.button.Button',

		requires: [
			'CMDBuild.core.constants.Global',
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Utils',
			'CMDBuild.proxy.gis.Button'
		],

		mixins: {
			delegable: 'CMDBuild.core.CMDelegable'
		},

		menu: [],

		constructor: function () {
			this.mixins.delegable.constructor.call(this, 'CMDBuild.view.administration.gis.CMClassesMenuButtonDelegate');

			this.callParent(arguments);
		},

		/**
		 * @returns {Void}
		 */
		readClasses: function () {
			var params = {}
			params[CMDBuild.core.constants.Proxy.ACTIVE] = false;

			CMDBuild.proxy.gis.Button.readAllClasses({
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.RESPONSE];

					if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
						var items = [];

						Ext.Array.forEach(decodedResponse, function (classObject, i, allClassObjects) {
							if (
								Ext.isObject(classObject) && !Ext.Object.isEmpty(classObject)
								&& classObject[CMDBuild.core.constants.Proxy.NAME] != CMDBuild.core.constants.Global.getRootNameClasses()
							) {
								items.push({
									text: classObject[CMDBuild.core.constants.Proxy.TEXT],
									entryType: Ext.create('CMDBuild.cache.CMEntryTypeModel', classObject),
									scope: this,

									handler: function (button, e) {
										this.callDelegates('onCMClassesMenuButtonItemClick', [this, button.entryType]);
									}
								});
							}
						}, this);

						if (Ext.isArray(items) && !Ext.isEmpty(items)) {
							CMDBuild.core.Utils.objectArraySort(items, CMDBuild.core.constants.Proxy.TEXT);

							this.menu.add(items);
						}
					}
				}
			});
		}
	});

})();

(function () {

	/**
	 * Management
	 */
	Ext.application({
		extend: 'Ext.app.Application',

		requires: [
			'Ext.tip.QuickTipManager', // Avoid core override
			'Ext.ux.Router',
			'CMDBuild.controller.management.routes.Card',
			'CMDBuild.controller.management.routes.Classes',
			'CMDBuild.controller.management.routes.Instance',
			'CMDBuild.controller.management.routes.Workflow',
			'CMDBuild.core.Management'
		],

		appFolder: './javascripts/cmdbuild',
		name: 'CMDBuild',

		routes: {
			// Classes
			'classes/:classIdentifier/cards': 'CMDBuild.controller.management.routes.Classes#saveRoute', // Alias (wrong implementation, to delete in future)
			'classes/:classIdentifier/cards/': 'CMDBuild.controller.management.routes.Classes#saveRoute',
			'classes/:classIdentifier/print': 'CMDBuild.controller.management.routes.Classes#saveRoute',

			'exec/classes/:classIdentifier/cards': 'CMDBuild.controller.management.routes.Classes#detail', // Alias (wrong implementation, to delete in future)
			'exec/classes/:classIdentifier/cards/': 'CMDBuild.controller.management.routes.Classes#detail',
			'exec/classes/:classIdentifier/print': 'CMDBuild.controller.management.routes.Classes#print',

			// Cards
			'classes/:classIdentifier/cards/:cardIdentifier': 'CMDBuild.controller.management.routes.Card#saveRoute', // Alias (wrong implementation, to delete in future)
			'classes/:classIdentifier/cards/:cardIdentifier/': 'CMDBuild.controller.management.routes.Card#saveRoute',
			'classes/:classIdentifier/cards/:cardIdentifier/print': 'CMDBuild.controller.management.routes.Card#saveRoute',

			'exec/classes/:classIdentifier/cards/:cardIdentifier': 'CMDBuild.controller.management.routes.Card#detail', // Alias (wrong implementation, to delete in future)
			'exec/classes/:classIdentifier/cards/:cardIdentifier/': 'CMDBuild.controller.management.routes.Card#detail',
			'exec/classes/:classIdentifier/cards/:cardIdentifier/print': 'CMDBuild.controller.management.routes.Card#print',

			// Processes
			'processes/:processIdentifier/instances/': 'CMDBuild.controller.management.routes.Workflow#saveRoute',
			'processes/:processIdentifier/print': 'CMDBuild.controller.management.routes.Workflow#saveRoute',
			'processes/': 'CMDBuild.controller.management.routes.Workflow#saveRoute',

			'exec/processes/:processIdentifier/instances/': 'CMDBuild.controller.management.routes.Workflow#detail',
			'exec/processes/:processIdentifier/print': 'CMDBuild.controller.management.routes.Workflow#print',
			'exec/processes/': 'CMDBuild.controller.management.routes.Workflow#showAll',

			// Instances
			'processes/:processIdentifier/instances/:instanceIdentifier/': 'CMDBuild.controller.management.routes.Instance#saveRoute',

			'exec/processes/:processIdentifier/instances/:instanceIdentifier/': 'CMDBuild.controller.management.routes.Instance#detail'
		},

		/**
		 * @returns {Void}
		 */
		launch: function () {
			Ext.WindowManager.getNextZSeed(); // To increase the default zseed. Is needed for the combo on windows probably it fix also the prev problem
			Ext.enableFx = false;
			Ext.tip.QuickTipManager.init();

			// Fix a problem of Ext 4.2 tooltips width
			// see http://www.sencha.com/forum/showthread.php?260106-Tooltips-on-forms-and-grid-are-not-resizing-to-the-size-of-the-text/page3#24
			delete Ext.tip.Tip.prototype.minWidth;

			Ext.create('CMDBuild.core.LoggerManager'); // Logger configuration
			Ext.create('CMDBuild.core.Routes');
			Ext.create('CMDBuild.core.interfaces.Init'); // Interfaces configuration
			Ext.create('CMDBuild.core.Data', { enableLocalized: true }); // Data connections configuration
			Ext.create('CMDBuild.core.cache.Cache');
			Ext.create('CMDBuild.core.navigation.Chronology'); // Navigation chronology

			CMDBuild.core.Management.init();
		}
	});

})();

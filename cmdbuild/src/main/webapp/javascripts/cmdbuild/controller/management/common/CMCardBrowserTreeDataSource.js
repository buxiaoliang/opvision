(function() {

	Ext.require('CMDBuild.proxy.gis.Gis');

	var GEOSERVER = "GeoServer";

	Ext.define("CMDBuild.controller.management.classes.CMCardBrowserTreeDataSource", {
		GEOSERVER: GEOSERVER,
		constructor: function(navigationPanel, mapState) {
			this.navigationPanel = navigationPanel;
			this.mapState = mapState;
			this.configuration = CMDBuild.configuration.gis.get('cardBrowserByDomainConfiguration'); // TODO: use proxy constants
			this.refresh();
			this.callParent(arguments);
		},

		refresh: function() {
			var me = this;
			me.navigationPanel.setRootNode({
				loading: true,
				text: CMDBuild.Translation.common.loading
			});

			// fill the first level of tree nodes
			// asking the cards according to the
			// root of the configuration
			CMDBuild.proxy.gis.Gis.expandDomainTree({
				loadMask: false,
				success: function successGetCardBasicInfoList(operation, options, response) {
					setChecked(response.root, true);
					me.navigationPanel.setRootNode(response.root);
					me.navigationPanel.loaded();
				}
			});
		}
	});

	function setChecked(root, value) {
		var children = (root) ? root.children || [] : [];
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			setChecked(child, value && ! (child.baseNode === true && i > 0));
		}
		root.checked = value;
	}
})();
(function() {

	/**
	 * Icon proxy
	 * 
	 * FIXME: Waiting for a refactoring on Rest Icons
	 */
	Ext.define('CMDBuild.view.management.classes.map.proxy.Icon', {
		singleton : true,

		readIcon : function(externalGraphic, callback, callbackScope) {
			var http = new XMLHttpRequest();
			http.open('HEAD', externalGraphic, false);
			http.send();
			var me = this;
			if (http.status === 404) {
				var iconSize = [ 0, 0 ];
				callback.apply(callbackScope, [iconSize, null]);
				return;

			}
			var img = new Image;
			img.onload = function() {
				var iconSize = [ this.width, this.height ];
				callback.apply(callbackScope, [iconSize, this]);
			}
			img.src = externalGraphic;
		}

	});

})();

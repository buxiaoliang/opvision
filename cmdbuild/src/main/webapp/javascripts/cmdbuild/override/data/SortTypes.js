(function () {

	/**
	 * Custom SortTypes:
	 * 	- asNatural: do some tricksy things to left-pad numbers with zeros to make them sort in a natural fashion
	 */
	Ext.apply(Ext.data.SortTypes, {
		/**
		 * Pad all the numbers we can find with 10 zeros to the left, then trim down to the last 10 digits. A primitive natural sort occurs
		 * WARN: May do odd things to any numbers longer than 10 digits. It will also not work as you might expect on decimals
		 *
		 * @param {String} str
		 *
		 * @returns {String}
		 *
		 * @web https://spin.atomicobject.com/2012/07/20/simple-natural-sorting-in-extjs/
		 * @author Mitchell Johnson
		 */
		asNatural: function (str) {
			return str.replace(/(\d+)/g, "0000000000$1").replace(/0*(\d{10,})/g, "$1");
		}
	});

})();

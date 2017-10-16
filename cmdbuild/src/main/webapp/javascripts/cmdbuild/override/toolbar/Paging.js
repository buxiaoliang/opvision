(function () {

	Ext.define('CMDBuild.override.toolbar.Paging', {
		override: 'Ext.toolbar.Paging',

		/**
		 * Custom load method implementation 30/06/2016
		 *
		 * @param {Number} pageNum
		 *
		 * @returns {Void}
		 */
		customLoadMethod: function (pageNum) {
			return this.store.loadPage(pageNum);
		},

		/**
		 * Custom load method implementation 30/06/2016
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		doRefresh: function () {
			var current = this.store.currentPage;

			if (this.fireEvent('beforechange', this, current) !== false)
				this.customLoadMethod(current);
		},

		/**
		 * Custom load method implementation 30/06/2016
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		moveFirst: function () {
			if (this.fireEvent('beforechange', this, 1) !== false)
				this.customLoadMethod(1);
		},

		/**
		 * Custom load method implementation 30/06/2016
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		moveLast: function () {
			var last = this.getPageData().pageCount;

			if (this.fireEvent('beforechange', this, last) !== false)
				this.customLoadMethod(last);
		},

		/**
		 * Custom load method implementation 30/06/2016
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		moveNext: function () {
			var total = this.getPageData().pageCount;
			var next = this.store.currentPage + 1;

			if (next <= total)
				if (this.fireEvent('beforechange', this, next) !== false)
					this.customLoadMethod(next);
		},

		/**
		 * Custom load method implementation 30/06/2016
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		movePrevious: function (){
			var prev = this.store.currentPage - 1;

			if (prev > 0)
				if (this.fireEvent('beforechange', this, prev) !== false)
					this.customLoadMethod(prev);
		},

		/**
		 * Custom load method implementation 30/06/2016
		 *
		 * @param {Object} field
		 * @param {Object} e
		 *
		 * @returns {Void}
		 *
		 * @override
		 */
		onPagingKeyDown: function (field, e) {
			var k = e.getKey(),
				pageData = this.getPageData(),
				increment = e.shiftKey ? 10 : 1,
				pageNum;

			if (k == e.RETURN) {
				e.stopEvent();

				pageNum = this.readPageFromInput(pageData);

				if (pageNum !== false) {
					pageNum = Math.min(Math.max(1, pageNum), pageData.pageCount);

					if (this.fireEvent('beforechange', this, pageNum) !== false)
						this.customLoadMethod(pageNum);
				}
			} else if (k == e.HOME || k == e.END) {
				e.stopEvent();

				pageNum = k == e.HOME ? 1 : pageData.pageCount;

				field.setValue(pageNum);
			} else if (k == e.UP || k == e.PAGE_UP || k == e.DOWN || k == e.PAGE_DOWN) {
				e.stopEvent();

				pageNum = this.readPageFromInput(pageData);

				if (pageNum) {
					if (k == e.DOWN || k == e.PAGE_DOWN)
						increment *= -1;

					pageNum += increment;

					if (pageNum >= 1 && pageNum <= pageData.pageCount)
						field.setValue(pageNum);

				}
			}
		}
	});

})();

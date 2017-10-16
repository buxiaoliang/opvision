(function($) {
	var popup = function() {
		this.config = {};

		/**
		 * @param {Object} params
		 * @param {String} params.form
		 * @param {String} params.dialog
		 * @param {String} params.container
		 * @param {String} params.title
		 */
		this.init = function(params) {
			try {
				this.config = params;
				this.show();
			}
			catch (e) {
				$.Cmdbuild.errorsManager.log("$.Cmdbuild.standard.div.init");
				throw e;
			}
		};
		this.show = function() {
			try {
				$.Cmdbuild.eventsManager.deferEvents();
				var theDialog = $("#" + this.config.dialog);
				var xmlForm = $.Cmdbuild.elementsManager.getElement(this.config.form);
				var htmlStr = $.Cmdbuild.elementsManager.insertChildren(xmlForm);
				theDialog.html(htmlStr);
				
				theDialog.dialog( "option", "dialogClass", $.Cmdbuild.global.getThemeCSSClass());

				var w = this.config.width;
				var h = this.config.height;
				theDialog.dialog( "option", "height", h || $.Cmdbuild.global.modalMaxHeight);
				theDialog.dialog( "option", "width", w || $.Cmdbuild.global.modalMaxWidth);
				
				var title = this.config.title;
				var i18nTitle = this.config.i18nTitle;
				if (i18nTitle) {
					title = $.Cmdbuild.translations.getTranslation(i18nTitle, title);
				}
				theDialog.dialog("option", "title", title).dialog("open");

				$.Cmdbuild.elementsManager.initialize();
				$.Cmdbuild.eventsManager.unDeferEvents();
			}
			catch (e) {
				$.Cmdbuild.errorsManager.log("$.Cmdbuild.standard.div.show");
				throw e;
			}
		};
	};

	$.Cmdbuild.standard.popup = popup;

}) (jQuery);
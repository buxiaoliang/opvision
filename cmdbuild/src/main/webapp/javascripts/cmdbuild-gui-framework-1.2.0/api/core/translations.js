(function($) {
	var DEFAULT_LANGUAGE = "en";
	
	var translations = {
		translations : {},
		language : null,

		/**
		 * Load translations
		 * @param {function} callback
		 * @param {Object} callbackScope
		 */
		loadTranslations : function(callback, callbackScope) {
			var me = this;
			// get language
			this.language = $.Cmdbuild.global.getLanguage();
			if (!this.language) {
				$.Cmdbuild.errorsManager.warn("No language selected");
				callback.apply(callbackScope, []);
				return;
			}
			// load config translations
			this.loadCoreTranslations(callback, callbackScope);
		},

		/**
		 * Load core translations
		 * @param {function} callback
		 * @param {Object} callbackScope
		 */
		loadCoreTranslations : function(callback, callbackScope) {
			var me = this;
			var lang = this.language;
			if (! this.language) {
				lang = DEFAULT_LANGUAGE;
			}
			// calculate url
			var url = $.Cmdbuild.global.getAppRootUrl() + "translations/" + lang + ".json";

			$.ajax({
				type : 'GET',
				url : url,
				cache: ! $.Cmdbuild.global.isDebugMode()
			}).done(function(data, state) {
				if (state === "success") {
					me.loadCoreTranslationsCB(data, {
						callback : callback,
						callbackScope : callbackScope
					});
				} else {
					this.loadValidatorsTranslations(callback, callbackScope);
				}
			}).fail(function() {
				this.language = DEFAULT_LANGUAGE;
				me.loadValidatorsTranslations(callback, callbackScope);
				$.Cmdbuild.errorsManager
						.warn("No core translation file found for language "
								+ me.language.toUpperCase());
			});
		},

		/**
		 * Load core translations callback
		 * @param {Object} data
		 * @param {Object} payload
		 * @param {function} payload.callback
		 * @param {Object} payload.callbackScope
		 */
		loadCoreTranslationsCB : function(data, payload) {
			this.translations = data;
			this.loadValidatorsTranslations(payload.callback, payload.callbackScope);
		},

		/**
		 * Load validators translations
		 * @param {function} callback
		 * @param {Object} callbackScope
		 */
		loadValidatorsTranslations : function(callback, callbackScope) {
			var me = this;
			var lang = this.language;
			if (! this.language) {
				lang = "en";
			}

			// compose url
			var url = $.Cmdbuild.global.getAppRootUrl() + "libraries/plugin/validation/src/localization/messages_" + lang + ".js";

			$.ajax({
				type : 'GET',
				url : url,
				cache: ! $.Cmdbuild.global.isDebugMode()
			}).always(function() {
				me.loadConfigTranslations(callback, callbackScope);
			});
		},

		/**
		 * Load core translations callback
		 * @param {Object} data
		 * @param {Object} payload
		 * @param {function} payload.callback
		 * @param {Object} payload.callbackScope
		 */
		loadValidatorsTranslationsCB : function(data, payload) {
			this.translations = data;
			this.loadConfigTranslations(payload.callback, payload.callbackScope);
		},

		/**
		 * Load configuration translations
		 * @param {function} callback
		 * @param {Object} callbackScope
		 */
		loadConfigTranslations : function(callback, callbackScope) {
			var me = this;
			var url = $.Cmdbuild.global.getAppConfigUrl() + "translations/" + this.language + ".xml";

			// check if exists translation
			$.ajax({
				type : 'HEAD',
				url : url
			}).done(function() {
				$.Cmdbuild.utilities.getXmlDoc(url,
						me.loadConfigTranslationsCB, me, {
							callback : callback,
							callbackScope : callbackScope
						});
			}).fail(function() {
				callback.apply(callbackScope, []);
				$.Cmdbuild.errorsManager
						.warn("No config translation file found for language "
								+ me.language.toUpperCase());
			});
		},

		/**
		 * Load config translations callback
		 * @param {Object} data
		 * @param {Object} payload
		 * @param {function} payload.callback
		 * @param {Object} payload.callbackScope
		 */
		loadConfigTranslationsCB : function($xmlDoc, payload) {
			var root = $xmlDoc.documentElement;
			var $root = $(root);
			var me = this;

			$.each($root.children(), function(index, translation) {
				me.translations[translation.tagName] = translation.textContent;
			});

			// callback
			payload.callback.apply(payload.callbackScope, []);
		},

		getTranslations : function() {
			return this.translations;
		},

		getTranslation : function(label, default_value) {
			if (this.getTranslations() && this.getTranslations()[label]) {
				return this.getTranslations()[label];
			}
			// log warning
			var language = $.Cmdbuild.global.getLanguage();
			if (language) {
				$.Cmdbuild.errorsManager.warn("No translation found for label "
						+ label + " into " + language.toUpperCase() + " language file");
			}
			// return default value if set, else label
			return default_value ? default_value : label;
		}
	};

	$.Cmdbuild.translations = translations;
})(jQuery);
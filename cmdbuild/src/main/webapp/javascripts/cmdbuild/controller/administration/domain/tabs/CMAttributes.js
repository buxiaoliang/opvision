(function() {

	/**
	 * This class have some custom code from linked ones
	 *
	 * @link CMDBuild.controller.administration.classes.tabs.CMAttributes
	 * @link CMDBuild.controller.administration.workflow.tabs.CMAttributes
	 */

	Ext.define('CMDBuild.controller.administration.domain.tabs.CMAttributes', {

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Message',
			'CMDBuild.proxy.common.tabs.attribute.Attribute',
			'CMDBuild.proxy.common.tabs.attribute.Order'
		],

		/**
		 * @cfg {CMDBuild.controller.administration.domain.Domain}
		 */
		parentDelegate: undefined,

		/**
		 * @property {Object}
		 */
		currentAttribute: undefined,

		/**
		 * @property {CMDBuild.view.administration.domain.tabs.attributes.CMAttributesForm}
		 */
		form: undefined,

		/**
		 * @property {CMDBuild.view.administration.domain.tabs.attributes.CMAttributeGrid}
		 */
		grid: undefined,

		/**
		 * @property {Ext.selection.RowModel}
		 */
		gridSM: undefined,

		/**
		 * @property {CMDBuild.view.administration.domain.tabs.attributes.CMAttributes}
		 */
		view: undefined,

		/**
		 * @param {Object} configurationObject
		 * @param {CMDBuild.controller.administration.domain.Domain} configurationObject.parentDelegate
		 *
		 * @override
		 */
		constructor: function(configurationObject) {
			Ext.apply(this, configurationObject); // Apply configuration to class

			this.view = Ext.create('CMDBuild.view.administration.domain.tabs.attributes.CMAttributes');

			this.getGrid().on("cm_attribute_moved", this.onAttributeMoved, this);

			// Shorthands
			this.form = this.view.form;
			this.grid = this.view.grid;

			// Handler excanche
			this.form.delegate = this;
			this.grid.delegate = this;

			this.gridSM = this.grid.getSelectionModel();
			this.gridSM.on('selectionchange', this.onSelectionChanged, this);

			this.form.abortButton.on('click', this.onAbortButtonClick, this);
			this.form.saveButton.on('click', this.onSaveButtonClick, this);
			this.form.deleteButton.on('click', this.onDeleteButtonClick, this);
			this.grid.addAttributeButton.on('click', this.onAddAttributeClick, this);
		},

		/**
		 * Fake cmfg implementation waiting for future refactor
		 *
		 * @param {String} name
		 * @param {Object} param
		 * @param {Function} callback
		 *
		 * TODO: waiting for refactor
		 */
		cmfg: function(name, param, callBack) {
			switch (name) {
				case 'onDomainTabAttributesAddButtonClick':
					return this.onDomainTabAttributesAddButtonClick();

				case 'onDomainDomainSelected':
					return this.onDomainDomainSelected();

				default: {
					if (!Ext.isEmpty(this.parentDelegate) && Ext.isFunction(this.parentDelegate.cmfg))
						return this.parentDelegate.cmfg(name, param, callBack);
				}
			}
		},

		/**
		 * Cache synch
		 *
		 * @param {Array} savedAttributes
		 */
		anAttributeWasMoved: function(savedAttributes) {
			if (!this.cmfg('domainSelectedDomainIsEmpty') && !Ext.isEmpty(savedAttributes)) {
				var oldAttributes = this.cmfg('domainSelectedDomainGet', CMDBuild.core.constants.Proxy.ATTRIBUTES);

				for (var i = 0; i < savedAttributes.length; ++i) {
					var newAttr = savedAttributes[i];

					for (var j = 0; j < oldAttributes.length; ++j) {
						var oldAttr = oldAttributes[j];

						if (oldAttr[CMDBuild.core.constants.Proxy.NAME] == newAttr[CMDBuild.core.constants.Proxy.NAME]) {
							oldAttr[CMDBuild.core.constants.Proxy.INDEX] = newAttr[CMDBuild.core.constants.Proxy.INDEX];

							break;
						}
					}
				}
			}
		},

		deleteAttribute: function() {
			if (!this.cmfg('domainSelectedDomainIsEmpty') && !Ext.isEmpty(this.currentAttribute)) {
				CMDBuild.proxy.common.tabs.attribute.Attribute.remove({
					params: {
						className: this.cmfg('domainSelectedDomainGet', CMDBuild.core.constants.Proxy.NAME),
						name: this.currentAttribute.get(CMDBuild.core.constants.Proxy.NAME)
					},
					scope: this,
					success: function(result, options, decodedResult) {
						CMDBuild.proxy.administration.domain.Domain.read({
							scope: this,
							success: function (response, options, decodedResponse) {
								decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.DOMAINS];

								if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
									var selectedDomain = Ext.Array.findBy(decodedResponse, function (domainObject, i) {
										return this.cmfg('domainSelectedDomainGet', CMDBuild.core.constants.Proxy.ID) == domainObject[CMDBuild.core.constants.Proxy.ID_DOMAIN];
									}, this);

									if (Ext.isObject(selectedDomain) && !Ext.Object.isEmpty(selectedDomain)) {
										this.parentDelegate.domainSelectedDomainSet({
											propertyName: CMDBuild.core.constants.Proxy.ATTRIBUTES,
											value: selectedDomain[CMDBuild.core.constants.Proxy.ATTRIBUTES]
										});

										this.currentAttribute = null;
										this.form.reset();
										this.form.disableModify();

										this.grid.refreshStore();
									} else {
										_error('deleteAttribute(): domain not found', this, this.cmfg('domainSelectedDomainGet', ID));
									}
								}
							}
						});
					}
				});
			}
		},

		/**
		 * @override
		 */
		getGrid: function() {
			return this.view.grid;
		},

		/**
		 * @returns {CMDBuild.view.administration.domain.tabs.attributes.CMAttributes}
		 */
		getView: function() {
			return this.view;
		},

		/**
		 * @override
		 */
		getCurrentEntryTypeId: function() {
			return this.cmfg('domainSelectedDomainGet', CMDBuild.core.constants.Proxy.ID);
		},

		onAbortButtonClick: function() {
			if (Ext.isEmpty(this.currentAttribute)) {
				this.form.disableModify();
				this.form.reset();
			} else {
				this.form.onAttributeSelected(this.currentAttribute);
			}
		},

		onAddAttributeClick: function() {
			this.currentAttribute = null;
			this.view.onAddAttributeClick();
		},

		/**
		 * @override
		 */
		onAttributeMoved: function() {
			var me = this;
			var attributes = [];
			var store = this.grid.getStore();

			for (var i = 0; i < store.getCount(); i++) {
				var rec = store.getAt(i);

				var attribute = {};
				attribute[CMDBuild.core.constants.Proxy.NAME] = rec.get(CMDBuild.core.constants.Proxy.NAME);
				attribute[CMDBuild.core.constants.Proxy.INDEX] = i + 1;

				attributes.push(attribute);
			}

			var params = {};
			params[CMDBuild.core.constants.Proxy.ATTRIBUTES] = Ext.JSON.encode(attributes);
			params[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('domainSelectedDomainGet', CMDBuild.core.constants.Proxy.NAME);

			CMDBuild.proxy.common.tabs.attribute.Order.reorder({
				params: params,
				scope: this,
				success: function (response, options, decodedResponse) {
					this.anAttributeWasMoved(attributes);
				}
			});
		},

		onDeleteButtonClick: function() {
			Ext.Msg.show({
				title: CMDBuild.Translation.administration.modClass.attributeProperties.delete_attribute,
				msg: CMDBuild.Translation.common.confirmpopup.areyousure,
				buttons: Ext.Msg.YESNO,
				scope: this,

				fn: function(buttonId, text, opt) {
					if (buttonId == 'yes') {
						this.deleteAttribute();
					}
				}
			});
		},

		onDomainTabAttributesAddButtonClick: function() {
			this.view.disable();
		},

		onDomainDomainSelected: function() {
			this.view.setDisabled(this.cmfg('domainSelectedDomainIsEmpty'));

			if (!this.cmfg('domainSelectedDomainIsEmpty')) {
				this.form.domainName = this.cmfg('domainSelectedDomainGet', CMDBuild.core.constants.Proxy.NAME);
				this.form.hideContextualFields();

				this.grid.refreshStore(this.cmfg('domainSelectedDomainGet'));
			}
		},

		onSaveButtonClick: function() {
			var nonValid = this.form.getNonValidFields();

			if (nonValid.length > 0) {
				CMDBuild.core.Message.error(CMDBuild.Translation.common.failure, CMDBuild.Translation.errors.invalid_fields, false);

				return;
			}

			var data = this.form.getData(true);
			data[CMDBuild.core.constants.Proxy.CLASS_NAME] = this.cmfg('domainSelectedDomainGet', CMDBuild.core.constants.Proxy.NAME);

			CMDBuild.proxy.common.tabs.attribute.Attribute.update({
				params: data,
				scope: this,
				success: function(result, options, decodedResult) {
					var attribute = decodedResult['attribute'];

					CMDBuild.proxy.administration.domain.Domain.read({
						scope: this,
						success: function (response, options, decodedResponse) {
							decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.DOMAINS];

							if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
								var selectedDomain = Ext.Array.findBy(decodedResponse, function (domainObject, i) {
									return this.cmfg('domainSelectedDomainGet', CMDBuild.core.constants.Proxy.ID) == domainObject[CMDBuild.core.constants.Proxy.ID_DOMAIN];
								}, this);

								if (Ext.isObject(selectedDomain) && !Ext.Object.isEmpty(selectedDomain)) {
									this.parentDelegate.domainSelectedDomainSet({
										propertyName: CMDBuild.core.constants.Proxy.ATTRIBUTES,
										value: selectedDomain[CMDBuild.core.constants.Proxy.ATTRIBUTES]
									});

									this.currentAttribute = null;
									this.form.disableModify();

									this.grid.refreshStore(attribute[CMDBuild.core.constants.Proxy.INDEX]);

//									this.grid.selectAttributeByName(attribute[CMDBuild.core.constants.Proxy.NAME]);

									CMDBuild.view.common.field.translatable.Utils.commit(this.form);
								} else {
									_error('onSaveButtonClick(): domain not found', this, this.cmfg('domainSelectedDomainGet', ID));
								}
							}
						}
					});
				}
			});
		},

		/**
		 * @param {Ext.selection.RowModel} selection
		 */
		onSelectionChanged: function(selection) {
			if (selection.selected.length > 0) {
				this.currentAttribute = selection.selected.items[0];
				this.form.onAttributeSelected(this.currentAttribute);
			}
		}
	});

})();
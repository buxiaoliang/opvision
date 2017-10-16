(function () {

	/**
	 * FIXME: waiting for complete class refactor to avoid presence of computation code inside this class
	 */
	Ext.define('CMDBuild.core.buttons.iconized.add.Relation', {
		extend: 'Ext.button.Split',

		requires: [
			'CMDBuild.core.constants.Proxy',
			'CMDBuild.core.Utils',
			'CMDBuild.proxy.core.buttons.iconized.add.Relation'
		],

		/**
		 * @property {Object}
		 *
		 * @private
		 */
		bufferEntryTypes: {},

		iconCls: 'add',
		text: CMDBuild.Translation.addRelations,

		/**
		 * @returns {Void}
		 *
		 * @override
		 */
		initComponent: function () {
			Ext.apply(this, {
				scope: this,
				menu: Ext.create('Ext.menu.Menu'),

				handler: function (button, e) {
					this.showMenu();
				}
			});

			this.callParent(arguments);
		},

		// BufferEntryTypes property methods
			/**
			 * @param {String} name
			 * @param {String} propertyName
			 *
			 * @returns {CMDBuild.model.core.buttons.iconized.add.relation.EntryType or mixed}
			 *
			 * @private
			 */
			bufferEntryTypesGet: function (name, propertyName) {
				if (Ext.isString(name) && !Ext.isEmpty(name)) {
					if (
						Ext.isString(propertyName) && !Ext.isEmpty(propertyName)
						&& Ext.isObject(this.bufferEntryTypes[name]) && !Ext.Object.isEmpty(this.bufferEntryTypes[name])
					) {
						return this.bufferEntryTypes[name].get(propertyName);
					}

					return this.bufferEntryTypes[name];
				} else {
					_error('bufferEntryTypesGet(): unmanaged name parameter', this, name);
				}
			},

			/**
			 * @param {Function} callback
			 *
			 * @returns {Void}
			 *
			 * @private
			 */
			bufferEntryTypesSet: function (callback) {
				// Error handling
					if (!Ext.isFunction(callback))
						return _error('bufferEntryTypesSet(): unmanaged callback parameter', this, callback);
				// END: Error handling

				var params = {};
				params[CMDBuild.core.constants.Proxy.ACTIVE] = true;

				CMDBuild.proxy.core.buttons.iconized.add.Relation.readAllEntryTypes({
					params: params,
					scope: this,
					success: function (response, options, decodedResponse) {
						decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.CLASSES];

						if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse)) {
							Ext.Array.each(decodedResponse, function (entryTypeObject, i, allEntryTypeObjects) {
								if (Ext.isObject(entryTypeObject) && !Ext.Object.isEmpty(entryTypeObject))
									this.bufferEntryTypes[entryTypeObject[CMDBuild.core.constants.Proxy.NAME]] = Ext.create('CMDBuild.model.core.buttons.iconized.add.relation.EntryType', entryTypeObject);
							}, this);

							Ext.callback(callback, this);
						} else {
							_error('bufferEntryTypesSet(): unmanaged response', this, decodedResponse);
						}
					}
				});
			},

		/**
		 * @param {String} name
		 *
		 * @returns {Void}
		 *
		 * TODO: waiting for refactor (relations tab)
		 */
		onEntryTypeSelect: function (name) {
			if (Ext.isString(name) && !Ext.isEmpty(name)) {
				this.bufferEntryTypesSet(function (options, success, response) {
					var domainsDestination = [],
						domainsSource = [],
						menuItems = [];

					this.disable();
					this.menu.removeAll();

					var params = {};
					params[CMDBuild.core.constants.Proxy.ACTIVE_ONLY] = true;
					params[CMDBuild.core.constants.Proxy.EXCLUDE_PROCESSES] = true;
					params[CMDBuild.core.constants.Proxy.SOURCE] = name;

					CMDBuild.proxy.core.buttons.iconized.add.Relation.getDomains({
						params: params,
						scope: this,
						success: function (response, options, decodedResponse) {
							decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.DOMAINS];

							if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse))
								Ext.Array.each(decodedResponse, function (domainObject, i, allDomainObjects) {
									// FIXME: here should be cheked privileges (waiting for refactor rename)
									if (Ext.isObject(domainObject) && !Ext.Object.isEmpty(domainObject))
										domainsSource.push(Ext.create('CMDBuild.model.core.buttons.iconized.add.relation.Domain', domainObject));
								}, this);

							var params = {};
							params[CMDBuild.core.constants.Proxy.ACTIVE_ONLY] = true;
							params[CMDBuild.core.constants.Proxy.DESTINATION] = name;
							params[CMDBuild.core.constants.Proxy.EXCLUDE_PROCESSES] = true;

							CMDBuild.proxy.core.buttons.iconized.add.Relation.getDomains({
								params: params,
								scope: this,
								success: function (response, options, decodedResponse) {
									decodedResponse = decodedResponse[CMDBuild.core.constants.Proxy.DOMAINS];

									if (Ext.isArray(decodedResponse) && !Ext.isEmpty(decodedResponse))
										Ext.Array.each(decodedResponse, function (domainObject, i, allDomainObjects) {
											// FIXME: here should be cheked privileges (waiting for refactor rename)
											if (Ext.isObject(domainObject) && !Ext.Object.isEmpty(domainObject))
												domainsDestination.push(Ext.create('CMDBuild.model.core.buttons.iconized.add.relation.Domain', domainObject));
										}, this);

									if (!Ext.isEmpty(domainsSource) || !Ext.isEmpty(domainsDestination)) {
										this.enable();

										// Domains where entryType is source manage
										if (Ext.isArray(domainsSource) && !Ext.isEmpty(domainsSource))
											Ext.Array.each(domainsSource, function (domainModel, i, allDomainModels) {
												// Add menu item only if i have create privileges
												// FIXME: here should be cheked privileges (waiting for refactor rename)
												if (domainModel.get([CMDBuild.core.constants.Proxy.PRIVILEGES, CMDBuild.core.constants.Proxy.CREATE]))
													menuItems.push({
														text: domainModel.get(CMDBuild.core.constants.Proxy.DIRECT_DESCRIPTION)
															+ ' (' + this.bufferEntryTypesGet(
																domainModel.get(CMDBuild.core.constants.Proxy.DESTINATION_CLASS_NAME),
																CMDBuild.core.constants.Proxy.DESCRIPTION
															) + ')',
														domain: { // FIXME: use domain real object in future
															dom_id: domainModel.get(CMDBuild.core.constants.Proxy.ID),
															description: domainModel.get(CMDBuild.core.constants.Proxy.DIRECT_DESCRIPTION)
																+ ' (' + this.bufferEntryTypesGet(
																	domainModel.get(CMDBuild.core.constants.Proxy.DESTINATION_CLASS_NAME),
																	CMDBuild.core.constants.Proxy.DESCRIPTION
																) + ')',
															dst_cid: domainModel.get(CMDBuild.core.constants.Proxy.DESTINATION_CLASS_ID),
															src_cid: domainModel.get(CMDBuild.core.constants.Proxy.ORIGIN_CLASS_ID),
															src: '_1'
														},
														scope: this,

														handler: function (item, e){
															this.fireEvent('cmClick', item.domain);
														}
													});
											}, this);

										// Domains where entryType is destination manage
										if (Ext.isArray(domainsDestination) && !Ext.isEmpty(domainsDestination))
											Ext.Array.each(domainsDestination, function (domainModel, i, allDomainModels) {
												// Add menu item only if i have create privileges
												// FIXME: here should be cheked privileges (waiting for refactor rename)
												if (domainModel.get([CMDBuild.core.constants.Proxy.PRIVILEGES, CMDBuild.core.constants.Proxy.CREATE]))
													menuItems.push({
														text: domainModel.get(CMDBuild.core.constants.Proxy.INVERSE_DESCRIPTION)
															+ ' (' + this.bufferEntryTypesGet(
																domainModel.get(CMDBuild.core.constants.Proxy.ORIGIN_CLASS_NAME),
																CMDBuild.core.constants.Proxy.DESCRIPTION
															) + ')',
														domain: { // FIXME: use domain real object in future
															dom_id: domainModel.get(CMDBuild.core.constants.Proxy.ID),
															description: domainModel.get(CMDBuild.core.constants.Proxy.INVERSE_DESCRIPTION)
																+ ' (' + this.bufferEntryTypesGet(
																	domainModel.get(CMDBuild.core.constants.Proxy.ORIGIN_CLASS_NAME),
																	CMDBuild.core.constants.Proxy.DESCRIPTION
																) + ')',
															dst_cid: domainModel.get(CMDBuild.core.constants.Proxy.ORIGIN_CLASS_ID),
															src_cid: domainModel.get(CMDBuild.core.constants.Proxy.DESTINATION_CLASS_ID),
															src: '_2'
														},
														scope: this,

														handler: function (item, e){
															this.fireEvent('cmClick', item.domain);
														}
													});
											}, this);

										if (!Ext.isEmpty(menuItems))
											this.menu.add(CMDBuild.core.Utils.objectArraySort(menuItems, CMDBuild.core.constants.Proxy.TEXT)); // Ascending items sort
									}
								}
							});
						}
					});
				});
			} else {
				_error('onEntryTypeSelect(): unmanaged name parameter', this, name);
			}
		}
	});

})();

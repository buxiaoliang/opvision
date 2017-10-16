(function () {

	/**
	 * External service functions for field manager
	 */
	Ext.define('CMDBuild.core.fieldManager.ExternalServices', {

		/**
		 * Filters empty components
		 *
		 * @param {Object} target
		 * @param {Mixed or Array} components
		 *
		 * @returns {Void}
		 */
		add: function (target, components) {
			components = Ext.isArray(components) ? components : [components];

			if (
				Ext.isObject(target)
				&& Ext.isFunction(target.add)
			) {
				components = Ext.Array.filter(components, function (item, i, array) { // Check items validity
					return this.isItemValid(item);
				}, this);

				if (!Ext.isEmpty(components))
					target.add(components);
			} else {
				_error('add(): target not supported object', this, target);
			}
		},

		/**
		 * Filters empty elements
		 *
		 * @param {Array} target
		 * @param {Mixed or Array} elements
		 *
		 * @returns {Void}
		 */
		push: function (target, elements) {
			elements = Ext.isArray(elements) ? elements : [elements];

			if (Ext.isArray(target)) {
				elements = Ext.Array.filter(elements, function (item, i, array) { // Check items validity
					return this.isItemValid(item);
				}, this);

				if (!Ext.isEmpty(elements))
					target = Ext.Array.push(target, elements);
			} else {
				_error('push(): target in not array', this, target);
			}
		},

		/**
		 * @param {Array} attributes - FieldManager compatible attribute models
		 * @param {Array} filteredNames
		 *
		 * @returns {Object} groups
		 */
		groupAttributesModels: function (attributes, filteredNames) {
			filteredNames = Ext.isArray(filteredNames) ? Ext.Array.clean(filteredNames) : [];
			filteredNames.push('Notes');

			// Error handling
				if (!Ext.isArray(attributes))
					return _error('groupAttributesModels(): unmanaged attributes parameter', this, attributes);
			// END: Error handling

			var groups = {},
				withoutGroup = [];

			Ext.Array.forEach(attributes, function (attribute, i, allAttributes) {
				if (
					Ext.isObject(attribute) && !Ext.Object.isEmpty(attribute) && attribute.isFieldManagerCompatible
					&& !Ext.Array.contains(filteredNames, attribute.get(CMDBuild.core.constants.Proxy.NAME))
				) {
					var attributeGroup = attribute.get(CMDBuild.core.constants.Proxy.GROUP);

					if (Ext.isEmpty(attributeGroup)) {
						withoutGroup.push(attribute);
					} else {
						if (!Ext.isDefined(groups[attributeGroup]))
							groups[attributeGroup] = [];

						groups[attributeGroup].push(attribute);
					}
				}
			}, this);

			if (!Ext.isEmpty(withoutGroup))
				groups[CMDBuild.Translation.other] = withoutGroup;

			return groups;
		},

		/**
		 * Validate item verifying dataIndex property that filters also hidden columns
		 *
		 * @param {Object} item
		 *
		 * @returns {Boolean}
		 *
		 * @private
		 */
		isItemValid: function (item) {
			return (
				Ext.isObject(item) && !Ext.Object.isEmpty(item)
				&& (
					(Ext.isString(item.dataIndex) && !Ext.isEmpty(item.dataIndex)) // Columns validation
					|| (Ext.isString(item.name) && !Ext.isEmpty(item.name)) // Store fields/Fields validation
				)
			);
		}
	});

})();

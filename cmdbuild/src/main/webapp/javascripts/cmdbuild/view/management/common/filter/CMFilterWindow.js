(function() {

	/**
	 * @deprecated new class (CMDBuild.view.common.field.filter.advanced.Advanced)
	 */

	var titleTemplate = '{0} - {1} - {2}';

	Ext.define('CMDBuild.view.management.common.filter.CMFilterWindow', {
		extend: 'CMDBuild.core.window.AbstractModal',

		mixins: {
			delegable: 'CMDBuild.core.CMDelegable'
		},

		buttonAlign: 'center',
		layout: 'accordion',

		// Configuration
			attributes: {},
			className: '',
			filter: undefined,

			/**
			 * In some subclass the relations panel is used in a tab panel, so the event to listen for detect the first time that is shown
			 * is different (activate)
			 */
			firstShowDetectEvent: 'expand',

			/**
			 * To enable/disable tabs visualization
			 */
			filterTabToEnable: {
				attributeTab: true,
				relationTab: true,
				functionTab: true
			},
		// END: Configuration

		constructor: function() {
			this.mixins.delegable.constructor.call(this, 'CMDBuild.view.management.common.filter.CMFilterWindowDelegate');


			Ext.apply(this, {
				items: []
			});
			this.callParent(arguments);
		},

		initComponent : function() {
			var me = this;

			this.setWindowTitle();
			this.buildItems();
			this.buildButtons();

			this.callParent(arguments);

			this.mon(this, 'show', me.onFirstShow, this, { single: true });
		},

		getFilter: function() {
			if (theFilterIsDirty(this)) {
				this.filter.setDirty();
				this.filter.setLocal(true);
				this.filter.setAttributeConfiguration(this.filterAttributesPanel.getData());

				if (!this.filterRelationNeverExpansed) // The panel was expanded at least once
					this.filter.setRelationConfiguration(this.filterRelationsPanel.getData());

				this.filter.setFunctionConfiguration(this.filterFunctionsPanel.getData());
			}

			return this.filter;
		},

		/**
		 * @protected
		 */
		onFirstShow: function() {
			this.filterAttributesPanel.setData(this.filter.getAttributeConfiguration());

			// Defer the setting of relations data to the moment in which the panel is expanded
			// If never expanded take the data from the filter
			this.filterRelationNeverExpansed = true;

			this.mon(this.filterRelationsPanel, this.firstShowDetectEvent, function() {
				this.filterRelationsPanel.setData(this.filter.getRelationConfiguration());
				this.filterRelationNeverExpansed = false;
			}, this, { single: true });

			this.filterFunctionsPanel.setData(this.filter.getFunctionConfiguration());
		},

		/**
		 * @protected
		 */
		setWindowTitle: function() {
			var prefix = CMDBuild.Translation.searchFilter;
			var et = _CMCache.getEntryTypeByName(this.className);

			this.title = Ext.String.format(titleTemplate, prefix, this.filter.getName(), et.getDescription());
		},

		/**
		 * @protected
		 */
		buildButtons: function() {
			var me = this;

			this.buttons = [
				{
					text: CMDBuild.Translation.apply,
					handler: function() {
						me.callDelegates('onCMFilterWindowApplyButtonClick', [me, me.getFilter()]);
					}
				},
				{
					text: CMDBuild.Translation.saveAndApply,
					handler: function() {
						me.callDelegates('onCMFilterWindowSaveAndApplyButtonClick', [me, me.getFilter()]);
					}
				},
				{
					text: CMDBuild.Translation.cancel,
					handler: function() {
						me.callDelegates('onCMFilterWindowAbortButtonClick', [me]);
					}
				}
			];
		},

		buildFilterAttributePanel: function() {
			return Ext.create('CMDBuild.view.management.common.filter.CMFilterAttributes', {
				attributes: this.attributes,
				className: this.className
			});
		},

		/**
		 * @protected
		 */
		buildItems: function() {
			this.filterAttributesPanel = this.buildFilterAttributePanel();
			this.filterRelationsPanel = Ext.create('CMDBuild.view.management.common.filter.CMRelations', {
				attributes: this.attributes,
				className: this.className
			});
			this.filterFunctionsPanel = Ext.create('CMDBuild.view.management.common.filter.CMFunctions', {
				attributes: this.attributes,
				className: this.className
			});

			// Filter tabs
			if (this.filterTabToEnable.attributeTab)
				this.items.push(this.filterAttributesPanel);

			if (this.filterTabToEnable.relationTab)
				this.items.push(this.filterRelationsPanel);

			if (this.filterTabToEnable.functionTab)
				this.items.push(this.filterFunctionsPanel);
		}
	});

	function theFilterIsDirty(me) {
		var currentFilter = Ext.create('CMDBuild.model.CMFilterModel');

		currentFilter.setAttributeConfiguration(me.filterAttributesPanel.getData());

		if (me.filterRelationNeverExpansed) {
			currentFilter.setRelationConfiguration(me.filter.getRelationConfiguration());
		} else {
			currentFilter.setRelationConfiguration(me.filterRelationsPanel.getData());
		}

		currentFilter.setFunctionConfiguration(me.filterFunctionsPanel.getData());

		// The string are not equals because serialize the fields of the object not in the same
		// order TODO: impement a comparator of the configuration something like
		// filter.isEquivalent(configuration);
		// return Ext.encode(me.filter.getConfiguration()) != Ext.encode(currentFilter.getConfiguration());
		return true;
	}


})();
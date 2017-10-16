(function($) {

	var LI_ATTR_NODEID = "nodeid";
	var LI_ATTR_LOADED = "loaded";

	var ACTION_SPEED = 500;

	var navigationtree = function() {
		this.config = null;
		this.id = null;
		this.backend = null;

		/**
		 * Initialize Navigation Tree
		 * 
		 * @param {Object} params
		 * @param {String} params.form
		 * @param {String} params.container
		 * @param {String} params.widgetId
		 * @param {String} params.instanceForm
		 */
		this.init = function(params) {
			this.config = params;
			this.config.backend = "NavigationTreeWidget";
			this.id = params.form;
			var backendFn = $.Cmdbuild.utilities.getBackend(this.config.backend);
			this.backend = new backendFn(this.config, this.show, this);
		};

		/**
		 * Show Navigation Tree
		 */
		this.show = function() {
			var me = this;

			// empty container
			var $container = $("#" + this.config.container);
			$container.empty();

			// create form 
			var $form = $("<div></div>").attr("id", this.id);
			$form.appendTo($container);

			$navTreeContainer = $("<div></div>").addClass("collapsibleNavigation").addClass("ui-state-default");
			$navTreeContainer.appendTo($form);

			var rootNode = this.getBackend().getRootNode();
			this.getBackend().getNodeItems(rootNode, null, function(data, metadata) {
				var $rootNavItem = me.createNavigationItems ($navTreeContainer, data, rootNode, true);

				// create next level items
				me.createNextLevelItems($rootNavItem);
			}, this);
		};

		/**
		 * Create next navigation level items
		 * 
		 * @param {jQuery} $navItem
		 */
		this.createNextLevelItems = function($navItem) {
			var me = this;
			$.each($navItem.children("li"), function(index, li) {
				var $li = $(li);
				// if children are not loaded
				if ($li.attr(LI_ATTR_LOADED) === "0") {
					var $input = $li.children("input:checkbox");
					var parentId = $input.val();
					// get child nodes
					var nodes = me.getBackend().getChildrenNodes($li.attr(LI_ATTR_NODEID));
					$.each(nodes, function (nindex, node) {
						// load items for node
						me.getBackend().getNodeItems(node, parentId, function(data, metadata) {
							if (data.length) {
								me.createNavigationItems ($li, data, node, false);
							}

							// initialize menu tree
							if (nodes.length === nindex + 1) {
								me.initializeNavTreeLevel($li);
							}
						}, me);
					});

					// add normal bullet if there are no nodes
					if (! nodes.length) {
						addNormalBullet($li);
					}

					// set li attribute loaded
					$li.attr(LI_ATTR_LOADED, "1");
				}
			});
		};

		/**
		 * Initialize NavTree node
		 * 
		 * @param {DOM} $node
		 */
		this.initializeNavTreeLevel = function($node) {
			var me = this;
			// check if node has children
			if ($node.children("ul").length) {
				var $ul = $($node.children("ul"));
				// add navigation icon
				var $span = addNavigationBullet($node);
				$node.addClass('nodewithchildren');
				// add click event listener
				$span.click(function(e) {
					e.preventDefault();
					// show/hide and toggle class
					$ul.slideToggle(ACTION_SPEED);
					setTimeout(function() {
						$node.toggleClass('active');
					}, ACTION_SPEED);
					// load children
					me.createNextLevelItems($ul);
				});
			} else {
				// add bull
				addNormalBullet($node);
			}
			$node.prepend($span);
		};

		/**
		 * Create navigation items
		 * 
		 * @param {DOM} $parent
		 * @param {Array} items
		 */
		 this.createNavigationItems = function($parent, items, node, show) {
			var me = this;
			var $ul = $("<ul></ul>").addClass("cmdbuild_navigation");
			$parent.append($ul);
			$.each(items, function(index, item) {
				var $li = $("<li></li>").attr(LI_ATTR_NODEID, node._id).attr(
						LI_ATTR_LOADED, "0").appendTo($ul);

				var $label = $("<label></label>").appendTo($li);

				var $input = $("<input></input>").attr("type", "checkbox").val(item._id).change(function() {
					// check or uncheck all items with same value
					var searchquery = "#" + me.id + " input[value=" + item._id + "]";
					if (this.checked) {
						$(searchquery).prop("checked", true);
					} else {
						$(searchquery).prop("checked", false);
					}

					// add or remove selected item
					me.getBackend().addRemoveSelection(item._id, item._type);
				});
				// check input if item is selected
				if (me.getBackend().isSelected(item._id)) {
					$input.prop("checked", true);
				}
				$input.appendTo($label);

				// icon
				var $icon = $("<span></span>").addClass("navItemIcon")
						.addClass("ui-icon").appendTo($label);

				// relation description
				var $em = $("<em></em>");
				if (node.domain) {
					if (node.target.name === node.domain.source) {
						$em.text(node.domain.descriptionInverse);
					} else {
						$em.text(node.domain.descriptionDirect);
					}
				}
				$em.appendTo($label);

				// description
				var text = "";
				if (item.Code) {
					text += " [" + item.Code + "] ";
				}
				text += item.Description;
				var $span = $("<span></span>").text(text).appendTo($label);
			});
			return $ul;
		};

		/*
		 * Getters and Setters
		 */
		/**
		 * Get the backend object used for this form
		 * @return {Object} The backend object
		 */
		this.getBackend = function() {
			return this.backend;
		};

	};

	/**
	 * Add Navigation bullet 
	 * 
	 * @param (DOM) $node
	 * @return {DOM} Navigation bullet item
	 */
	function addNavigationBullet($node) {
		var $span = $("<span></span>").addClass("ui-icon").addClass("navTreeIcon");
		$node.prepend($span);
		return $span;
	}

	/**
	 * Add Normal bullet 
	 * 
	 * @param (DOM) $node
	 * @return {DOM} Normal bullet item
	 */
	function addNormalBullet($node) {
		var $span = $("<span></span>").addClass("ui-icon").addClass("navTreeIcon");
		$node.prepend($span);
		return $span;
	}

	$.Cmdbuild.standard.navigationtree = navigationtree;
})(jQuery);
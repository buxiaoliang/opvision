(function() {
	Ext.define('CMDBuild.view.management.classes.map.navigationTree.AbstractTree', {
		requires : [ 'CMDBuild.view.management.classes.map.proxy.NavigationTree' ],
		root : undefined,
		setInteractionDocument : function(interactionDocument) {
			this.interactionDocument = interactionDocument;
		},
		load : function(callback, callbackScope) {
			var me = this;
			CMDBuild.view.management.classes.map.proxy.NavigationTree.read({
				params : {},
				success : function(response) {
					var data = Ext.JSON.decode(response.responseText);
					me.root = data.root;
					callback.apply(callbackScope, []);
				}
			});
		},
		classControlledByNavigationRecursive : function(className, node) {
			if (this.interactionDocument.sameClass(className, node.targetClassName)) {
				return true;
			}
			for (var i = 0; i < node.childNodes.length; i++) {
				var child = node.childNodes[i];
				if (this.classControlledByNavigationRecursive(className, child)) {
					return true;
				}
			}
			return false;
		},
		classControlledByNavigation : function(className) {
			return this.classControlledByNavigationRecursive(className, this.root);
		},
		getRootNode : function() {
			return this.root;
		},
		getNavigationNode : function(navNode, className) {
			for (var i = 0; i < navNode.childNodes.length; i++) {
				var navClassName = navNode.childNodes[i].targetClassName;
				if (this.interactionDocument.sameClass(navClassName, className)) {
					return navNode.childNodes[i];
				} else {
					var deep = this.getNavigationNode(navNode.childNodes[i], className);
					if (deep) {
						return deep;
					}
				}
			}
			return null;
		},
		allDomainsOnClass : function(parentClassName, navNode, className, domains) {
			var navClassName = navNode.targetClassName;
			if (this.interactionDocument.sameClass(navClassName, className)) {
				navNode.leaf = (navNode.childNodes.length === 0) ? true : false;
				domains.push({
					domain : navNode,
					parentClassName : parentClassName
				});
			}
			for (var i = 0; i < navNode.childNodes.length; i++) {
				var child = navNode.childNodes[i];
				this.allDomainsOnClass(navClassName, child, className, domains);
			}
		},
		allDomainsFromTop : function(navNode, className, domains) {
			var navClassName = navNode.targetClassName;
			if (this.interactionDocument.sameClass(navClassName, className)) {
				for (var i = 0; i < navNode.childNodes.length; i++) {
					var child = navNode.childNodes[i];
					child.leaf = (child.childNodes.length === 0) ? true : false;
					domains.push(child);
				}
			}
			for (var i = 0; i < navNode.childNodes.length; i++) {
				var child = navNode.childNodes[i];
				this.allDomainsFromTop(child, className, domains);
			}
		},
		getDomainsFromTop : function(className) {
			var domains = [];
			this.allDomainsFromTop(this.root, className, domains);
			return domains;
		},
		superClassOnDomains : function(navNode, className, classes) {
			var navClassName = navNode.targetClassName;
			if (this.interactionDocument.sameClass(navClassName, className)) {
				classes.push(navClassName);
			}
			for (var i = 0; i < navNode.childNodes.length; i++) {
				var child = navNode.childNodes[i];
				this.superClassOnDomains(child, className, classes);
			}
		},
		getSuperClassOnDomains : function(className) {
			var classes = [];
			this.superClassOnDomains(this.root, className, classes);
			return classes;
		},
		analyzeDomain : function(domain, returnedDomains, callback, callbackScope) {
				returnedDomains.push(domain);				
				callback.apply(callbackScope, []);
		},
		analyzeDomains : function(domains, index, returnedDomains, callback, callbackScope) {
			if (index >= domains.length) {
				callback.apply(callbackScope, [ returnedDomains ]);
				return;
			}
			var domain = domains[index];
			index++;
			this.analyzeDomain(domain, returnedDomains, function() {
				this.analyzeDomains(domains, index, returnedDomains, callback, callbackScope);
			}, this);
		},
		getDomains4Class : function(className, callback, callbackScope) {
			var domains = [];
			this.allDomainsOnClass("", this.root, className, domains);
			if (domains.length > 1) {
				var returnedDomains = [ ];
				this.analyzeDomains(domains, 0, returnedDomains, function(returnedDomains) {
					callback.apply(callbackScope, [ returnedDomains ]);

				});
			} else {
				callback.apply(callbackScope, [ domains ]);
			}

		}
	});
	function getGisNavigationTree() {
		return CMDBuild.proxy.index.Json.gis.getGISTreeNavigation + '?'
				+ CMDBuild.core.constants.Proxy.AUTHORIZATION_HEADER_KEY + '='
				+ Ext.util.Cookies.get(CMDBuild.core.constants.Proxy.AUTHORIZATION_HEADER_KEY);
	}
	function getCardAttributes(card) {
		var vars = {};
		for ( var key in card) {
			vars[key] = card[key];
		}
		return vars;
	}
	function getStringFromArray(values) {
		var str = "";
		for (var key in values) {
			str += "[" + key + "]";
		}
		return str;
	}
})();

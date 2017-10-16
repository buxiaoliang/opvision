(function() {
	Ext.define('CMDBuild.view.management.classes.map.geoextension.CacheClasses', {
		classes : {},
		idIndex : {},
		initialized : false,
		init : function() {
			var classes = _CMCache.getClasses();
			for (key in classes) {
				var type = classes[key];
				this.push(type);
			}
			this.initialized = true;
		},
		push : function(type) {
			var id = type.get("id");
			var name = type.get("name");
			this.classes[name] = type;
			this.idIndex[id] = type;
		},
		superClasses: function(className) {
			var	classes = {};
			while (true) {
				var type = this.getEntryTypeByName(className);
				classes[className] = true;
				var parentId = type.get("parent");
				if (! parentId) {
					break;
				}
				var parentType = this.getEntryTypeById(parentId);
				className = parentType.get("name");
			}
			return classes;
		},
		isDescendant : function(subClassName, superClassName) {
			var etSub = this.getEntryTypeByName(subClassName)
			var etSuper = this.getEntryTypeByName(superClassName)
			if (!(etSub && etSuper)) {
				return false;
			}
			var idSub = etSub.get("id");
			var idSuper = etSuper.get("id");
			var justVisited = {};
			while (true) {
				if (justVisited[idSub]) {
					console.log("ERROR on", idSub, idSuper);
				}
				justVisited[idSub] = true;
				if (!idSub) {
					return false;
				}
				if (idSub === idSuper) {
					return true;
				}
				var type = this.getEntryTypeById(idSub);
				idSub = type.get("parent");
			}
		},
		getEntryTypeByName : function(className) {
			if (this.initialized === false) {
				this.init();
			}
			return this.classes[className];
		},
		getEntryTypeById : function(classId) {
			if (this.initialized === false) {
				this.init();
			}
			return this.idIndex[classId];
		},
		getAttributeList : function(className, callback, callbackScope) {
			var type = this.getEntryTypeByName(className);
			if (!type) {
				console.log("ERROR on cache class for class ", className);
			}
			var classId = type.get("id");
			return this.getAttributeListById(classId, callback, callbackScope);
		},
		getAttributeListById : function(classId, callback, callbackScope) {
			if (this.initialized === false) {
				this.init();
			}
			return _CMCache.getAttributeList(classId, callback, callbackScope);
		},
		getDomainAttributesList: function(className, callback, callbackScope) {
			var type = this.getEntryTypeByName(className);
			if (!type) {
				console.log("ERROR on cache class for class ", className);
			}
			var classId = type.get("id");
			this.getAttributeListById(classId, function(attributes) {
				var tableDomains = {};
				for (var i = 0; i < attributes.length; i++) {
					if (attributes[i].domainName) {
						tableDomains[attributes[i].domainName] = attributes[i];
					}
				}
				callback.apply(callbackScope, [tableDomains]);
			}, this);
		}
	});
})();

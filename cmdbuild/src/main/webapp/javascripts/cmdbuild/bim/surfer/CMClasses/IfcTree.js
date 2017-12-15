var IfcTree = {
    ifcTreeRoot: undefined,
    ifcObjectArray: undefined,
    init: function (project) {
        this.ifcObjectArray = [];
        this.ifcTreeRoot = [];
        this.getIfcObjectRecursive(this.ifcTreeRoot, project);
    },
    getRoot: function () {
        return this.ifcTreeRoot[0];
    },
    getIfcObjectArray: function () {
        return this.ifcObjectArray;
    },
    getIfcObjectRecursive: function (arParents, ifcObject) {
        var me = this;
        this.ifcObjectArray.push(ifcObject);
        var currentObject = {
            ifcObject: ifcObject,
            children: []
        };
        arParents.push(currentObject);
        if (ifcObject.getType() == "IfcBuildingStorey") {
            ifcObject.getContainsElements(
                function (relReferencedInSpatialStructure) {
                    relReferencedInSpatialStructure.getRelatedElements(
                        function (relatedElement) {
                            me.processRelatedElement(currentObject.children, relatedElement);
                        }
                    ).done(
                        function () {
                            ifcObject.getIsDecomposedBy(
                                function (isDecomposedBy) {
                                    if (isDecomposedBy != null) {
                                        isDecomposedBy.getRelatedObjects(
                                            function (relatedObject) {
                                                me.processRelatedElement(currentObject.children, relatedObject);
                                            }
                                        );
                                    }
                                }
                            );
                        }
                        );
                }
            );
        }
        else {
            ifcObject.getIsDecomposedBy(function (isDecomposedBy) {
                if (isDecomposedBy != null) {
                    isDecomposedBy.getRelatedObjects(function (relatedObject) {

                        me.getIfcObjectRecursive(currentObject.children, relatedObject);
                    });
                }
            });
        }
    },

    processRelatedElement: function (arParents, relatedElement) {
        this.getIfcObjectRecursive(arParents, relatedElement);
    },
    getNode: function (oid) {
        return this._getNode(this.getRoot(), oid);
    },
    _getNode: function (node, oid) {
        if (oid === node.ifcObject.object.oid) {
            return node;
        }
        for (var i = 0; i < node.children.length; i++) {
            var child = this._getNode(node.children[i], oid);
            if (child !== null) {
                return child;
            }
        }
        return null;
    }

}

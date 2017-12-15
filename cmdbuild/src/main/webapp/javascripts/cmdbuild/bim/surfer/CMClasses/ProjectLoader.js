var ProjectLoader = {
    projectModels: undefined,
    modelLoadedListeners: undefined,
    init: function (bimServerApi) {
        this.modelLoadedListeners = new EventRegistry();
        this.projectModels = {};
        this.bimServerApi = bimServerApi;
    },
    getProjectModels : function() {
        return this.projectModels;
    },
    showProject: function (poid, ifcType, callback, callbackScope) {
        var me = this;
        this.bimServerApi.call("ServiceInterface",
            "getProjectByPoid",
            { poid: poid },
            function (project) {
                simpleSmallProject = project;
                simpleSmallProject.schema = ifcType;

                me.getModelByProject(simpleSmallProject, callback, callbackScope);

            });
    },
    getModelByProject: function (project, callback, callbackScope) {
        var models = {};
        var me = this;

        this.bimServerApi.getModel(
            project.oid,
            project.lastRevisionId,
            project.schema,
            false,
            function (model) {
                defaultModel = model;
                me.preloadModel(project, model, project.lastRevisionId)
                    .done(function () {
                        me.projectModels[model.roid] = model;
                        model.getAllOfType("IfcProject", true, function (project) {
                            callback.apply(callbackScope, [project, model]);
                        });
                    });
                me.loadRelatedProjects(project.oid);
            });
    },
    loadRelatedProjects: function (oid) {
        var projects = [];
        var me = this;
        Global.bimServerApi.call("ServiceInterface", "getAllRelatedProjects", { poid: oid }, function (list) {
            list.forEach(function (smallProject) {
                if (smallProject.state == "ACTIVE") {
                    //othis.loaded[smallProject.oid] = smallProject.lastRevisionId;
                    //othis.projects.push(smallProject);
                }
                if (smallProject.lastRevisionId != -1 && smallProject.nrSubProjects == 0) {
                    Global.bimServerApi.getModel(smallProject.oid, smallProject.lastRevisionId, smallProject.schema, false, function (model) {
                        me.projectModels[smallProject.lastRevisionId] = model;
                    }, smallProject.name);
                }
            });

        });
    },
    preloadModel: function (project, model, roid) {
        console.time("preloadModel " + roid);
        var me = this;
        var countingPromise = new CountingPromise();
        var promise = new window.BimServerApiPromise();
        if (model == null) {
            console.log("no model", othis.models);
        } else {
            if (model.isPreloaded) {
                promise.fire();
                return promise;
            } else {
                var preLoadQuery = PreloadQuery.get(project.schema);
                model.query(preLoadQuery, function (loaded) {
                }).done(function () {
                    console.timeEnd("preloadModel " + roid);
                    Global.notifier.setInfo("Loading model data...", -1);
                    setTimeout(function () {
                        model.isPreloaded = true;
                        me.modelLoadedListeners.trigger(function (modelLoadedListener) {
                            modelLoadedListener(project, roid);
                        });
                        Global.notifier.setSuccess("Model data successfully loaded");
                        promise.fire();
                    }, 0);
                });
            }
        }
        return promise;
    }
}
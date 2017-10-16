(function($) {
	var ManageEmail = {
		FIELDTAG: "CMDBUILDFIELDTAG",
		ROWBUTTONREGENERATE: "refresh",
		ROWBUTTONREPLY: "btnIconReply",
		ROWBUTTONDELETE: "deleteIconButton",
		ROWBUTTONMODIFY: "pencilGoIcon",
		mailAttributes: ["account", "bcc", "body", "cc", "date", "delay",
				"from", "_id", "keepSynchronization", "noSubjectPrefix",
				"notifyWith", "promptSynchronization", "status", "subject",
				"template", "to", "condition"],
		template2MailTable: {
			condition: "condition",
			account: "account",
			bccAddresses: "bcc",
			content: "body",
			toAddresses: "to",
			ccAddresses: "cc",
			fromAddress: "from",
			subject: "subject",
			keepSynchronization: "keepSynchronization"
		},
		saveMethod: $.Cmdbuild.widgets.SAVEAFTER,
		save: function(form, widget) {
			var formName = this.formName(form, widget);
			var formObject = $.Cmdbuild.dataModel.forms[form];
			if (!formObject) {
				return {};
			}
			var data = {
				data: formObject.getBackendData().mails,
				bkData: formObject.getBackendData().bkMails,
				name: widget._id
			};
			return data;
		},
		formName: function(form, widget) {
			var name = form + "_" + widget._id + "formattachements";
			return name;
		},
		cleanData: function(form, widget) {
			var name = this.formName(form, widget);
			$.Cmdbuild.dataModel.cleanForm(name);
		},
		prepareFields: function(widget) {
			for (var i = 0; i < widget.data.templates.length; i++) {
				widget.data.templates[i] = this
						.template2Mail(widget.data.templates[i]);
				if (widget.data.templates[i].condition === null) {
					widget.data.templates[i].condition = "'true'";
				}
			}
		},
		evaluateCqlSingleTemplate: function(form, widget, template) {
			// var template = widget.data.templates[i];
			var attributes = this.getAttributes(form, widget, template);
			this.compileAttributes(form, attributes);
			template.attributes = attributes;
			$.Cmdbuild.CqlManager.variablesTable.generate(form,
					$.Cmdbuild.CqlManager.commandsTable);
			},
		evaluateCql: function(form, widget) {
			for (var i = 0; i < widget.data.templates.length; i++) {
				var template = widget.data.templates[i];
				var attributes = this.getAttributes(form, widget, template);
				this.compileAttributes(form, attributes);
				template.attributes = attributes;
			}
			$.Cmdbuild.CqlManager.variablesTable.generate(form,
					$.Cmdbuild.CqlManager.commandsTable);
		},
		createField: function(name, template, attributes) {
			attributes.push({
				name: name,// + this.FIELDTAG + template._id,
				filter: {
					text: template[name],
					params: template.variables
				}
			});
		},
		getAttributes: function(form, widget, template) {
			var attributes = [];
			this.createField("subject", template, attributes);
			this.createField("body", template, attributes);
			this.createField("to", template, attributes);
			this.createField("from", template, attributes);
			this.createField("cc", template, attributes);
			this.createField("bcc", template, attributes);
			this.createField("condition", template, attributes);
			this.createField("keepSynchronization", template, attributes);
			return attributes;
		},
		setSynchronization: function(templates, checked, keepSynchronization,
				promptSynchronization) {
			for (var i = 0; i < templates.length; i++) {
				var template = templates[i];
				template.promptSynchronization = false;
				if (!keepSynchronization) {
					template.keepSynchronization = false;
				} else {
					if (checked[template._id]) {
						template.keepSynchronization = true;
					} else {
						template.keepSynchronization = false;
					}
				}
			}
		},
		compileAttributes: function(form, attributes) {
			for (var i = 0; i < attributes.length; i++) {
				$.Cmdbuild.CqlManager.compileAttribute(form, attributes[i]);
			}
		},
		initializeAllTemplates: function(form, widget, templates, index, backendData,
				callback, callbackScope) {
			if (templates.length <= 0) {
				callback.apply(callbackScope);
				return;
			}
			var template = templates[0];
			templates.splice(0, 1);
			if (!template._id) {
				var _id = "guiTmpMail" + "_" + index + "_"
						+ (backendData.ActivityInstanceId | "");
				template._id = _id;
			}
			backendData.mails.push({
				_id: template._id,
				status: "draft"
			});
			this.evaluateCqlSingleTemplate(form, widget, template);
			$.Cmdbuild.widgets.ManageEmail.cqlResolve(form, template,
					function() {
						this.initializeAllTemplates(form, widget, templates,
								index + 1, backendData, callback, callbackScope);
					}, this);
		},
		initialize: function(form, widget) {
			this.widget = widget;
			var formObject = $.Cmdbuild.dataModel.forms[form];
			var backendData = formObject.getBackendData();
			backendData.mails = [];
			backendData.bkMails = [];

			this.config = {
				instanceForm : form,
				editProcess : formObject.config.readonly === false || formObject.config.readonly === "false"
			};

			this.initializeAllTemplates(form, widget, widget.data.templates.slice(), 0, backendData,
					function() {
						this.loadMails(formObject.config, formObject
								.getBackend(), function() {
						}, this);
					}, this);
		},
		refreshCqlFieldTemplates: function(form, widget, templates, callback, callbackScope) {
			if (templates.length <= 0) {
				callback.apply(callbackScope);
				return;
			}
			var template = templates[0];
			templates.splice(0, 1);
			var keepSynchronization = template.keepSynchronization;
			var promptSynchronization = template.promptSynchronization;
			if (!keepSynchronization) {
				this.refreshCqlFieldTemplates(form, widget, templates, callback, callbackScope);
			} else if (!promptSynchronization) {
				this.evaluateCqlSingleTemplate(form, widget, template);
				$.Cmdbuild.widgets.ManageEmail.cqlResolve(form,
						template, function() {
							this.refreshCqlFieldTemplates(form, widget, templates, callback, callbackScope);
						}, this);
			} else if (formObject.initializationPhase === false) {
				var id = form + "_" + widget._id;
				$.Cmdbuild.dataModel.pushSingleParameterOnStack(
						"widgetName", id);
				$.Cmdbuild.dataModel.pushSingleParameterOnStack(
						"formData", form);
				$.Cmdbuild.standard.commands.navigate({
					command: "navigate",
					form: "mailSynchronization",
					dialog: "syncMailDialog"
				});
				template.promptSynchronization = false;
				this.refreshCqlFieldTemplates(form, widget, templates, callback, callbackScope);
			}
		},
		refreshCqlField: function(form, widget) {
			var formObject = $.Cmdbuild.dataModel.forms[form];
			if (formObject.initializationPhase == true) {
				return;
			}
			if (this.busy === true) {
				return;
			}
			this.busy = true;
			var me = this;
			this.refreshCqlFieldTemplates(form, widget, widget.data.templates
					.slice(), function() {
				me.busy = false;
			}, this)
		},
		loadMails: function(param, backend, callback, callbackScope) {
			if (!param.cardId) {
				callback.apply(callbackScope, []);
			} else {
				$.Cmdbuild.utilities.proxy.getProcessMails(param.className,
						param.cardId, function(response) {
							this.callbackLoadMails(backend, param.className,
									param.cardId, response, callback,
									callbackScope);
						}, this);
			}
		},
		callbackLoadMails: function(backend, processType, processInstanceId,
				mails, callback, callbackScope) {
			if (mails.length <= 0) {
				callback.apply(callbackScope);
				return;
			}
			var mail = mails[0];
			mails.splice(0, 1);
			$.Cmdbuild.utilities.proxy.getProcessSingleMail(processType,
					processInstanceId, mail["_id"], function(response) {
						if (response.status === "draft" && response.keepSynchronization && this.config.editProcess) {
							// delete server draft
							$.Cmdbuild.utilities.proxy.deleteProcessMail(processType, processInstanceId, response._id, function() {
								// do nothing
							}, this);
						} else {
							backend.data.mails.push(response);
							backend.data.bkMails.push($.Cmdbuild.utilities
									.clone(response));
							this.callbackLoadMails(backend, processType,
									processInstanceId, mails, callback,
									callbackScope);
						}
					}, this);

		},
		template2Mail: function(template) {
			var ret = {};
			for ( var key in template) {
				if (this.template2MailTable[key]) {
					ret[this.template2MailTable[key]] = template[key];
				} else {
					ret[key] = template[key];
				}
			}
			return ret;
		}
	};
	$.Cmdbuild.widgets.ManageEmail = ManageEmail;
	// statics
	$.Cmdbuild.widgets.ManageEmail.cqlResolveSingleField = function(form,
			nameField, template, callback, callbackScope) {
		var formObject = $.Cmdbuild.dataModel.forms[form];
		var backendData = formObject.getBackendData();
		$.Cmdbuild.CqlManager.resolve(form, nameField, function(response) {
			var mail = $.Cmdbuild.widgets.ManageEmail.getMail(
					backendData.mails, template._id);
			mail[nameField] = response;
			mail.fromTemplate = template._id;
			if (callback) {
				callback.apply(callbackScope, [response]);
			}
		}, this);
	};
	$.Cmdbuild.widgets.ManageEmail.cqlResolve = function(form, template,
			callback, callbackScope) {
		var attributes = template.attributes.slice();
		$.Cmdbuild.widgets.ManageEmail.cqlResolveCallback(form, template,
				attributes, function() {
					callback.apply(callbackScope, []);
				}, this);
	};
	$.Cmdbuild.widgets.ManageEmail.cqlResolveCallback = function(form,
			template, attributes, callback, callbackScope) {
		if (attributes.length <= 0) {
			callback.apply(callbackScope, []);
			return;
		}
		var attribute = attributes[0];
		attributes.splice(0, 1);
		$.Cmdbuild.widgets.ManageEmail.cqlResolveSingleField(form,
				attribute.name, template, function() {
					$.Cmdbuild.widgets.ManageEmail.cqlResolveCallback(form,
							template, attributes, callback, callbackScope);
				}, this);
	};
	$.Cmdbuild.widgets.ManageEmail.refreshTemplate = function(form, widget,
			templateName) {
		for (var i = 0; i < widget.data.templates.length; i++) {
			var template = widget.data.templates[i];
			if (template._id == templateName) {
				$.Cmdbuild.widgets.ManageEmail.cqlResolve(form, template,
						function() {
						}, this);
				break;
			}
		}
	};
	$.Cmdbuild.widgets.ManageEmail.getMail = function(mails, id) {
		for (var i = 0; i < mails.length; i++) {
			if (mails[i]._id == id) {
				return mails[i];
			}
		}
	};
	$.Cmdbuild.widgets.ManageEmail.isDifferent = function(bkMail, mail) {
		for (var i = 0; i < $.Cmdbuild.widgets.ManageEmail.mailAttributes.length; i++) {
			var attribute = $.Cmdbuild.widgets.ManageEmail.mailAttributes[i];
			if (mail[attribute] != bkMail[attribute]) {
				return true;
			}
		}
		return false;
	};
	$.Cmdbuild.widgets.ManageEmail.searchAttribute = function(mail, attribute) {
		for (var key in mail) {
			var lTag = key.indexOf(this.FIELDTAG);
			var shortKey = key;
			if (lTag > -1) {
				shortKey = shortKey.substr(0, lTag);
			}
			if (shortKey === attribute) {
				return mail[key];
			}
		}
		return undefined;
	};
	$.Cmdbuild.widgets.ManageEmail.copyMail = function(mail) {
		var mailOut = {};
		for (var i = 0; i < $.Cmdbuild.widgets.ManageEmail.mailAttributes.length; i++) {
			var attribute = $.Cmdbuild.widgets.ManageEmail.mailAttributes[i];
			mailOut[attribute] = $.Cmdbuild.widgets.ManageEmail.searchAttribute(mail, attribute);
		}
		return mailOut;
	};
	$.Cmdbuild.widgets.ManageEmail.deleteMails = function(param, data) {
		for (var i = 0; i < data.bkData.length; i++) {
			var found = false;
			var bkMail = data.bkData[i];
			for (var j = 0; j < data.data.length; j++) {
				var mail = data.data[j];
				if (bkMail._id == mail._id) {
					found = true;
					break;
				}
			}
			if (found) {
				continue;
			} else {
				$.Cmdbuild.utilities.proxy.deleteProcessMail(param.type,
						param.id, bkMail._id, function() {
						}, this);
			}
		}
	};
	$.Cmdbuild.widgets.ManageEmail.flush = function(param, data, widgetId,
			parentForm, callback, callbackScope) {
		if (!data.data) {
			if (!callback) {
				console.log(Error().stack);
			}
			callback.apply(callbackScope, []);
			return;
		}
		var arrMails = data.data.slice();
		$.Cmdbuild.widgets.ManageEmail.flushRecursive(param, arrMails,
				data.bkData, function() {
					this.deleteMails(param, data);
					callback.apply(callbackScope, []);
				}, this);
	};
	$.Cmdbuild.widgets.ManageEmail.flushRecursive = function(param, mails,
			bkMails, callback, callbackScope) {
		if (mails.length <= 0) {
			callback.apply(callbackScope, []);
			return;
		}
		var mailOrig = mails[0];
		mails.splice(0, 1);
		var mail = $.Cmdbuild.widgets.ManageEmail.copyMail(mailOrig);
		if (mail.condition !== '\'true\'') {
			$.Cmdbuild.widgets.ManageEmail.flushRecursive(param, mails,
					bkMails, callback, callbackScope);
			return;
		}
		var found = false;
		var present = $.grep(bkMails, function(el) {
			return el._id == mail._id;
		});
		if (present.length > 0) {// the mail was there
			var bkMail = present[0];
			if ($.Cmdbuild.widgets.ManageEmail.isDifferent(bkMail, mail)) {
				var mailOut = $.Cmdbuild.widgets.ManageEmail.copyMail(mail);
				$.Cmdbuild.utilities.proxy.putProcessMail(param.type, param.id,
						mailOut._id, mailOut, function() {
							$.Cmdbuild.widgets.ManageEmail.flushRecursive(
									param, mails, bkMails, callback,
									callbackScope);
						}, this);
			} else {
				$.Cmdbuild.widgets.ManageEmail.flushRecursive(param, mails,
						bkMails, callback, callbackScope);
			}
		} else {// a new mail
			var mailOut = $.Cmdbuild.widgets.ManageEmail.copyMail(mail);
			var mailId = mailOut["_id"];
			delete mailOut["_id"];
			delete mailOut["condition"];
			$.Cmdbuild.utilities.proxy.postProcessMail(param.type, param.id,
					mailOut, function() {
						$.Cmdbuild.widgets.ManageEmail.flushRecursive(param,
								mails, bkMails, callback, callbackScope);
					}, this);
		}
	};
})(jQuery);
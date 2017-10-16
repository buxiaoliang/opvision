(function(j$) {
	// form description
	var reportslist = function() {
		// variables
		this.id = null;
		this.config = null;
		this.backend = null;
		this.reports = null;

		/**
		 * Initialize form
		 * 
		 * @param {Object} params
		 * @param {String} params.form
		 * @param {String} params.container
		 */
		this.init = function(params) {
			// save configuration
			this.config = params;
			this.id = this.config.form;

			var xmlForm = $.Cmdbuild.elementsManager.getElement(this.config.form);

			this.reports = $.Cmdbuild.utilities.getReportsOverrides(xmlForm);

			this.updateConfig();

			var backendFn = $.Cmdbuild.utilities.getBackend("Reports");
			var backend = new backendFn(param, this.show, this);
			this.setBackend(backend);
		};

		this.updateConfig = function() {
			// pagination size
			if (this.config.nRows === undefined) {
				this.config.nRows = $.Cmdbuild.global.getApplicationConfig().grid.pagelength;
			}
			// show search
			if (this.config.showsearch === undefined) {
				this.config.showsearch = true;
			} else {
				this.config.showsearch = this.config.showsearch == "true";
			}
			// enable sorting
			if (this.config.enablesorting === undefined) {
				this.config.enablesorting = true;
			} else {
				this.config.enablesorting = this.config.enablesorting == "true";
			}
		};

		/**
		 * Show reports list
		 */
		this.show = function() {
			var me = this;
			var $container = $("#" + this.config.container);
			$container.addClass("cgf-reporslist-container");
			$container.empty();

			// create table
			var $table = $("<table></table>").attr("id", this.id).addClass("display");
			$table.appendTo($container);

			// configure datatable
			$table.DataTable({
				columns : [{
					name : "description",
					orderable : me.config.enablesorting,
					data : "description",
					title : $.Cmdbuild.translations.getTranslation("cgf_label_description", "Description")
				}],
				pageLength : me.config.nRows, // pagination size
				lengthChange : false, // hide pagination size editor
				info : true, // show page info
				processing : true, // process by server
				serverSide : true, // process by server
				searching : me.config.showsearch,
				language : languageConfig(), // labels 
				ajax : function(data, callback, settings) {
					me.loadData(data, callback, settings);
				}
			});

			this.addEventsListeners();
		};

		/**
		 * Load Data fn
		 */
		this.loadData = function(data, callback, settings) {
			var me = this;
			var params = {
					limit : data.length,
					start : data.start,
					searchTherm : data.search.value,
					sort : []
				}

			// order
			$.each(data.order, function(index, col) {
				params.sort.push({
					property : settings.aoColumns[col.column].data,
					direction : col.dir.toUpperCase()
				});
			});

			me.getBackend().loadData(params, function(data, metadata) {
				callback({
					data : data,
					recordsTotal : metadata.total,
					recordsFiltered : metadata.total
				});
			}, this);
		};

		/**
		 * Add events
		 */
		this.addEventsListeners = function() {
			var me = this;
			var $table = $("#" + this.id).DataTable();
			// row selection
			$("#" + this.id + " tbody").on('click', 'tr', function() {
				me.onSelectRow(this, $table);
			});
			$("#" + this.id + " tbody tr").css("cursor", "pointer");
		}

		/**
		 * On slect row event
		 * 
		 * @param {DOM} row
		 * @param {DOM} $table
		 */
		this.onSelectRow = function(row, $table) {
			var me = this;
			var data = $table.row(row).data();

			// get report data to get report name
			this.getBackend().getReportInfo(data._id, function(rdata, rmetadata) {
				var customattrs = me.reports[rdata.title];
				var extension = null;
				if (customattrs && customattrs.extension) {
					extension = customattrs.extension;
				}
				$.Cmdbuild.standard.commands.openreport({
					id : rdata._id,
					extension : extension,
					customattrs : customattrs && customattrs.attributes
				});
			}, this);
			
		};

		/*
		 * Getters and Setters
		 */
		/**
		 * Get the backend object used for this form
		 * @returns {Object} The backend object
		 */
		this.getBackend = function() {
			return this.backend;
		};
		/**
		 * Set backend object for this form
		 * @param {Object} backend The backend object
		 */
		this.setBackend = function(backend) {
			this.backend = backend;
		};
	};

	/**
	 * Return language configuration
	 * @returns {Object}
	 */
	function languageConfig() {
		return {
			paginate : {
				first : '«',
				previous : '‹',
				next : '›',
				last : '»'
			},
			info : $.Cmdbuild.translations.getTranslation("cgf_pagination_info", "Page _PAGE_ of _PAGES_ (records _TOTAL_)"),
			search : $.Cmdbuild.translations.getTranslation("cgf_pagination_search", "Search"),
			aria : {
				paginate : {
					first : $.Cmdbuild.translations.getTranslation("cgf_pagination_first", "First"),
					previous : $.Cmdbuild.translations.getTranslation("cgf_pagination_previous", "Previous"),
					next : $.Cmdbuild.translations.getTranslation("cgf_pagination_next", "Next"),
					last : $.Cmdbuild.translations.getTranslation("cgf_pagination_last", "Last")
				}
			}
		};
	}
	

	$.Cmdbuild.standard.reportslist = reportslist;
})(jQuery);
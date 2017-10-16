(function($) {
	var configuration = {
		grid : {
			pagelength : 10
		},
		reference : {
			displayAttribute : "Description",
			optionsLimit : 20,
			sort : {
				field : "Description",
				direction : "ASC"
			}
		},
		widgets : {
			customform : {
				disableinlineediting : false
			}
		}
	};
	$.Cmdbuild.standard.configuration = configuration;
})(jQuery);

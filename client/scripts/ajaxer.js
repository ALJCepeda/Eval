define(['bareutil.ajax'], function(ajax) {
	ajax.fetchMeta = function() {
        return ajax.get('meta').then(JSON.parse);
    };

    ajax.compile = function(project) {
        return ajax.post('compile', project).then(JSON.parse);
    }

	return ajax;
});

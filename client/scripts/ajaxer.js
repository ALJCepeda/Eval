define(['bareutil.ajax'], function(ajax) {
	ajax.info = function() {
        return ajax.get('info').then(JSON.parse);
    };

    ajax.compile = function(project) {
        return ajax.post('compile', project).then(JSON.parse);
    }

	return ajax;
});

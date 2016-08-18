define(['bareutil.ajax'], function(ajax) {
	ajax.fetchMeta = function() {
        return ajax.get('meta').then(JSON.parse);
    };

    ajax.compile = function(project) {
        return ajax.post('compile', project).then(JSON.parse);
    }

	ajax.project = function(projectid, saveid) {
		return ajax.post('project', { projectid:projectid, saveid:saveid }).then(JSON.parse);
	};

	return ajax;
});

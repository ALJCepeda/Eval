define(['bare.ajax'], function(ajax) {
	ajax.info = function() {
        return ajax.get('info').then(function(data) {
            var info = JSON.parse(data);
            return info;
        });
    };

    ajax.compile = function(data) {
        return ajax.post('compile', data);
    }

	return ajax;
});

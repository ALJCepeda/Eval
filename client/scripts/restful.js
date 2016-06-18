define(['scripts/ajaxer'], function(Ajaxer) {
    var Restful = function() {
        this.ajax = new Ajaxer();
    };

    Restful.prototype.info = function() {
        return this.ajax.get('info').then(function(data) {
            var info = JSON.parse(data);
            return info;
        });
    };

    return new Restful();
});

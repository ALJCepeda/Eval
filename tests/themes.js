var tape = require('tape');
var fs = require('fs');

tape('enumerate themes', function(t) {
    fs.readdir('/sources/eval/node_modules/ace-builds/src-min', function(err, files) {
        if(err) throw err;

        var mapped = files.filter(function(file) {
            return file.indexOf('theme-') !== -1;
        }).map(function(file) {
            return file.substring(0, file.length-3).substring(6);
        });

        console.log(mapped);
        t.deepEqual(
            mapped,
            [   'ambiance', 'chaos', 'chrome', 'clouds', 'clouds_midnight',
                'cobalt', 'crimson_editor', 'dawn', 'dreamweaver', 'eclipse',
                'github', 'idle_fingers', 'iplastic', 'katzenmilch', 'kr_theme',
                'kuroir', 'merbivore', 'merbivore_soft', 'mono_industrial',
                'monokai', 'pastel_on_dark', 'solarized_dark', 'solarized_light',
                'sqlserver', 'terminal', 'textmate', 'tomorrow', 'tomorrow_night',
                'tomorrow_night_blue', 'tomorrow_night_bright', 'tomorrow_night_eighties',
                'twilight', 'vibrant_ink', 'xcode' ],
            'Fetched available themes'
        );
        t.end();
    });
});

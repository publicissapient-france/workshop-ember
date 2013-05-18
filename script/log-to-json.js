var fs = require('fs');
var filename = process.argv.slice(2)[0];
if (!filename) {
    console.error('You must pass the filename in parameter of the cli ');
    return;
}

var text = fs.readFileSync(filename, "utf8");


var results = [];
var counter = 0;
text.split(/\r?\n/).forEach(function (line) {
    //On ne prend que les lignes courtes

    var regexp = /^([0-9.]+) - - \[(.*)\] "(.*)" (\d+) (\d+) "(.*)" "(.*)"$/;
    var parts = line.match(regexp);

    if (parts) {
        var date = parts[2];
        var request = parts[3];
        var status = parts[4];
        var size = parts[5];
        var useragent = parts[7];


        results.push({
            id: ++counter,
            date: date,
            request: request,
            status: status,
            size: size,
            useragent: useragent
        });
    }

});

var is304 = function (log) {
    return log.status == 304;
};

var isPost = function (log) {
    return log.request.indexOf('POST') != -1;
};

var not = function (fn) {
    return function (log) {
        return !fn(log);
    }
};


var notModifiedLogs = results.filter(is304).slice(1, 3);
var postLogs = results.filter(isPost).slice(1, 4);
var modifiedLogs = results.filter(not(is304)).slice(1, 8);

console.log(JSON.stringify(notModifiedLogs.concat(postLogs).concat(modifiedLogs)));


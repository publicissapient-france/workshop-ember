var express = require('express');


var app = express();

app.configure(function () {
    app.use(express.bodyParser());
});

app.use(express.static(__dirname));

var getLogs = function () {
    var fs = require('fs');
    var filename = 'data/access.log';
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

    return results;
};


// list of pony
app.get('/logs', function (req, res) {
    console.log('Request on /logs with query', req.query);
    var logs = getLogs();
    if (req.query.methods) {
        logs = logs.filter(function (log) {
            var parts = log.request.split(' ');
            return req.query.methods.indexOf(parts[0]) != -1
        });
    }

    if (req.query.statuses) {
        logs = logs.filter(function (log) {
            return req.query.statuses.indexOf(log.status) != -1
        });
    }

    if (req.query.searchTerm) {
        logs = logs.filter(function (log) {
            return log.request.toLowerCase().indexOf(req.query.searchTerm.toLowerCase()) != -1;
        });
    }

    res.send({'logs': logs.slice(1, 29)});
});

app.get('/logs/:id', function (req, res) {
    var logs = getLogs();

    res.send({'log': logs.filter(function (log) {
        return log.id == req.params.id;
    })[0]});
});


app.listen(3000);
console.log('Listening on port 3000...');
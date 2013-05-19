App = Ember.Application.create({
    rootElement: '#ember-app'
});

App.Store = DS.Store.extend({
    revision: 12,
    adapter: 'DS.RESTAdapter'
});

App.Log = DS.Model.extend({
    host: DS.attr('string'),
    date: DS.attr('string'),
    request: DS.attr('string'),
    status: DS.attr('string'),
    size: DS.attr('number'),
    useragent: DS.attr('string'),

    path: function () {
        var parts = this.get('request').split(' ');
        return parts[1];
    }.property('request'),
    method: function () {
        var parts = this.get('request').split(' ');
        return parts[0];
    }.property('request')
});


App.Log.FIXTURES = [
    {"id": 2, "date": "18/May/2013:11:20:19 +0000", "request": "GET /js/messages_fr.js HTTP/1.1", "status": "304", "size": "0", "useragent": "Mozilla/5.0 (Windows NT 5.1; rv:20.0) Gecko/20100101 Firefox/20.0"},
    {"id": 3, "date": "18/May/2013:11:20:19 +0000", "request": "GET /js/jquery.ui.datepicker-fr.js HTTP/1.1", "status": "304", "size": "0", "useragent": "Mozilla/5.0 (Windows NT 5.1; rv:20.0) Gecko/20100101 Firefox/20.0"},
    {"id": 157, "date": "18/May/2013:11:52:52 +0000", "request": "POST /order HTTP/1.1", "status": "201", "size": "0", "useragent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0"},
    {"id": 180, "date": "18/May/2013:11:54:37 +0000", "request": "POST /order HTTP/1.1", "status": "201", "size": "0", "useragent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0"},
    {"id": 203, "date": "18/May/2013:11:55:38 +0000", "request": "POST /order HTTP/1.1", "status": "201", "size": "0", "useragent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0"},
    {"id": 8, "date": "18/May/2013:11:20:21 +0000", "request": "GET /calendar/2013/5 HTTP/1.1", "status": "200", "size": "1547", "useragent": "Mozilla/5.0 (Windows NT 5.1; rv:20.0) Gecko/20100101 Firefox/20.0"},
    {"id": 9, "date": "18/May/2013:11:21:35 +0000", "request": "PUT /order HTTP/1.1", "status": "200", "size": "522", "useragent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0"},
    {"id": 10, "date": "18/May/2013:11:21:36 +0000", "request": "GET /timeslot/1811 HTTP/1.1", "status": "200", "size": "353", "useragent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0"},
    {"id": 11, "date": "18/May/2013:11:21:37 +0000", "request": "GET /order/form/1811/21389 HTTP/1.1", "status": "200", "size": "4277", "useragent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0"},
    {"id": 12, "date": "18/May/2013:11:21:38 +0000", "request": "GET /order/21389 HTTP/1.1", "status": "200", "size": "534", "useragent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0"},
    {"id": 13, "date": "18/May/2013:11:21:38 +0000", "request": "GET /formula/from/composition/48199 HTTP/1.1", "status": "200", "size": "157", "useragent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0"},
    {"id": 14, "date": "18/May/2013:11:21:38 +0000", "request": "GET /formula/56575 HTTP/1.1", "status": "200", "size": "286", "useragent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0"}
];

App.IndexRoute = Ember.Route.extend({
    model: function () {
        return App.Log.find();
    }
});

App.IndexController = Ember.ArrayController.extend({

    searchTerm: '',
    statuses: [
        {code: 200, checked: true},
        {code: 201, checked: true},
        {code: 304, checked: true},
        {code: 400, checked: true},
        {code: 403, checked: true},
        {code: 404, checked: true},
        {code: 500, checked: true}
    ],
    methods: [
        {code: "PUT", checked: true},
        {code: 'DELETE', checked: true},
        {code: "POST", checked: true},
        {code: 'GET', checked: true}
    ],

    filteredLogs: function () {
        var isChecked = function (el) {
            return el.checked;
        };

        var getCode = function (el) {
            return el.code;
        };

        var methods = this.get('methods').filter(isChecked).map(getCode);
        var statuses = this.get('statuses').filter(isChecked).map(getCode);
        var searchTerm = this.get('searchTerm').trim();

        return this.get('content').filter(function (log) {

            return statuses.indexOf(log.get('status')) != -1;
        }).filter(function (log) {
                return methods.indexOf(log.get('method')) != -1;
            }).filter(function (log) {
                return searchTerm == '' || log.get('path').indexOf(searchTerm) != -1
            });
    }.property('content.@each', 'methods.@each.checked', 'statuses.@each.checked', 'searchTerm')


});


App.Router.map(function () {
    this.route('detail', {path: 'log/:log_id'});
});


Ember.Handlebars.registerBoundHelper('size', function (number) {
    if (number > 1024 * 1024) {
        return '' + (number / 1024 * 1024).toFixed(2) + ' MB';
    } else if (number > 1024) {
        return '' + (number / 1024).toFixed(2) + ' kB';
    } else {
        return '' + number + ' B';
    }
});
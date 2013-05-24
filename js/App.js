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
    if (number > 1024) {
        return (number / 1024).toFixed(2).toString() + ' kB';
    } else {
        return number.toString() + ' B';
    }
});
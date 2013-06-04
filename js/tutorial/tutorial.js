Ember.ENV.TESTING = true;
SyntaxHighlighter.defaults['gutter'] = false;

$.get('tutorial.html').done(function (content) {
    $('body').append(content);

    Tuto = Em.Application.create({
        rootElement: '#tutorial'
    });

    Tuto.Router.reopen({
        location: 'none'
    });

    Tuto.ApplicationView = Ember.View.extend({
        templateName: "tutorial-app",
        didInsertElement: function () {
            SyntaxHighlighter.highlight();

            var view = this;
            execTestsSteps(Tuto.STEPS);
            Em.run.later(function () {
                var stepIsActive = $(".is-active");
                if (stepIsActive.length > 0) {
                    $('#tutorial').animate({
                        scrollTop: $(".is-active").offset().top
                    }, 100);
                } else {
                    view.set('status', " terminé !");
                    var fworks = new Fireworks();
                }
            }, 200);

            $('#tutorial img').on('click', function () {
                window.location.reload();
            });
        }
    });

    Tuto.StepView = Em.View.extend({
        templateName: "tutorial-step",
        classNames: "step",
        classNameBindings: ['step.isActive'],
        solutionIsShown: false,
        toggleSolution: function () {
            this.toggleProperty("solutionIsShown");
            Em.run.next(function () {
                SyntaxHighlighter.defaults['gutter'] = false;
                SyntaxHighlighter.all();
            });
            this.$('.solution').stop().slideToggle(this.solutionIsShown);
        },
        explanationView: function () {
            return Em.View.extend({
                classNames: "well",
                templateName: this.step.detailTemplateName
            });
        }.property('step'),
        detailIsShownToggler: false,
        toggleDetail: function () {
            this.toggleProperty("detailIsShownToggler");
            $('.step-detail').not(this.$('.step-detail')).slideUp();
            this.$('.step-detail').stop().slideToggle(this.detailIsShownToggler);
        },
        detailIsShown: function () {
            return this.get('step.isActive') || this.detailIsShownToggler;
        }.property("step.isActive", "detailIsShownToggler"),
        errorsIsShown: function () {

        }.property("step.passed", "step.executed"),
        solutionView: function () {
            return Em.View.extend({
                tagName: "pre",
                classNames: ["code", "brush: js"],
                templateName: this.step.solutionTemplateName
            });
        }.property("step.solutionTemplateName")
    });

    Tuto.Step = Em.Object.extend({
        title: "",
        detailTemplateName: "tutorial-step-empty",
        solutionTemplateName: "tutorial-solution-empty",
        test: function () {
            ok(false, "Test not implemented")
        },
        passed: false,
        executed: false,
        errors: [],
        isActive: function () {
            return !this.passed && this.executed;
        }.property("passed", "executed")
    });

    templateContains = function (templateName, text, msg) {
        ok(templates[templateName].indexOf(text) != -1, msg);
    };

    Tuto.STEPS = [
        Tuto.Step.create({
            title: "Création de l'application",
            detailTemplateName: "tutorial-step-app",
            solutionTemplateName: "tutorial-solution-app",

            test: function () {
                ok(typeof App != "undefined",
                    "Il n'y a pas d'Objet App dans window");

                ok(Em.typeOf(App) == "instance",
                    "Cet objet App doit être un objet Ember");

                ok(App.rootElement == '#ember-app', "ember-app n'est pas la div racine de l'application");
            }
        }),
        Tuto.Step.create({
            title: "Ajout d'une barre de titre",
            detailTemplateName: "tutorial-step-hello",
            solutionTemplateName: "tutorial-solution-hello",
            test: function () {
                ok(templates['application'] != undefined, "Le template 'application' n'est pas déclaré.");
                templateContains("application", "<header>", "Le template application ne contient pas de balise header");
                templateContains("application", "</header>", "Le template application ne contient pas de balise header")
                templateContains("application", '<imgsrc="img/logo.png"' , "Le template application ne contient pas le logo avec sa balise img dans le header");
            }
        }),
        Tuto.Step.create({
            title: "Création d'un datastore",
            detailTemplateName: "tutorial-step-ds",
            solutionTemplateName: "tutorial-solution-ds",
            test: function () {
                ok(Em.typeOf(App.Store) == 'class', "App.Store n'est pas définie, ou a été initialisé avec un create.");
                ok(App.Store.create() instanceof DS.Store, "App.Store n'est pas de type DS.Store");
                ok(App.Store.prototype.revision == 12, "La revision actuelle de App.Store est "
                    + App.Store.prototype.revision + " alors qu'elle devrait être 12");
                ok(App.Store.prototype.adapter == "DS.RESTAdapter", "La propriété adapter de App.Store est initialisé à "
                    +App.Store.prototype.adapter +" alors qu'elle devrait être à 'DS.RESTAdapter'");
            }
        }),
        Tuto.Step.create({
            title: "Création d'une classe Log",
            detailTemplateName: "tutorial-step-model",
            solutionTemplateName: "tutorial-solution-model",
            test: function () {
                ok(typeof App.Log != "undefined", "App.Log n'est pas définie.");
                ok(Em.typeOf(App.Log) == "class", "App.Log n'est pas une classe ember.");

                ok(App.Log.createRecord &&
                    App.Log.createRecord() instanceof DS.Model,
                    "App.Log n'est pas de type DS.Model");

                var assertLogPropertyExistenceAndType = function (propertyName, expectedType) {
                    try {
                        var type = App.Log.metaForProperty(propertyName).type;
                        equal(type, expectedType,
                            "La proprité " + propertyName + " de App.Log doit être de type " + expectedType + " et de non type " + type);
                    } catch (e) {
                        if (e instanceof Failed) {
                            throw e;
                        }
                        fail("App.Log ne contient pas de propriété " + propertyName + " ou elle n'est pas correctement déclarée.");
                    }
                };

                assertLogPropertyExistenceAndType("host", 'string');
                assertLogPropertyExistenceAndType("date", 'string');
                assertLogPropertyExistenceAndType("request", 'string');
                assertLogPropertyExistenceAndType("status", 'string');
                assertLogPropertyExistenceAndType("size", 'number');
                assertLogPropertyExistenceAndType("useragent", 'string');
            }
        }),
        Tuto.Step.create({
            title: "Création du template de liste",
            detailTemplateName: "tutorial-step-list",
            solutionTemplateName: "tutorial-solution-list",
            test: function () {
                ok (templates.application.indexOf("{{outlet}}") != -1, "Le template application ne contient pas de {{outlet}}");
                ok (Em.typeOf(App.IndexRoute) == 'class', "App.IndexRoute n'est pas définie ou n'est pas une classe Ember.");
                ok (App.IndexRoute.create() instanceof Em.Route, "App.IndexRoute n'est pas de type Ember.Route");
                ok (App.IndexRoute.prototype.model(),
                    "La méthode 'model' de App.IndexRoute ne renvoie rien ou n'est pas définie.");
                ok (App.IndexRoute.prototype.model().get,
                    "La méthode 'model' de App.IndexRoute un Objet Ember.");
                ok (App.IndexRoute.prototype.model().get('content'),
                    "La méthode 'model' de App.IndexRoute ne renvoie pas la liste des logs.");


                ok(Em.TEMPLATES['index'] != undefined, "Le template 'index' n'est pas déclaré.");

                ok (templates.index.indexOf("<div") != -1, "Le template index ne contient pas de balise div");
                ok (templates.index.indexOf("content") != -1, "Le template index ne contient pas l'id content");
                ok (templates.index.indexOf("<table>") != -1, "Le template index ne contient pas de balise table");

                ok (templates.index.indexOf("<th>Path</th><th>Method</th><th>Status</th><th>Size</th><th>Time</th>") != -1, "Le template doit contenir entre balise th les colonnes Path, Method, Status, Size, Time dans l'ordre");
                ok (templates.index.indexOf("<td>") != -1, "Le template ne contient pas de balise td");
                ok (templates.index.indexOf("status}}") != -1, "Le template n'affiche pas le status dans la colonne correspondante");
                ok (templates.index.indexOf("size}}") != -1, "Le template n'affiche pas la taille (size) dans la colonne correspondante");
                ok (templates.index.indexOf("date}}") != -1, "Le template n'affiche pas la date dans la colonne correspondante");
                ok (templates.index.indexOf("{{#each") != -1, "Le template ne contient pas de helper {{each}}");
            }
        }),
        Tuto.Step.create({
            title: "Création de propriétés calculées",
            detailTemplateName: "tutorial-step-computed",
            solutionTemplateName: "tutorial-solution-computed",
            test: function () {
                var log = App.Log.createRecord({
                    request :'GET /js/messages_fr.js HTTP/1.1'
                });
                ok (typeof log.get('path') != "undefined", "La propriété path de App.Log n'est pas pas définie ou ne renvois rien.");

                ok (typeof log.path != "function", "App.Log.path n'est pas une proriété calculée mais une fonction, " +
                        "on aurait pas oublié '.property(...)' par hasard ?");

                ok (log.get("path") == "/js/messages_fr.js", "Si request = 'GET /js/messages_fr.js HTTP/1.1' path devrait valoir '/js/messages_fr.js' " +
                    "et non pas "+ log.get("path"));

                log.set('request', 'GET /js/messages_en.js HTTP/1.1');
                ok (log.get("path") == "/js/messages_en.js", "La propriété calculée path ne dépend pas de request");

                ok (templates.index.indexOf("log.path}}") != -1, "La propriété path n'est pas utilisée dans le template index");


                ok (typeof log.get('method') != "undefined", "La propriété method de App.Log n'est pas pas définie");

                ok (typeof log.method != "function", "App.Log.method n'est pas une proriété calculée mais une fonction, " +
                        "on aurait pas oublié '.property(...)' par hasard ?");

                ok (log.get("method") == "GET", "Si request = 'GET /js/messages_fr.js HTTP/1.1' method devrait valoir 'GET' " +
                    "et non pas "+ log.get("method"));

                log.set('request', 'POST /js/messages_en.js HTTP/1.1');
                ok (log.get("method") == "POST", "La propriété calculée method ne dépend pas de request");

                ok (templates.index.indexOf("method}}") != -1, "La propriété method n'est pas utilisée dans le template index");
            }

        }),
        Tuto.Step.create({
            title: "Création de helper",
            detailTemplateName: "tutorial-step-helper",
            solutionTemplateName: "tutorial-solution-helper",
            test: function () {
                ok (helpers.size != undefined, "Le helper 'size' n'est pas définie.");
                ok (helpers.size(180) === "180 B", "Si l'on donne 180 au helper il devrait retourner '180 B' or il retourne "+helpers.size(180));
                ok (helpers.size(2202) === "2.15 kB", "Si l'on donne 2202 au helper il devrait retourner '2.15 kB' or il retourne "+helpers.size(2202));
                try{
                    ok(helpers.size(undefined) === "", "Si l'on donne undefined au helper size, il doit renvoyer \"\"");
                } catch (e){
                    if (e instanceof Failed) {
                        throw e;
                    }
                    fail("Si l'on donne undefined au helper size il ne doit pas avoir d'erreur");
                }

                templateContains("index", "{{size", "Dernière chose, appeler le helper size dans le template index");
            }
        }),
        Tuto.Step.create({
            title: "Création d'une page de consultation",
            detailTemplateName: "tutorial-step-consultation",
            solutionTemplateName: "tutorial-solution-consultation",
            test: function () {

                var appRouter = App.__container__.lookup('router:main');

                ok (appRouter.hasRoute('detail'), "Il n'y pas de route 'detail' déclarée dans le router.");

                ok (appRouter.router.recognizer.handlersFor('detail').length == 2, "La définition de la route est incorrecte");

                var detailHandler =  appRouter.router.recognizer.handlersFor('detail')[1];
                ok (detailHandler.names.length == 1, "La route détail doit être définie avec un path, avec une partie variable");
                ok (detailHandler.names[0] == "log_id", "La partie variable du path de detail doit être log_id et non pas "+detailHandler.names[0]);

                ok(Em.TEMPLATES['detail'] != undefined, "Le template 'detail' n'est pas déclaré.");

                ok(templates.index.indexOf('{{#linkTo') != -1, "Le helper linkTo n'est pas utilisé dans l'index");

                ok(templates.index.indexOf("tagName=\"tr\"") != -1 ||
                    templates.index.indexOf("tagName='tr'") != -1, "LinkTo doit avoir un tagName='tr'");

                ok(templates.index.indexOf("{{#linkTo'detail'") != -1 ||
                   templates.index.indexOf("{{#linkTodetail") != -1, "LinkTo doit pointer sur la route 'detail'");

                ok(templates.index.indexOf("{{#linkTo'detail'tagName") == -1 &&
                    templates.index.indexOf("{{#linkTodetailtagName") == -1, "LinkTo doit aussi passer le log courant à la route 'detail'");

                ok (templates.detail.indexOf("<div") != -1, "Le template detail ne contient pas de balise div");
                ok (templates.detail.indexOf("content") != -1, "Le template detail ne contient pas l'id content");
                templateContains('detail','useragent}}', "Le useragent n'est pas affiché dans le détail.");
                templateContains('detail','useragent}}</div>', "Le useragent doit être dans la div");
            }
        }),
        Tuto.Step.create({
            title: "Création d'un lien vers la home dans la consultation",
            detailTemplateName: "tutorial-step-home",
            solutionTemplateName: "tutorial-solution-home",
            test: function () {
                ok(templates.application.indexOf('{{#linkTo') != - 1 && templates.application.indexOf('{{/linkTo') != - 1, "Le template application ne contient pas de linkTo");

                ok(templates.application.indexOf('{{#linkToindex}}') != -1, "LinkTo doit pointer vers index");
            }
        }),
        Tuto.Step.create({
            title: "Création du filtre de recherche",
            detailTemplateName: "tutorial-step-search",
            solutionTemplateName: "tutorial-solution-search",
            test:function(){
                templateContains('index', '{{input',"L'helper input n'est pas utilisé dans le template index.");
                templateContains('index', '<div>{{input',"L'helper input n'est pas au bon endroit. Il doit être dans la div.");
                ok(templates.index.indexOf("type=\"search\"") != - 1 || templates.application.indexOf("type='search'") != - 1, "Le helper input doit être de type search");
                templateContains('index','value=searchTerm',"Le helper input doit avoir comme valeur la propriété 'searchTerm'");

                ok (Em.typeOf(App.IndexController) == "class", "App.IndexController n'est pas définie ou n'est pas une classe Ember");
                ok (App.IndexController.create() instanceof Em.ArrayController, "App.IndexController n'est pas de type Ember.ArrayController");

                var indexCtrl = App.IndexController.create({
                    content : [
                        Em.Object.create({path:"AA", status: 200, method: "GET"}),
                        Em.Object.create({path:"BA", status: 200, method: "GET"}),
                        Em.Object.create({path:"BAB", status: 200, method: "GET"})
                    ]
                });
                ok (typeof indexCtrl.get('searchTerm') != "undefined", "La propriété searchTerm de IndexController n'est pas définie ou ne renvois rien.");
                ok (typeof indexCtrl.get('filteredLogs') != "undefined", "La propriété filteredLogs de IndexController n'est pas définie ou ne renvois rien.");

                ok (typeof indexCtrl.filteredLogs != "function", "App.IndexController.filteredLogs n'est pas une proriété calculée mais une fonction, " +
                    "on aurait pas oublié '.property(...)' par hasard ?");

                indexCtrl.set('searchTerm', '');
                ok (indexCtrl.get('filteredLogs').length == 3, "Quand searchTerm est vide filteredLogs doit renvoyer toute la liste 'content");
                indexCtrl.set('searchTerm', 'A');
                ok (indexCtrl.get('filteredLogs').length == 3, "Si searchTerm='A' et que les logs on tous 'path' qui contient 'A', filteredLogs doit renvoyer toute la liste");
                indexCtrl.set('searchTerm', 'B');
                ok (indexCtrl.get('filteredLogs').length == 2, "Si searchTerm='B' et que deux logs on 'path' qui contient 'B', filteredLogs doit seulement renvoyer ces deux éléments");
                indexCtrl.set('searchTerm', 'BAB');
                ok (indexCtrl.get('filteredLogs').length == 1 && indexCtrl.get('filteredLogs')[0].path == 'BAB',
                    "Si searchTerm='BAB' et que seul un log a 'path' qui contient 'BAB', filteredLogs doit seulement renvoyer cet élément");

                indexCtrl.content.pushObject(Em.Object.create({path:"BABA", status: 200, method: "GET"}));
                ok (indexCtrl.get('filteredLogs').length == 2, "filteredLog ne prend pas en compte les changements des éléments de content");
            }

        }),
        Tuto.Step.create({
            title: "Création du filtre status",
            detailTemplateName: "tutorial-step-status",
            solutionTemplateName: "tutorial-solution-status",
            test:function(){

                var indexCtrl = App.IndexController.createWithMixins({
                    content : [
                        Em.Object.create({path:"AA", status: 400, method: "GET"}),
                        Em.Object.create({path:"BA", status: 200, method: "GET"}),
                        Em.Object.create({path:"BAB", status: 200, method: "GET"})
                    ],
                    _filteredLogsChangeFlag:false,

                    onChange:function(){
                        this.set('_filteredLogsChangeFlag', true);
                    }.observesBefore("filteredLogs"),

                    isFilteredLogsHasChanged:function(){
                        var lastFilteredLogsChangeFlagValue = this._filteredLogsChangeFlag;
                        this.set('_filteredLogsChangeFlag', false);
                        return lastFilteredLogsChangeFlagValue
                    }.property().volatile()
                });

                var toggleStatusChecked = function (statusCode){
                    var status = indexCtrl.statuses.find(function(currentStatus){
                        return statusCode == currentStatus.code;
                    });
                    status.toggleProperty('checked');
                }

                ok (typeof indexCtrl.get('statuses') != "undefined", "La propriété statuses n'existe pas encore.");
                ok (indexCtrl.get('statuses').length == 7, "Statuses ne contient pas le bon nombre d'élément ou n'est pas un tableau");

                ok (indexCtrl.get('filteredLogs').length == 3, "Si tous les status sont cochés on doit retourner toute la liste");

                toggleStatusChecked(400);
                ok (indexCtrl.get('isFilteredLogsHasChanged'), "filteredLogs n'est pas data-bindé sur la valeur checked de chaque élément de statues.")

                ok (indexCtrl.get('filteredLogs').length == 2, "Si on décoche uniquement 400 et que 'content' " +
                    "contient un log avec un code http égal à 400, il faut le filter.");

                toggleStatusChecked(400);
                toggleStatusChecked(200);
                ok (indexCtrl.get('filteredLogs').length == 1 && indexCtrl.get('filteredLogs')[0].get('path') == "AA",
                    "Si on décoche 200 uniquement et il n'y qu'un log dans 'content' qui n'a pas de code http égal à 200," +
                        "alors filteredLogs renvois uniquement ce log");

                toggleStatusChecked(200); // reset

                ok ($('#ember-app .ember-view #navigation').length > 0, "Il n'y a pas de div avec un id navigation dans l'index");
                ok ($('#ember-app .ember-view #navigation div:eq(0)').text() == "HTTP status",
                    "Il n'y a pas de div contenant le text \"HTTP status\" dans la div avec un id navigation, dans l'index");

                ok ($('#ember-app .ember-view #navigation ul:eq(0)').length > 0, "Il n'y a pas de ul dans la div navigation");
                templateContains('index', "<ul>{{#each", "Le helper each n'est pas utilisé dans l'index");
                templateContains('index', "}}<li>", "Le helper each doit être placé entre ul et li");
                templateContains('index', "statuses}}<li>", "Le helper each doit itérer la liste statuses");
                ok ($('#ember-app .ember-view #navigation ul:eq(0) li').length > 0, "Il n'y a pas de li dans le ul dans la div navigation");

                templateContains('index', "{{input", "Le helper input n'est pas utilisé dans l'index");
                ok(templates.index.indexOf("{{inputtype=\"checkbox\"") != -1 ||
                    templates.index.indexOf("{{inputtype='checkbox'") != -1, "Le helper input doit être de type checkbox");
                ok ($('#ember-app .ember-view #navigation ul:eq(0) li input[type="checkbox"]').length > 0, "Le helper input devrait être dans les li");

                ok ($('#ember-app .ember-view #navigation ul:eq(0) li label').length > 0, "La balise label n'est pas utiliser dans les li");
                templateContains("index", "code}}</label>", "Le code HTTP n'est pas dans le label");

                templateContains("index", 'checked=', 'La checkbox doit être lié au checked des status');
            }
        }),
        Tuto.Step.create({
            title: "Création du filtre method",
            detailTemplateName: "tutorial-step-method",
            solutionTemplateName: "tutorial-solution-method",
            test:function(){

                var indexCtrl = App.IndexController.createWithMixins({
                    content : [
                        Em.Object.create({path:"AA", status: 400, method: "PUT"}),
                        Em.Object.create({path:"BA", status: 200, method: "GET"}),
                        Em.Object.create({path:"BAB", status: 200, method: "GET"})
                    ],
                    _filteredLogsChangeFlag:false,

                    onChange:function(){
                        this.set('_filteredLogsChangeFlag', true);
                    }.observesBefore("filteredLogs"),

                    isFilteredLogsHasChanged:function(){
                        var lastFilteredLogsChangeFlagValue = this._filteredLogsChangeFlag;
                        this.set('_filteredLogsChangeFlag', false);
                        return lastFilteredLogsChangeFlagValue
                    }.property().volatile()
                });

                var toggleMethodChecked = function (code){
                    var method = indexCtrl.methods.find(function(currentMethod){
                        return code == currentMethod.code;
                    });
                    method.toggleProperty('checked');
                }

                ok (typeof indexCtrl.get('methods') != "undefined", "La propriété methods n'existe pas encore.");
                ok (indexCtrl.get('methods').length == 4, "Methods ne contient pas le bon nombre d'élément ou n'est pas un tableau");

                ok (indexCtrl.get('filteredLogs').length == 3, "Si tous les méthodes HTTP sont cochées on doit retourner toute la liste");

                toggleMethodChecked("PUT");
                ok (indexCtrl.get('isFilteredLogsHasChanged'), "filteredLogs n'est pas data-bindé sur la valeur checked de chaque élément de methods.")

                ok (indexCtrl.get('filteredLogs').length == 2, "Si on décoche uniquement PUT et que 'content' " +
                    "contient un log avec le verbe HTTP 'PUT', il faut le filter.");

                toggleMethodChecked("PUT");
                toggleMethodChecked("GET");

                ok (indexCtrl.get('filteredLogs').length == 1 && indexCtrl.get('filteredLogs')[0].get('path') == "AA",
                    "Si on décoche GET uniquement et il n'y qu'un log dans 'content' qui n'a pas de verbe HTTP GET," +
                        "alors filteredLogs renvois uniquement ce log");

                toggleMethodChecked("GET"); // reset

                ok ($('#ember-app .ember-view #navigation div:eq(1)').text() == "HTTP type",
                    "Il n'y a pas de div contenant le text \"HTTP type\" dans la div avec un id navigation, dans l'index");

                ok ($('#ember-app .ember-view #navigation ul:eq(1)').length > 0, "Il n'y a pas de ul dans la div navigation");
                templateContains('index', "methods}}<li>", "Le helper each doit itérer la liste methods");
                ok ($('#ember-app .ember-view #navigation ul:eq(1) li').length > 0, "Il n'y a pas de li dans le deuxième ul dans la div navigation");

                ok ($('#ember-app .ember-view #navigation ul:eq(1) li input[type="checkbox"]').length > 0, "Le helper input devrait être dans les li");

                ok ($('#ember-app .ember-view #navigation ul:eq(1) li label').length > 0, "La balise label n'est pas utiliser dans les li");
            }
        }),
        Tuto.Step.create({
            title: "Gérer les listes vides",
            detailTemplateName: "tutorial-step-empty-list",
            solutionTemplateName: "tutorial-solution-empty-list",
            test:function(){
                templateContains("index", "{{else}}<tr><td>", "Le helper else n'est pas utilisé dans l'index ou il ne contient rien");

            }
        })
    ];
});

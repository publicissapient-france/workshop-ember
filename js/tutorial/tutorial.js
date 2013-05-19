Ember.ENV.TESTING = true;
window.location.hash = "#/";
SyntaxHighlighter.defaults['gutter'] = false;

var registerHelper = Ember.Handlebars.registerBoundHelper;
var helpers = {};

Ember.Handlebars.registerBoundHelper = function (name, fn) {
    helpers[name] = fn;
    registerHelper(name, fn);
};

var bootstrap = Ember.Handlebars.bootstrap;
var templates = {};
Ember.Handlebars.bootstrap = function (ctx) {
    var selectors = 'script[type="text/x-handlebars"], script[type="text/x-raw-handlebars"]';

    Ember.$(selectors, ctx)
        .each(function () {
            var script = Ember.$(this);
            templateName = script.attr('data-template-name') || script.attr('id') || 'application';
            if (templateName.indexOf("tutorial") == -1) {
                templates[templateName] = script.html().replace(/\s+/g, '');
            }
        });
    bootstrap(ctx);
}


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
            execTestsSteps(Tuto.STEPS, 0);
            Em.run.later(function () {
                var stepIsActive = $(".is-active");
                if (stepIsActive.length > 0) {
                    $('#tutorial').animate({
                        scrollTop: $(".is-active").offset().top
                    }, 100);
                } else {
                    view.set('status', " terminé !")
                }
            }, 200);

            $('#tutorial img').on('click', function () {
                localStorage.removeItem("lastRuningTestIdx");
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

                ok(Em.TEMPLATES['application'] != undefined,
                    "Le template 'application' n'est pas déclaré.");

                templateContains("application", "Xebia/JS", "Le template application ne contient pas le bon titre et/ou les bonnes balises.")
            }
        }),
        Tuto.Step.create({
            title: "Création d'un datastore",
            detailTemplateName: "tutorial-step-ds",
            solutionTemplateName: "tutorial-solution-ds",
            test: function () {
                ok(Em.typeOf(App.Store) == 'class', "App.Store n'est pas définie.");
                ok(App.Store.create() instanceof DS.Store, "App.Store n'est pas de type DS.Store");
                ok(App.Store.prototype.revision == 12,
                    "La revision actuelle de App.Store est " + App.Store.prototype.revision
                        + " alors qu'elle devrait être 12");
            }
        }),
        Tuto.Step.create({
            title: "Création d'une classe Log",
            detailTemplateName: "tutorial-step-model",
            solutionTemplateName: "tutorial-solution-model",
            test: function () {
                ok(typeof App.Log != "undefined",
                    "App.Log n'est pas définie.");

                ok(Em.typeOf(App.Log) == "class",
                    "App.Log n'est pas une classe ember.");

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

                ok (templates.index.indexOf("<div") != -1, "Le template ne contient pas de balise div");
                ok (templates.index.indexOf("content") != -1, "Le template ne contient pas l'id content");
                ok (templates.index.indexOf("<table>") != -1, "Le template ne contient pas de balise table");

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
                ok (typeof log.get('path') != "undefined",
                    "App.Log.path n'est pas pas définie");

                ok (typeof log.path != "function",
                    "App.Log.path n'est pas une proriété calculée mais une fonction, " +
                        "on aurait pas oublié '.property(...)' par hasard ?");

                ok (log.get("path") == "/js/messages_fr.js", "Si request = 'GET /js/messages_fr.js HTTP/1.1' path devrait valoir '/js/messages_fr.js' " +
                    "et non pas "+ log.get("path"));

                log.set('request', 'GET /js/messages_en.js HTTP/1.1');
                ok (log.get("path") == "/js/messages_en.js", "La propriété calculée path ne dépend pas de request");

                ok (templates.index.indexOf("path}}") != -1, "La propriété path n'est pas utilisée dans le template index");


                ok (typeof log.get('method') != "undefined",
                    "App.Log.method n'est pas pas définie");

                ok (typeof log.method != "function",
                    "App.Log.method n'est pas une proriété calculée mais une fonction, " +
                        "on aurait pas oublié '.property(...)' par hasard ?");

                ok (log.get("method") == "GET", "Si request = 'GET /js/messages_fr.js HTTP/1.1' method devrait valoir 'GET' " +
                    "et non pas "+ log.get("method"));

                log.set('request', 'POST /js/messages_en.js HTTP/1.1');
                ok (log.get("method") == "POST", "La propriété calculée method ne dépend pas de request");

                ok (templates.index.indexOf("method}}") != -1, "La propriété method n'est pas utilisée dans le template index");
            }

        }),
        Tuto.Step.create({
            title: "Création de helpers"
        }),
        Tuto.Step.create({
            title: "Création d'une page de consultation"
        }),
        Tuto.Step.create({
            title: "Création d'un lien vers la home dans le header"
        }),
        Tuto.Step.create({
            title: "Création du filtre de recherche"
        }),
        Tuto.Step.create({
            title: "Création du filtre status"
        }),
        Tuto.Step.create({
            title: "Création du filtre method"
        }),
        Tuto.Step.create({
            title: "Gérer les listes vides"
        }),

        /*

,
         Tuto.Step.create({
         title: "Créer une propriété calculée",
         detailTemplateName: "tutorial-step-computed",
         solutionTemplateName: "tutorial-solution-computed",
         test: function () {

         ok (typeof App.Pony.createRecord({}).get('name') != "undefined",
         "App.Pony.name n'est pas pas définie");

         ok (typeof App.Pony.createRecord({}).name != "function",
         "App.Pony.name n'est pas une proriété calculée mais une fonction, " +
         "on aurait pas oublié '.property(...)' par hazard ?");

         var pony = App.Pony.createRecord({
         firstName :'AA',
         lastName: 'BB'
         });
         ok (pony.get("name") == "AA BB", "Si firstName = 'AA' et lastName = 'BB' name devrait valoir 'AA BB' " +
         "et non pas "+ pony.get("name"));

         pony.set('firstName', 'CC');
         ok (pony.get("name") == "CC BB", "La propriété calculée name ne dépend pas de firstName");

         pony.set('lastName', 'DD');
         ok (pony.get("name") == "CC DD", "La propriété calculée name ne dépend pas de lastName");
         pony.deleteRecord();

         ok (templates.index.indexOf("name}}") != -1, "La propriété name n'est pas utilisée dans le template index");
         }
         }),
         Tuto.Step.create({
         title: "Créer une route consultation",
         detailTemplateName: "tutorial-step-consultation",
         solutionTemplateName: "tutorial-solution-consultation",
         test: function () {

         var appRouter = App.__container__.lookup('router:main');

         ok (appRouter.hasRoute('detail'), "Il n'y pas de route 'detail' déclarée dans le router.");

         ok(Em.TEMPLATES['detail'] != undefined, "Le template 'detail' n'est pas déclaré.");

         templateContains('detail','name}}', "Le nom n'est pas affiché dans le détail.");
         templateContains('detail','type}}', "Le type n'est pas affiché dans le détail.");
         templateContains('detail','color}}', "La couleur n'est pas affichée dans le détail.");

         templateContains('index', "{{#linkTodetail" , "Le helper linkTo n'est pas utilisé dans le template index.");
         }
         }),
         Tuto.Step.create({
         title: "Créer un lien vers la home",
         detailTemplateName: "tutorial-step-home",
         solutionTemplateName: "tutorial-solution-home",
         test: function () {
         ok(templates.application.indexOf('{{#linkTo') != - 1 &&
         templates.application.indexOf('{{/linkTo') != - 1, "Le template application ne contient pas de linkTo");

         ok(templates.application.indexOf('{{#linkToindex}}') != -1, "LinkTo doit pointer vers index");
         ok(templates.application.indexOf('<h1>{{#linkToindex}}') != -1, "LinkTo doit être entre les h1");
         ok ($('#ember-app div a').attr('href') == "#/", "Le lien du titre pointe vers "+
         $('#ember-app div a').attr('href') + " alors qu'il devrait pointer vers '#/'.");
         }
         }),
         Tuto.Step.create({
         title: "Créer une page d'ajout",
         detailTemplateName: "tutorial-step-add",
         solutionTemplateName: "tutorial-solution-add",
         test: function () {
         var appRouter = App.__container__.lookup('router:main');

         ok (templates.index.indexOf("{{#linkToadd}}") != -1 &&
         templates.index.indexOf("{{/linkTo}}") != -1
         , "Le template index ne contient pas de linkTo vers la route add");

         ok (appRouter.hasRoute('add'), "Il n'y pas de route 'add' déclarée dans le router.");
         ok(Em.TEMPLATES['add'] != undefined, "Le template 'add' n'est pas déclaré.");

         templateContains('add',"{{inputvalue=firstName}}", "Le template add ne contient pas de helper input pour le firstName");
         templateContains('add',"{{inputvalue=lastName}}", "Le template add ne contient pas de helper input pour le lastName");
         templateContains('add',"{{inputvalue=color}}", "Le template add ne contient pas de helper input pour le color");
         templateContains('add',"{{inputvalue=type}}", "Le template add ne contient pas de helper input pour le type");

         ok (Em.typeOf(App.AddRoute) == 'class', "App.AddRoute n'est pas définie ou n'est pas une classe Ember.");
         ok (App.AddRoute.create() instanceof Em.Route, "App.AddRoute n'est pas de type Ember.Route");
         ok (App.AddRoute.prototype.model(),
         "La méthode 'model' de App.AddRoute ne renvoie rien ou n'est pas définie.");
         ok (App.AddRoute.prototype.model().id > 0,
         "La méthode 'model' de App.AddRoute ne renvois pas d'objet avec un id");

         ok (Em.typeOf(App.AddController) == "class",
         "App.AddController n'est pas définie ou n'est pas une classe Ember");

         ok (Em.typeOf(App.AddController.create().savePony) == "function",
         "La fonction 'savePony' de App.AddController n'est pas définie ou n'est pas une fonction");


         templateContains('add',"{{action", "Le template add ne contient d'action");
         templateContains('add',"{{actionsavePony}}", "Le template contient une action mais elle n'appelle pas savePony");

         var createRecord = App.Pony.createRecord, createRecordCall = 0;
         var addController = App.AddController.create({store:{
         commit : function(){}}
         });
         var transitionToRoute = addController.transitionToRoute, transitionToRouteCall = 0, goodRoute = false;

         App.Pony.createRecord = function(){ createRecordCall++ };
         addController.transitionToRoute = function(route){
         transitionToRouteCall++;
         goodRoute = route == "index";
         };

         addController.savePony();

         ok (createRecordCall == 1, "App.Pony.createRecord doit être appelé une fois dans savePony");
         ok (transitionToRouteCall == 1, "transitionToRoute doit être appelé une fois dans savePony");
         ok (goodRoute, "transitionToRoute doit être appelé avec comme paramètre index pour retourner sur l'index de l'application.");

         App.Pony.createRecord = createRecord;
         }
         }),
         Tuto.Step.create({
         title: "Utiliser l'API Rest",
         detailTemplateName: "tutorial-step-rest",
         solutionTemplateName: "tutorial-solution-rest",
         test: function () {
         ok (App.Store.prototype.adapter == "DS.RESTAdapter",
         "L'adapter actuel de App.Store est '"+ App.Store.prototype.adapter +"'" +
         " alors qu'il devrait être 'DS.RESTAdapter'");


         ok (typeof App.Pony.FIXTURES == "undefined",
         "App.Poney.FIXTURES n'est plus utile maintenant, supprimer le.");

         var commitCall = 0;
         var addController = App.AddController.create({
         store:{
         commit : function(){
         commitCall++;
         }
         },
         transitionToRoute:function(){

         }
         });
         addController.savePony();
         ok (commitCall == 1, "la méthode commit de l'objet store doit être appelé une fois dans savePony")
         }
         }),
         Tuto.Step.create({
         title: "Utiliser un Helper",
         detailTemplateName: "tutorial-step-helper",
         solutionTemplateName: "tutorial-solution-helper",
         test: function () {
         ok (helpers.upperCase != undefined, "Le helper 'upperCase' n'est pas définie.");
         ok (helpers.upperCase('salut') === "SALUT", "Le helper 'upperCase' doit retourner la chaine passée en argument en majuscule");

         templateContains("detail", "{{upperCase", "Le helper upperCase n'est pas utilisé dans le template detail");
         }
         })
         */
    ];
});

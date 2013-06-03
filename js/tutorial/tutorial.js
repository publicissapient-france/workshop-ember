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
                    view.set('status', " terminé !")
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
                templateContains("application", "<header>", "Le template application ne contient pas le bon titre et/ou les bonnes balises.");
                templateContains("application", '<imgsrc="img/logo.png"' , "Le template application ne contient pas le logo avec sa balise img.");
                templateContains("application", "</header>", "Le template application ne contient pas le bon titre et/ou les bonnes balises.")
            }
        }),
        Tuto.Step.create({
            title: "Création d'un datastore",
            detailTemplateName: "tutorial-step-ds",
            solutionTemplateName: "tutorial-solution-ds",
            test: function () {
                ok(Em.typeOf(App.Store) == 'class', "App.Store n'est pas définie.");
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


                ok (typeof log.get('method') != "undefined", "App.Log.method n'est pas pas définie");

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
            title: "Création de helpers",
            detailTemplateName: "tutorial-step-helper",
            solutionTemplateName: "tutorial-solution-helper",
            test: function () {
                ok (helpers.size != undefined, "Le helper 'size' n'est pas définie.");
                ok (helpers.size(180) === "180 B", "Si le on donne 180 au helper il devrait retourner '180 B' or il retourne "+helpers.size(180));
                ok (helpers.size(2202) === "2.15 kB", "Si le on donne 2202 au helper il devrait retourner '2.15 kB' or il retourne "+helpers.size(2202));

                templateContains("index", "{{size", "Le helper size n'est pas utilisé dans le template index");
            }
        }),
        Tuto.Step.create({
            title: "Création d'une page de consultation",
            detailTemplateName: "tutorial-step-consultation",
            solutionTemplateName: "tutorial-solution-consultation",
            test: function () {

                var appRouter = App.__container__.lookup('router:main');

                ok (appRouter.hasRoute('detail'), "Il n'y pas de route 'detail' déclarée dans le router.");

                ok(Em.TEMPLATES['detail'] != undefined, "Le template 'detail' n'est pas déclaré.");

                ok(templates.index.indexOf('<tbody><tr>') == -1, "La balise tr dans le tbody doit être remplacée par un helper linkTo avec la propriété tagName='tr'");
                ok(templates.index.indexOf('{{#linkTo') != -1, "Le helper linkTo n'est pas utilisé dans l'index");

                ok(templates.index.indexOf("tagName=\"tr\"") != -1 ||
                    templates.index.indexOf("tagName='tr'") != -1, "LinkTo doit avoir un tagName='tr'");

                ok(templates.index.indexOf("{{#linkTo'detail'") != -1 ||
                   templates.index.indexOf("{{#linkTodetail") != -1, "LinkTo doit pointer sur la route 'detail'");

                ok(templates.index.indexOf("{{#linkTo'detail'tagName") == -1 &&
                    templates.index.indexOf("{{#linkTodetailtagName") == -1, "LinkTo doit aussi passer le log courant à la route 'detail'");

                templateContains('detail','useragent}}', "Le useragent n'est pas affiché dans le détail.");
            }
        }),
        Tuto.Step.create({
            title: "Création d'un lien vers la home dans la consultation",
            detailTemplateName: "tutorial-step-home",
            solutionTemplateName: "tutorial-solution-home",
            test: function () {
                ok(templates.application.indexOf('{{#linkTo') != - 1 &&
                    templates.application.indexOf('{{/linkTo') != - 1, "Le template application ne contient pas de linkTo");

                ok(templates.application.indexOf('{{#linkToindex}}') != -1, "LinkTo doit pointer vers index");
            }
        }),
        Tuto.Step.create({
            title: "Création du filtre de recherche",
            detailTemplateName: "tutorial-step-search",
            solutionTemplateName: "tutorial-solution-search",
            test:function(){
                templateContains('application', '<div>',"Il n'y a pas de balise div dans la balise header du template application.");
                templateContains('application', '{{input',"L'helper input n'est pas utilisé dans le template application.");
                templateContains('application', '<div>{{input',"L'helper input n'est pas au bon endroit. Il doit être dans la div.");
                ok(templates.application.indexOf("type=\"text\"") != - 1 || templates.application.indexOf("type='text'") != - 1, "Le helper input doit être de type text");
                templateContains('application','value=searchTerm',"Le helper input doit avoir comme valeur la propriété 'searchTerm'");
                templateContains('application', '<aclass="search_clear"href="#"></a>',"Il n'y a pas la petite croix dans le champ de recherche.");
                templateContains('application', '<aclass="search_clear"href="#"></a></div>',"Le petite croix doit être dans la balise div");

                ok (Em.typeOf(App.IndexController) == "class", "App.IndexController n'est pas définie ou n'est pas une classe Ember");
                ok (App.IndexController.create() instanceof Em.ArrayController, "App.IndexController n'est pas de type Ember.ArrayController");

                var indexCtrl = App.IndexController.create({
                    content : [ Em.Object.create({path:"AA"}), Em.Object.create({path:"BA"}), Em.Object.create({path:"BAB"}) ]
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

                indexCtrl.content.pushObject(Em.Object.create({path:"BABA"}));
                ok (indexCtrl.get('filteredLogs').length == 2, "filteredLog ne prend pas en compte les changements des éléments de content");
            }

        }),
        Tuto.Step.create({
            title: "Création du filtre status",
            detailTemplateName: "tutorial-step-status",
            solutionTemplateName: "tutorial-solution-status"
        }),
        Tuto.Step.create({
            title: "Création du filtre method",
            detailTemplateName: "tutorial-step-method",
            solutionTemplateName: "tutorial-solution-method"
        }),
        Tuto.Step.create({
            title: "Gérer les listes vides",
            detailTemplateName: "tutorial-step-empty-list",
            solutionTemplateName: "tutorial-solution-empty-list"
        })
    ];
});

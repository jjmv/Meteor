Todos = new Mongo.Collection('todos');
Lists = new Mongo.Collection('lists');

Router.configure({

    layoutTemplate: 'main'

});


if(Meteor.isClient){

    Template.todos.helpers({
        
        'todo': function(){
            var currentList = this._id;
            var currentUser = Meteor.userId();
            return Todos.find({listId: currentList, createdBy: currentUser},{sort: {createdAt: -1}});
        }

    });//todos Helpers end

    Template.todoItem.helpers({

        'checked': function(){
            var isCompleted = this.completed;
            if(isCompleted){
                return "checked";
            }else{
                return "";
            }
        }

    });//Fin todoItem helpers

    Template.todosCount.helpers({

        'totalTodos': function(){
            var currentList = this._id;
            return Todos.find({ listId: currentList }).count();
        },

        'completedTodos': function(){
            var currentList = this._id;
            return Todos.find({ listId: currentList, completed: true }).count();
        }

    });//Fin de todoCounts helper

    Template.lists.helpers({
        'list': function(){
            var currentUser = Meteor.userId();
            return Lists.find({createdBy: currentUser}, {sort: {name: 1}});
        }
    });


    Template.addTodo.events({

        'submit form': function(event){
            event.preventDefault();
            var todoName = $('[name = "todoName"]').val();
            var length = todoName.length;
            var currentUser = Meteor.userId();
            var currentList = this._id;
            if(length >= 1){
                Todos.insert({
                    name: todoName,
                    completed: false,
                    createdAt: new Date(),
                    createdBy: currentUser,
                    listId: currentList
                });// Insert end
                $('[name = "todoName"]').val('');
            }else{
                alert("Add an acceptable task.")
            }
            

        }, // Submit form event end

       

    }); // end of the addTodo template events

    Template.todoItem.events({
        
        'click .delete-todo': function(event){
            event.preventDefault();
            var documentId = this._id;
            var confirm = window.confirm("Delete this task?");
            if(confirm){
                Todos.remove({ _id: documentId });
            }
        },// end of the delete-todo event

        // keyup hace que la funcion se ejecute cada vez que se presiona una tecla
        'keyup [name=todoItem]': function(event){
            if(event.which == 13 || event.which == 27){
                //.blur hace que el target del evento, que en este caso en el field  de unfocus
                $(event.target).blur();
            }else{
                var documentId = this._id;
                //Si utilizamos el '[name = "todoName"]' el valor se borra
                var todoItem = $(event.target).val();
                Todos.update({ _id: documentId }, {$set: { name: todoItem }});
                console.log("Task changed to: " + todoItem);
                
            }// FIN ELSE

        },// FIN KEYUP - EDITAR

        'change [type=checkbox]': function(){
            var documentId = this._id;
            var isCompleted = this.completed;
            if(isCompleted){
                Todos.update({ _id: documentId }, {$set: { completed: false }});
                console.log("Task marked as incomplete.");
            } else {
                Todos.update({ _id: documentId }, {$set: { completed: true }});
                console.log("Task marked as complete.");
            }
        }



    }); //Fin del todoItem  events
    
    Template.addList.events({
        'submit form': function(event){
          event.preventDefault();
          var listName = $('[name=listName]').val();
          var currentUser = Meteor.userId();
          Lists.insert({
            name: listName,
            createdBy : currentUser
          }, function(error, results){
              // Con Router.go nos lleva a la ruta con el nombre listPage y
              //pasamos el parametro _id  para mostrar la lista en especifico
              Router.go('listPage', {_id: results});
              
          });
          $('[name=listName]').val('');
        }
    });

    Template.register.events({

        'submit form': function(event){
            event.preventDefault();
            /*
            var email = $('[name=email]').val();
            var password = $('[name=password]').val();
            //Accounts.createUser es una funcion del paquete account-password verifica
            //que no haya ninguna cuenta igual ya guardada y que encripta la contraseña
            //antes de ser enviada al servidor
            Accounts.createUser({
                email: email,
                password: password
            }, function(error){
                if(error){
                    console.log(error.reason);
                }else{
                    Router.go('home');
                }
            });
            */
        }

    }); //Fin de los eventos del template register

    Template.navigation.events({
        
        'click .logout': function(event){
            event.preventDefault();
            Meteor.logout();
            Router.go('login');
        }
    });// Fin de los eventos de navigation

    Template.login.events({

        'submit form': function(event){
            event.preventDefault();
            /*
            var email = $('[name=email]').val();
            var password = $('[name=password]').val();
            Meteor.loginWithPassword(email, password, function(error){
                if(error){
                    console.log(error.reason);
                } else {
                    var currentRoute = Router.current().route.getName();
                    if(currentRoute == "login"){
                        Router.go("home");
                    }
                }
            });
            */
        }
    });//Fin de los eventos login

    //Funcion que se ejecuta cuando se entra al template Login
    Template.login.onCreated(function(){
        console.log("The 'login' template was just created.");
    });
    
    //Funcion que se ejecuta una vez rendereado el template login
    
    Template.login.onRendered(function(){
        //validate es una funcion del paquete de jquery que nos validara el formulario con
        //la clase login
        var validator =$('.login').validate({
            submitHandler: function(event){
                var email = $('[name=email]').val();
                var password = $('[name=password]').val();
                Meteor.loginWithPassword(email, password, function(error){
                    if(error){
                        //Usamos estos condicionales para saber si el error corresponde a 
                        //el email o a la contraseña
                        if(error.reason == "User not found"){
                            validator.showErrors({
                                email: "That email does not belong to a registeres user"
                            });
                        }
                        if(error.reason == "Incorrect password"){
                            validaor.showErrors({
                                password: "You entered an incorrect password"
                            });
                        }
                    } else {
                        var currentRoute = Router.current().route.getName();
                        if(currentRoute == "login"){
                            Router.go("home");
                        }
                    }
                });
            }
        });
    });//Fin de la funcion onRendered del template login
    
    Template.login.onDestroyed(function(){
        console.log("The 'login' template was just destroyed.");
    });

    //onRendered para el template register
    Template.register.onRendered(function(){
        var validator = $('.register').validate({
            submitHandler: function(event){
                var email = $('[name=email]').val();
                var password = $('[name=password]').val();
                //Accounts.createUser es una funcion del paquete account-password verifica
                //que no haya ninguna cuenta igual ya guardada y que encripta la contraseña
                //antes de ser enviada al servidor
                Accounts.createUser({
                    email: email,
                    password: password
                }, function(error){
                    if(error){
                        if(error.reason == "Email already exists."){
                            validator.showErrors({
                                email: "This email is already registered"
                            });
                        }
                    }else{
                        Router.go('home');
                    }
                });
            }
        });
    });

    //Son los valores por default que tendra el validador para validar
    $.validator.setDefaults({
        rules: {
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 6
            }
        },
        messages: {
            email: {
                required: "You must enter an email address.",
                email: "You've entered an invalid email address."
            },
            password: {
                required: "You must enter a password.",
                minlength: "Your password must be at least {0} characters."
            }
        }
    });
    

    Meteor.subscribe('lists');

}// Fin del isClient 


if(Meteor.isServer){
    
    Meteor.publish("lists", function(currentList){
        var currentUser = this.userId;
        return Lists.find({createdBy: currentUser, listId : currentList});
    });

    Meteor.publish('todos', function(){
        var currentUser = this.userId;
        return Todos.find({ createdBy: currentUser })
    });

}// Fin del isServer

//Routes
Router.route('/register');
Router.route('/login');
Router.route('/',{
    name: 'home',
    template: 'home'
});
Router.route('/list/:_id',{
    name: 'listPage',
    template: 'listPage',
    data: function(){
        var currentList = this.params._id;
        var currentUser = Meteor.userId();
        return Lists.findOne({_id: currentList, createdBy: currentUser});
    },
    //onBeforeAction ejecuta una funcion antes de renderea el template, se le llaman hooks
    onBeforeAction : function(){
        var currentUser = Meteor.userId();
        if(currentUser){
            //Con this.next() le decimos IronRouter que haga lo que normalmente haria, debido a que
            //si hay un usuario logeado
            this.next();
        }else{
            //this.render renderea un template
            //En este caso en de login ya que se intentó accesar a una ruta especifica de usuarios logeados.
            this.render("login");

        }

    },
    subscriptions: function(){
        var currentList = this.params._id;
        return Meteor.subscribe('todos', currentList);
    }
});
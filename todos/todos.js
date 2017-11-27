Todos = new Mongo.Collection('todos');
Lists = new Mongo.Collection('lists');

Router.configure({

    layoutTemplate: 'main'

});


if(Meteor.isClient){

    Template.todos.helpers({
        
        'todo': function(){
            var currentList = this._id;
            return Todos.find({listId: currentList},{sort: {createdAt: -1}});
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
            return Lists.find({}, {sort: {name: 1}});
        }
    });


    Template.addTodo.events({

        'submit form': function(event){
            event.preventDefault();
            var todoName = $('[name = "todoName"]').val();
            var length = todoName.length;
            var currentList = this._id;
            if(length >= 1){
                Todos.insert({
                    name: todoName,
                    completed: false,
                    createdAt: new Date(),
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
          Lists.insert({
            name: listName
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
            var email = $('[name=email]').val();
            var password = $('[name=password]').val();
            //Accounts.createUser es una funcion del paquete account-password verifica
            //que no haya ninguna cuenta igual ya guardada y que encripta la contraseña
            //antes de ser enviada al servidor
            Accounts.createUser({
                email: email,
                password: password
            });
            Router.go('home');
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
            event.prevenDefault();
            var email = $('[name=email]').val()
            var password = $('[name=password]').val()
            Meteor.loginWithPassword(email, password);
        }
    })//Fin de los eventos login
    



}// Fin del isClient 

if(Meteor.isServer){

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
        return Lists.findOne({_id: currentList});
    }
});
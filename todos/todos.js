Todos = new Mongo.Collection('todos');




if(Meteor.isClient){

    Template.todos.helpers({
        
        'todo': function(){
            return Todos.find({},{sort: {createdAt: -1}});
        }

    });// Helpers end


    Template.addTodo.events({

        'submit form': function(event){
            event.preventDefault();
            var todoName = $('[name = "todoName"]').val();
            var length = todoName.length;
            if(length >= 1){
                Todos.insert({
                    name: todoName,
                    completed: false,
                    createdAt: new Date()
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
                
            }

        }



    });



}// Fin del isClient 


if(Meteor.isServer){

}
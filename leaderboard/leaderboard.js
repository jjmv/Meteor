PlayersList = new Mongo.Collection('players');

if(Meteor.isClient){
    //Template keyword busca en todos los templates dentro de nuestro proyecto Meteor
    //leaderborad keyword es la refencia a el nombre del teplate que creamos
    //helpers
    Template.leaderboard.helpers({
        'player': function(){
            var currentUserId = Meteor.userId();
            //Si las primeras llaves estan vacias, trae todos lo de esa coleccion
            //con createdBy: currentUserId traera solo los que tengan un createdBy
            return PlayersList.find({createdBy: currentUserId}, 
                                    {sort:{score: -1, name: 1}});
        },
        'selectedClass': function(){
            var playerId = this._id;
            var selectedPlayer = Session.get('selectedPlayer');
            if(playerId == selectedPlayer){
                return "selected";
            }
        },
        'selectedPlayer': function(){
            var selectedPlayer = Session.get('selectedPlayer');
            //A diferencia del find(), findOne() detendra la busqueda cuando encuentre la relacion
            return PlayersList.findOne({_id: selectedPlayer});
        }

      
    });
    //Casi lo mismo que helpers
    Template.leaderboard.events({
        'click .player': function(){
            var playerId = this._id;
            var playerScore = this.score;
            //Las sessiones guardan pequeña informacion pero no en la base de datos
            Session.set('selectedPlayer', playerId);
            Session.set('selectedPlayerScore',playerScore);
            var selectedPlayer = Session.get('selectedPlayer');
            var selectedPlayerScore = Session.get('selectedPlayerScore');
            console.log("Score del jugador seleccionado")
            console.log(selectedPlayerScore)
        },
        'click .increment': function(){
            var selectedPlayer = Session.get('selectedPlayer');
            var selectedPlayerScore = Session.get('selectedPlayerScore');
            Meteor.call('updateScore', selectedPlayer, 5);
        },
        'click .decrement': function(){
            var selectedPlayer = Session.get('selectedPlayer');
            var selectedPlayerScore = Session.get('selectedPlayerScore');
            console.log(selectedPlayerScore);
            Meteor.call('updateScore', selectedPlayer, -5, selectedPlayerScore);
        },
        'click .remove': function(){
            var selectedPlayer = Session.get('selectedPlayer');
            Meteor.call('removePlayer', selectedPlayer);
        }
    })

    Template.addPlayerForm.events({
        'submit form': function(event){
            event.preventDefault();
            //Usamos Meteor.call para llamar un metodo definido en el server
            var PlayerNameVar = event.target.playerName.value;
            Meteor.call('createPlayer', PlayerNameVar);
            event.target.playerName.value = "";
        }


    })

    Meteor.subscribe('thePlayers');

}// isClient end
        //we’ve defined the event type. That’s the click part. Because of this, 
        //the code inside the associated function will execute when a user clicks 
        //anywhere within the bounds of the “leaderboard” template.
if(Meteor.isServer){
    //En esta funcion la referenciamos  con el nombre de 'thePlayers' y dentro de esa funcion mandamos llamar el ID
    //del user que está logeado y traemos los jugadores que fueron creados or el usuario logeado
    //si no hay nadie logeado no "publicara ninguna informacion"
    Meteor.publish('thePlayers', function(){
        var currentUserId = this.userId;
        return PlayersList.find({createdBy: currentUserId});
    });
    
    Meteor.methods({
        'createPlayer': function(PlayerNameVar){
            //con el metodo check, que debe ser añadido con anterioridad, podemos validar que los datos
            //vienen en el formato que queremos, si el usuario intenta pasar información que no corresponde
            //el resto del código no se ejecutara
            check('PlayerNameVar', String);
            var currentUserId = Meteor.userId();
            //Este condicional ayuda a que ningun usuario que no esté logeado pueda ejecutar el insert
            if(currentUserId){
                PlayersList.insert({
                    name: PlayerNameVar,
                    score: 0,
                    createdBy : currentUserId
                });
            }
        },//Fin del método createPlayer
        'removePlayer': function(selectedPlayer){
            check('selectedPlayer', String);
            var currentUserId = Meteor.userId();
            if(currentUserId){
                PlayersList.remove({_id : selectedPlayer, createdBy: currentUserId});
            }


        },//Fin del método removePlayer
        'updateScore': function(selectedPlayer, scoreValue, selectedPlayerScore){
            console.log(selectedPlayerScore)
            check(selectedPlayer, String);
            check(scoreValue, Number);
            var currentUserId = Meteor.userId();
            if(scoreValue == 5 && currentUserId){
                PlayersList.update({_id: selectedPlayer, createdBy: currentUserId},
                    {$inc: {score: scoreValue}});
            }
            if(selectedPlayerScore >= 0 && currentUserId){
                PlayersList.update({_id: selectedPlayer, createdBy: currentUserId},
                    {$inc: {score: scoreValue}});
            }
            
            
            
            
        } //Fin del método updateScore
    });
}


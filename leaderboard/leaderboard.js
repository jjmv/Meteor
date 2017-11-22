PlayersList = new Mongo.Collection('players');

if(Meteor.isClient){
    console.log("Hello Client");
    //Template keyword busca en todos los templates dentro de nuestro proyecto Meteor
    //leaderborad keyword es la refencia a el nombre del teplate que creamos
    //helpers
    Template.leaderboard.helpers({
        'player': function(){
            return PlayersList.find({}, {sort:{score: -1, name: 1}});
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
            //Las sessiones guardan pequeña informacion pero no en la base de datos
            Session.set('selectedPlayer', playerId);
            var selectedPlayer = Session.get('selectedPlayer');
            console.log(selectedPlayer);
        },
        'click .increment': function(){
            var selectedPlayer = Session.get('selectedPlayer');
            PlayersList.update({_id: selectedPlayer},{$inc: {score: 5}});
        },
        'click .decrement': function(){
            var selectedPlayer = Session.get('selectedPlayer');
            PlayersList.update({_id: selectedPlayer},{$inc: {score: -5}});
        }
    })
    
}
        //we’ve defined the event type. That’s the click part. Because of this, 
        //the code inside the associated function will execute when a user clicks 
        //anywhere within the bounds of the “leaderboard” template.
if(Meteor.isServer){
    
}


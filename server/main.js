import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
});

PlayersList = new Mongo.Collection('players');
console.log("Hello World");
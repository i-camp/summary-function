const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.summery_score =
  functions.pubsub.topic('every-minute-tick').onPublish((event) => {
    // Get current game id on e-party2017/currentGame/id
    var db = admin.database();
    var current_game_id_ref = db.ref("/currentGame/id");

    current_game_id_ref.on("value", function(snapshot) { 
      var current_game_id = snapshot.val();
      console.log("current game id: " + snapshot.val());
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

 
    // Get target of the bullets for summary
    /*
    var current_game_commits_ref = db.ref("/Commits" + current_game_id)

    current_game_commits_ref.on("value", function(snapshot) {
      const current_game_commits = snapshot.val();
      console.log("current_game_commits" + snapshot.val());
    }, function (errorObject) {
      console.log("The read failed" + errorObject.code);
    });
    */

    // Calc for each target  

    // Post liveHp on e-party2017/currentGame/targets/*/liveHp
  });

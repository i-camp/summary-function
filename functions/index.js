const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Get current game on e-party2017/currentGame
const db = admin.database();
const currentGameRef = db.ref("/currentGame");

exports.summaryScore = functions.pubsub.topic('every-minute-tick').onPublish(event => {

  currentGameRef.once("value", snapshot => {
    let currentGame = snapshot.val();
    // ゲームが開始されていること
    if (
      currentGame.id !== undefined
      && currentGame.openedAt !== undefined
    ) {
      summaryObservation(currentGame);
    }
    
  });

});

let targets = {};

const summaryObservation = currentGame => {

  console.log(currentGame);
  const currentGameCommitsRef = db.ref(`/commits/${currentGame.id}`);

  targets = currentGame.targets;
  // スコアを0にする
  for (let key in targets) {
    targets[key].plus = 0;
    targets[key].minus = 0;
  }
  
  currentGameCommitsRef.once("value", snapshot => {
    for (let commit of snapshot.val()) {
      // currentGameのtargetsにあること
      if (typeof targets[commit.target] !== "undefined") {
        targetFnc.addPlus(commit.target, commit.plus);
        targetFnc.addMinus(commit.target, commit.minus);
      }
    };

    // まとめたデータをcurrentGameに戻す
    db.ref('/currentGame/targets').update(targets);
    
    return true;

  });
  
};

let targetFnc = {
  addPlus: function(name, score) {
    targets[name].plus = targets[name].plus + score;
  },
  addMinus: function(name, score) {
    targets[name].minus = targets[name].minus + score;
  }
};

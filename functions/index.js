const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Get current game on e-party2017/currentGame
const db = admin.database();
const currentGameRef = db.ref("/currentGame");

exports.summaryScore = functions.pubsub.topic('every-minute-tick').onPublish(event => {

  currentGameRef.on("value", snapshot => {
    console.log(snapshot.val());
    let currentGame = snapshot.val();

    // ゲームが開始されていること
    if (
      currentGame.id !== undefined
      && currentGame.openedAt !== undefined
      && currentGame.endAt === undefined
    ) {
      summaryObservation(currentGame);
    }
    
  });

});

const summaryObservation = currentGame => {
  let currentGameCommitsRef = db.ref(`/commits/${currentGame.id}`);
  let targets = targets();
  currentGameCommitsRef.once("value", snapshot => {
    console.log(snapshot.val());
    targets.addTarget(snapshot.val().target);
    targets.addPlus(target, snapshot.val().plus);
    targets.addMinus(target, snapshot.val().minus);
  });
  console.log(targets);
  
  Object.keys(targets.targets).forEach(name => {
    console.log(targets.targets[name]);
    Object.keys(currentGame.targets).forEach(key => {
      if (currentGame.targets[key].name === name) {
        // まとめたデータをcurrentGameに戻す
        db.ref(`/currentGame/${currentGame.id}/targets/${key}`).update({
          plusPoin: targets.targets[name].plus,
          minusPoint: targets.targets[name].minus
        });
      } 
    });
  });
  
  
};

let targets = () => {
  return {
    targets: [],
    addTarget: (name) => {
      if (this.targets[name] === undefined) {
        this.targets[name] = {plus, minus};
      }
    },
    addPlus: (name, score) => {
      this.targets[name].plus = this.targets[name].plus + score;
    },
    addMinus: (name, score) => {
      this.targets[name].minus = this.targets[name].minus + score;
    }
  }; 
};

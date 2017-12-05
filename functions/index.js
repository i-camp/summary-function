const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Get current game on e-party2017/currentGame
const db = admin.database();
const currentGameRef = db.ref("/currentGame");

exports.summaryScore = functions.pubsub.topic('every-minute-tick').onPublish(event => {

  currentGameRef.on("value", snapshot => {
    // console.log(snapshot.val());
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

const summaryObservation = currentGame => {
  let currentGameCommitsRef = db.ref(`/commits/${currentGame.id}`);
  let targets = targets();
  currentGameCommitsRef.on("value", snapshot => {
    console.log(snapshot.val());

    let target = snapshot.val().target;
    targets.addTarget(target);
    targets.addPlus(target, snapshot.val().plus);
    targets.addMinus(target, snapshot.val().minus);
  });
  // TODO まとめたデータをcurrentGameに戻す
  Object.keys(targets.targets).forEach(name => {
    console.log(targets.targets[name]);
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
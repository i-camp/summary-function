const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Get current game on e-party2017/currentGame
const db = admin.database();
const currentGameRef = db.ref("/currentGame");

exports.summaryScore = functions.pubsub.topic('every-minute-tick').onPublish(event => {

  currentGameRef.on("value", snapshot => {
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
  let targets = targetsFnc();

  currentGameCommitsRef.on("value", snapshot => {
   for (let key in snapshot.val()) {
      let target = snapshot.val()[key].target;
      targets.addTarget(target);
      targets.addPlus(target, snapshot.val()[key].plus);
      targets.addMinus(target, snapshot.val()[key].minus);
    };
    
  });

  for (let name in targets.getTargets()) {
    for (let key in currentGame.targets) {
      if (currentGame.targets[key].name === name) {
        // まとめたデータをcurrentGameに戻す
        db.ref(`/currentGame/${currentGame.id}/targets/${key}`).update({
          plusPoin: targets.getPlus(name),
          minusPoint: targets.getMinus(name)
        });
      } 
    };
  };
  
};

let targetsFnc = () => {
  let targets = {};
  return {
    getTargets: () => {
      return targets;
    },
    addTarget: (name) => {
      if (targets[name] === undefined) {
        targets[name] = {
          plus: 0, minus: 0
        };
      }
    },
    addPlus: (name, score) => {
      targets[name].plus + score;
    },
    addMinus: (name, score) => {
      targets[name].minus + score;
    },
    getPlus: name => {
      return targets[name].plus;
    },
    getMinus: name => {
      return targets[name].minus;
    }
  }
};

const firebase = require('firebase');
require('firebase/database');

const app  = firebase.initializeApp({
    apiKey: "AIzaSyApU8XjBHp5GjMgb1HLOYi4UFmKyhNQP-I",
    authDomain: "e-party2017.firebaseapp.com",
    databaseURL: "https://e-party2017.firebaseio.com",
    projectId: "e-party2017",
    storageBucket: "gs://e-party2017.appspot.com/",
});
const db = app.database();

// Get current game on e-party2017/currentGame
const currentGameRef = db.ref("/currentGame");

setInterval(() => {
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
}, 3000);

let targets = {};

const summaryObservation = currentGame => {

  console.log(currentGame.id);
  console.log(currentGame.openedAt);

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

    // score算出・順位付け
    Object.values(targets).forEach(target => targetFnc.calcScore(target.name));
    targetFnc.refleshOrder();

    // まとめたデータをcurrentGameに戻す
    db.ref('/currentGame/targets').update(targets);

    console.log("done");
  });

};

let targetFnc = {
  addPlus: function(name, score) {
    targets[name].plus = targets[name].plus + score;
  },

  addMinus: function(name, score) {
    targets[name].minus = targets[name].minus + score;
  },

  calcScore: function(name) {
    const target = targets[name];
    if (target.plus === 0 || target.minus === 0) {
      return 0;
    }

    // 基礎スコア: 総ポイントが高いほど上昇
    const baseScore = (target.plus + target.minus);
    // 比率ボーナス: plusとminusのバランスが良いほど上昇
    const balanceScore = 
        Math.pow(Math.min(target.plus / target.minus, target.minus / target.plus) * 2, 2) * 100000;

    // 最終スコア: 基礎スコア + 比率ボーナス
    targets[name].score = Math.round(baseScore + balanceScore);
  },

  refleshOrder: function() {
      Object.values(targets).sort((a, b) => a.score < b.score).forEach((target, index) => target.order = index + 1);
  }
};

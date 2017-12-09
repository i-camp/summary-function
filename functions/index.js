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

    // score算出・順位付け
    targets.forEach(target => targetFnc.calculateScore(target.name));
    targetFnc.refleshOrder();

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
    targets[name].score = Math.round(baseScore * multiplier)
  }

  refleshOrder: function() {
      targets.sort((a, b) => a.score < b.score);
      targets.forEach((target, index)=> target.order = index + 1);
  }
};

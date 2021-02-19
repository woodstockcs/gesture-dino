/* eslint-disable no-undef */

// // More API functions here:
//     // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

//     // the link to your model provided by Teachable Machine export panel
//     const URL = 'https://teachablemachine.withgoogle.com/models/M4ym5_2x9/';
//     let model, webcam, ctx, labelContainer, maxPredictions;

//     async function init() {
//         const modelURL = URL + 'model.json';
//         const metadataURL = URL + 'metadata.json';

//         // load the model and metadata
//         // Refer to tmPose.loadFromFiles() in the API to support files from a file picker
//         model = await tmPose.load(modelURL, metadataURL);
//         maxPredictions = model.getTotalClasses();

//         // Convenience function to setup a webcam
//         const flip = true; // whether to flip the webcam
//         webcam = new tmPose.Webcam(200, 200, flip); // width, height, flip
//         await webcam.setup(); // request access to the webcam
//         webcam.play();
//         window.requestAnimationFrame(loop);

//         // append/get elements to the DOM
//         const canvas = document.getElementById('canvas');
//         canvas.width = 200; canvas.height = 200;
//         ctx = canvas.getContext('2d');
//         labelContainer = document.getElementById('label-container');
//         for (let i = 0; i < maxPredictions; i++) { // and class labels
//             labelContainer.appendChild(document.createElement('div'));
//         }
//     }

//     async function loop(timestamp) {
//         webcam.update(); // update the webcam frame
//         await predict();
//         window.requestAnimationFrame(loop);
//     }

//     async function predict() {
//         // Prediction #1: run input through posenet
//         // estimatePose can take in an image, video or canvas html element
//         const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
//         // Prediction 2: run input through teachable machine classification model
//         const prediction = await model.predict(posenetOutput);

//         for (let i = 0; i < maxPredictions; i++) {
//             const classPrediction =
//                 prediction[i].className + ': ' + prediction[i].probability.toFixed(2);
//             labelContainer.childNodes[i].innerHTML = classPrediction;
//         }

//         // finally draw the poses
//         drawPose(pose);
//     }

//     function drawPose(pose) {
//         ctx.drawImage(webcam.canvas, 0, 0);
//         // draw the keypoints and skeleton
//         if (pose) {
//             const minPartConfidence = 0.5;
//             tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
//             tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
//         }
//     }

//     init();

// based on
// https://www.youtube.com/watch?v=l0HoJHc-63Q

let dino;
let dinoStanding;
let dinoRunning;
let dinoDead;
let cactusImage;
let fireBall;
let bImg;
let cImg;
let brain;
let canvas;
let video;
let poseNet;
let pose;
let skeleton;
let poseLabel = "None";
let scoreLabel = "";
let cactuses = [];
let fireballs = [];
let lastCactusLaunch = Date.now();
let lastFireballLaunch = Date.now();
let cactusGap = 1000;
let fireballGap = 5000;
let bgImage1;
let bgImage2;
let nextCactus = 1000;
let nextFireball = 5000;
let score = 0;
let startTime = 0;
let useCamera = true;
let backgroundX = 0;
let state;
let trainingPause = 4000;
let gracePeriod = "none";
let dinoState;
let preTrained = true;

function preload() {
  dinoStanding = createImg(
    "https://cdn.glitch.com/0844a3f5-01b1-4c6e-9cae-d3cad582e4d0%2FLime-Green-clone.png?v=1603210442757"
  );
  dinoRunning = createImg(
    "https://cdn.glitch.com/0844a3f5-01b1-4c6e-9cae-d3cad582e4d0%2FLime%20Green%20Moving.gif?v=1604068527801"
  );
  fireBall = createImg(
    "https://cdn.glitch.com/0844a3f5-01b1-4c6e-9cae-d3cad582e4d0%2FFIRE.gif?v=1605626972341"
  );
  dinoDead = createImg(
    "https://cdn.glitch.com/0844a3f5-01b1-4c6e-9cae-d3cad582e4d0%2FDead%20Lime.gif?v=1604419862742"
  );
  dinoStanding.hide();
  dinoRunning.hide();
  dinoDead.hide();
  fireBall.hide();
  bgImage1 = loadImage(
    "https://cdn.glitch.com/0844a3f5-01b1-4c6e-9cae-d3cad582e4d0%2F0844a3f5-01b1-4c6e-9cae-d3cad582e4d0_Whispering%20Woods%2C%20BG%20%20(2).jpg?v=1606234079701"
  );
  bgImage2 = loadImage(
    "https://cdn.glitch.com/0844a3f5-01b1-4c6e-9cae-d3cad582e4d0%2F0844a3f5-01b1-4c6e-9cae-d3cad582e4d0_Whispering%20Woods%2C%20BG%20%20(2).jpg?v=1606234079701"
  );

  cactusImage = createImg(
    "https://cdn.glitch.com/0844a3f5-01b1-4c6e-9cae-d3cad582e4d0%2Funnamed.gif?v=1604677117574"
  );
  cactusImage.hide();
}

function setup() {
  canvas = createCanvas(400, 150);
  canvas.parent("sketch-holder");
  fireBall.parent("sketch-holder");
  dinoStanding.parent("sketch-holder");
  dinoRunning.parent("sketch-holder");
  dinoDead.parent("sketch-holder");
  //dinoRunning.size(100, 100);
  dinoDead.size(50, 50);

  cactusImage.parent("sketch-holder");
  cactusLabel = createDiv();
  cactusLabel.parent("sketch-holder");
  cactusLabel.position(280, 155);
  cactusLabel.addClass("white-text");
  cactusLabel.hide();

  scoreLabel = createDiv();
  scoreLabel.parent("sketch-holder");
  scoreLabel.position(200, -70);
  scoreLabel.size(200, 100);
  scoreLabel.addClass("white-text pre score-text");
  scoreLabel.addClass("text-right");
  //scoreLabel.addClass("border border-primary")

  bgImage1.resize(400, 150);
  bgImage2.resize(400, 150);
  makeFireballBlocker();

  msg = createDiv();
  msg.parent("sketch-holder");
  msg.addClass("msg-text pre");
  msg.position(0, 160);

  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses);

  let options = {
    inputs: 34,
    outputs: 3,
    task: "classification",
    debug: true
  };
  brain = ml5.neuralNetwork(options);

  if (preTrained) {
    const modelInfo = {
      model: "model.json",
      metadata: "model_meta.json",
      weights:
        "https://cdn.glitch.com/0844a3f5-01b1-4c6e-9cae-d3cad582e4d0%2Fmodel.weights.bin?v=1611259340788"
    };
    brain.load(modelInfo, brainLoaded);
    msg.html("");
    state = "playing";
    startGame();
    classifyPose();
  } else {
    msg.html("get in camera");
    setTimeout(runDataCollection, trainingPause);
  }

  dino = new Dino(dinoStanding, dinoRunning, dinoDead);
  // startGame();
}

function startGame() {
  cactuses = [];
  for (fireball of fireballs) {
    fireball.hide();
  }
  fireballs = [];
  startTime = Date.now();
  lastCactusLaunch = Date.now();
  lastFireballLaunch = Date.now();
  if (!isLooping()) {
    loop();
  }
  dinoState = "ready";
  gracePeriod = "none";
}

function makeFireballBlocker() {
  let left = createDiv();
  left.parent("sketch-holder");
  left.size(500, height);
  left.position(-500, 0);
  left.addClass("black");
  let right = createDiv();
  right.parent("sketch-holder");
  right.size(500, height);
  right.position(width, 0);
  right.addClass("black");
}
function brainLoaded() {
  console.log("pose classification ready!");
  //console.log(brain);
  classifyPose();
}

function modelLoaded() {
  console.log("posenet ready");
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  // console.log(results[0]);
  //console.log("user input:", poseLabel);
  if (results[0].confidence > 0.75) {
    poseLabel = results[0].label.toUpperCase();
  }
  //console.log(useCamera);
  if (poseLabel == "J") {
    if (dinoState == "ready") {
      if (gracePeriod == "jump") {
        dinoState = "jump soon";
      } else {
        dinoState = "jump now";
      }
    }
  }
  if (poseLabel == "D") {
    if (dinoState == "ready") {
      if (gracePeriod == "duck") {
        dinoState = "duck soon";
      } else {
        dinoState = "duck now";
      }
    }
  }
  if (poseLabel == "N") {
    if (dinoState = "waiting to reset") {
      dinoState = "ready";
    }
  }
  classifyPose();
}

// function gotPoses(poses) {
//   if (poses.length > 0) {
//     pose = poses[0].pose;
//     skeleton = poses[0].skeleton;
//   }
// }

function printHelperStatus() {
  message = "camera sees: " + poseLabel;
  message += "<br>";
  message += "dino state: " + dinoState;
  message += "<br>";
  message += "grace period: " + gracePeriod;
  msg.html(message);
}


function jump() {
  dino.jump();
  dinoState = "waiting to reset";
  gracePeriod = "none";
}


function duck() {
  dino.duck()
  dinoState = "waiting to reset";
  gracePeriod = "none";
}

function gotPoses(poses) {
  // console.log(poses);
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    if (state == "collecting") {
      let inputs = [];
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        inputs.push(x);
        inputs.push(y);
      }
      let target = [targetLabel];
      brain.addData(inputs, target);
    }
  }
}

function keyPressed() {
  if (key == " ") {
    console.log("SPACE");
    poseLabel = "J";
    // dino.jump();
  }
  if (key == "d") {
    poseLabel = "D";
    // dino.duck();
  }
  if (key == "q" && useCamera) {
    useCamera = false;
  }
  if (key == "q" && !useCamera) {
    useCamera = true;
  }
  if (key == "p") {
    endGame();
  }
}

function pauseGame() {
  if (isLooping()) {
    noLoop();
  } else {
    loop();
  }
}

function draw() {
  if (state != "playing") {
    drawPoses();
  } else {
    background(233, 214, 255);
    image(bgImage1, backgroundX, 0);
    image(bgImage2, backgroundX + 400, 0);
    backgroundX -= 2;
    if (backgroundX <= -400) {
      backgroundX = 0;
    }
    dino.show();
    dino.move();
    checkforDinoActionsToStart();
    handleCactuses();
    // handleFireballs();
    updateScore();
    printHelperStatus();
  }
}

function checkforDinoActionsToStart() {
  if (dinoState == "jump now") {
    jump();
  }
  if (dinoState == "duck now") {
    duck();
  }
}

function updateScore() {
  let now = Date.now();
  score = Math.round((now - startTime) / 100);
  scoreLabel.html(score);
  if (score >= 200) {
    endGame();
  }
}

function handleCactuses() {
  let now = Date.now();
  let timeToLaunch = nextCactus <= 0; //now - lastCactusLaunch >= cactusGap
  if (timeToLaunch) {
    cactuses.push(new Cactus());
    lastCactusLaunch = now;
    cactusGap = Math.random() * 2000 + 3000;
    nextCactus = cactusGap;
  }
  //Math.round(cactusGap/100) / 10;
  let timeSinceLastCactus = now - lastCactusLaunch;
  nextCactus = cactusGap - timeSinceLastCactus;
  showCactusLabel(nextCactus);

  for (let cactus of cactuses) {
    cactus.show();
    cactus.move();
    if (dino.isCollidingWith(cactus)) {
      endGame();
    }
  }

  if (cactuses.length > 0) {
    for (var i = cactuses.length - 1; i >= 0; i--) {
      let cactus = cactuses[i];
      if (cactus.isGone()) {
        cactuses.splice(i, 1);
      }
      if (cactus.x >= 120 && cactus.x < 250) {
        gracePeriod = "jump";
      }
      if (cactus.x >= 110 && cactus.x < 120) {
        if (gracePeriod == "jump") {
          gracePeriod = "none";
        }
        if (dinoState == "jump soon") {
          dinoState = "jump now";
        }
      }
    }
  }
}

function handleFireballs() {
  let now = Date.now();
  let timeToLaunch = nextFireball <= 0; //now - lastCactusLaunch >= cactusGap
  if (timeToLaunch) {
    fireballs.push(new Fireball());
    lastFireballLaunch = now;
    fireballGap = Math.random() * 5000 + 5000;
    nextFireball = fireballGap;
  }
  //console.log(fireballs)
  //Math.round(cactusGap/100) / 10;
  let timeSinceLastFireball = now - lastFireballLaunch;
  nextFireball = fireballGap - timeSinceLastFireball;
  //showCactusLabel(next);

  for (let fireball of fireballs) {
    fireball.show();
    fireball.move();
    if (dino.isCollidingWith(fireball)) {
      endGame();
    }
  }

  if (fireballs.length > 0) {
    for (var i = fireballs.length - 1; i >= 0; i--) {
      let fireball = fireballs[i];
      if (fireball.isGone()) {
        fireballs.splice(i, 1);
      }
      if (fireball.x >= 120 && fireball.x < 200) {
        gracePeriod = "duck"
      }
      if (fireball.x >= 110 && fireball.x < 120) {
        if (dinoState == "duck soon") {
          dinoState = "duck now";
        }
      }
    }
  }
}

function showCactusLabel(next) {
  cactusLabel.html("spikes in " + printableMillis(next) + " sec");
}

function printableMillis(m) {
  let n = Math.round(m / 100) / 10;
  if (Math.round(n) == n) {
    return n + ".0";
  } else {
    return n;
  }
}

function endGame() {
  console.log("game over");
  //background(255, 50, 50);
  dino.die();
  noLoop();
  setTimeout(startGame, 2000);
}

function intersection(rect1, rect2) {
  var x1 = rect2.x,
    y1 = rect2.y,
    x2 = x1 + rect2.width,
    y2 = y1 + rect2.height;
  if (rect1.x > x1) {
    x1 = rect1.x;
  }
  if (rect1.y > y1) {
    y1 = rect1.y;
  }
  if (rect1.x + rect1.width < x2) {
    x2 = rect1.x + rect1.width;
  }
  if (rect1.y + rect1.height < y2) {
    y2 = rect1.y + rect1.height;
  }
  return x2 <= x1 || y2 <= y1
    ? false
    : { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

function drawPoses() {
  push();
  translate(video.width / 2, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width / 2, video.height / 2);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);

      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0);
      stroke(255);
      ellipse(x, y, 16, 16);
    }
  }
  pop();

  // fill(255, 0, 255);
  // noStroke();
  // textSize(512);
  // textAlign(CENTER, CENTER);
  // text(poseLabel, width / 2, height / 2);
}

let labels = ["N", "J", "D"];

function runDataCollection() {
  setTimeout(function() {
    collect(0);
  }, trainingPause);
}

function collect(i) {
  let label = labels[i];
  msg.html("get in position for " + label);
  targetLabel = label;
  setTimeout(function() {
    msg.html("collecting " + label);
    state = "collecting";
    setTimeout(function() {
      msg.html("done collecting " + label);
      state = "waiting";
      setTimeout(function() {
        if (i < labels.length - 1) {
          collect(i + 1);
        } else {
          state = "training";
          msg.html("normalizing");
          brain.normalizeData();
          msg.html("training");
          brain.train({ epochs: 50 }, finishedTraining);
        }
      }, trainingPause);
    }, trainingPause);
  }, trainingPause );
}

function finishedTraining() {
  console.log("model trained");
  //brain.save();
  msg.html("");
  state = "playing";
  startGame();
  classifyPose();
}

function dataReady() {
  brain.normalizeData();
  brain.train(
    {
      epochs: 50
    },
    finished
  );
}

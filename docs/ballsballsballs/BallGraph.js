var canvas = document.getElementById("ballCanvas");
var ctx = canvas.getContext("2d");
//ctx.scale(1, 1);

var objArray = [];
var paused = false;
var totalKineticEnergy = 0;
var bumped = false;

var leftHeld = false;
var upHeld = false;
var rightHeld = false;
var downHeld = false;

var gravityOn = false;
var dragOn = true;
var soundOn = true;

var clearCanv = true;

var bigBalls = false;
var CENTER_X = canvas.width/2, CENTER_Y = 222;
var MAX_CANVAS_W = 700;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function keyDownHandler(event) {
    if (event.keyCode == 67) { // c
        objArray[objArray.length] = new Ball(randomX(), randomY(), randomRadius());
    } else if (event.keyCode == 80) { // p
        paused = !paused;
    } else if (event.keyCode == 71) { // g
        gravityOn = !gravityOn;
        dragOn = !dragOn;
    } else if (event.keyCode == 65) { // A
        leftHeld = true;
    } else if (event.keyCode == 87) { // W
        upHeld = true;
    } else if (event.keyCode == 68) { // D
        rightHeld = true;
    } else if (event.keyCode == 83) { // S
        downHeld = true;
    } else if (event.keyCode == 82) { // r
        objArray = [];
    } else if (event.keyCode == 75) { // k
        clearCanv = !clearCanv;
    } else if (event.keyCode == 88) { // x
        bigBalls = !bigBalls;
    }
}

function keyUpHandler(event) {
    if (event.keyCode == 65) { // A
        leftHeld = false;
    } else if (event.keyCode == 87) { // W
        upHeld = false;
    } else if (event.keyCode == 68) { // D
        rightHeld = false;
    } else if (event.keyCode == 83) { // S
        downHeld = false;
    }
}

function arrowControls() {
    if (leftHeld) { // left arrow
        for (var obj in objArray) {
            objArray[obj].dx -= 0.3;
        }
    } if (upHeld) { // up arrow
        for (var obj in objArray) {
            objArray[obj].dy -= 0.3;
        }
    } if (rightHeld) { // right arrow
        for (var obj in objArray) {
            objArray[obj].dx += 0.3;
        }
    } if (downHeld) { // down arrow
        for (var obj in objArray) {
            objArray[obj].dy += 0.3;
        }
    }
}

function canvasBackground() {
    //canvas.style.backgroundColor = "rgb(215, 235, 240)";
    canvas.style.backgroundColor = "rgb(0, 0, 111)";
    
}

function wallCollision(ball) {
    if (ball.x - ball.radius + ball.dx < 0 ||
        ball.x + ball.radius + ball.dx > canvas.width) {
        ball.dx *= -1;
    }
    if (ball.y - ball.radius + ball.dy < 0 ||
        ball.y + ball.radius + ball.dy > canvas.height) {
        ball.dy *= -1;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
    }
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
    }
    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
    }
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
    }    
}

function ballCollision() {
    for (var obj1 in objArray) {
        for (var obj2 in objArray) {
            if (obj1 !== obj2 && distanceNextFrame(objArray[obj1], objArray[obj2]) <= 0) {
                var theta1 = objArray[obj1].angle();
                var theta2 = objArray[obj2].angle();
                var phi = Math.atan2(objArray[obj2].y - objArray[obj1].y, objArray[obj2].x - objArray[obj1].x);
                var m1 = objArray[obj1].mass;
                var m2 = objArray[obj2].mass;
                var v1 = objArray[obj1].speed();
                var v2 = objArray[obj2].speed();

                var dx1F = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.cos(phi) + v1*Math.sin(theta1-phi) * Math.cos(phi+Math.PI/2);
                var dy1F = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.sin(phi) + v1*Math.sin(theta1-phi) * Math.sin(phi+Math.PI/2);
                var dx2F = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.cos(phi) + v2*Math.sin(theta2-phi) * Math.cos(phi+Math.PI/2);
                var dy2F = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.sin(phi) + v2*Math.sin(theta2-phi) * Math.sin(phi+Math.PI/2);

                objArray[obj1].dx = dx1F;                
                objArray[obj1].dy = dy1F;                
                objArray[obj2].dx = dx2F;                
                objArray[obj2].dy = dy2F;
                
                return(true);
            }            
        }
        wallCollision(objArray[obj1]);
    }
    return(false);
}

function staticCollision() {
    for (var obj1 in objArray) {
        for (var obj2 in objArray) {
            if (obj1 !== obj2 &&
                distance(objArray[obj1], objArray[obj2]) < objArray[obj1].radius + objArray[obj2].radius)
            {
                var theta = Math.atan2((objArray[obj1].y - objArray[obj2].y), (objArray[obj1].x - objArray[obj2].x));
                var overlap = objArray[obj1].radius + objArray[obj2].radius - distance (objArray[obj1], objArray[obj2]);
                var smallerObject = objArray[obj1].radius < objArray[obj2].radius ? obj1 : obj2
                objArray[smallerObject].x -= overlap * Math.cos(theta);
                objArray[smallerObject].y -= overlap * Math.sin(theta);
            }
        }
    }
}

function applyGravity() {
    for (var obj in objArray) {
        if (objArray[obj].onGround() == false) {
            objArray[obj].dy += 0.29;
        }   
    }
}

function applyDrag() {
    for (var obj in objArray) {
        objArray[obj].dx *= 0.99
        objArray[obj].dy *= 0.99
    }
}

function moveObjects() {
    for (var obj in objArray) {
        objArray[obj].x += objArray[obj].dx;
        objArray[obj].y += objArray[obj].dy;
    }    
}

function drawObjects() {
    for (var obj in objArray) {
        objArray[obj].draw();
    }
}

function draw() {
    if(clearCanv){
        clearCanvas();
    }
    canvasBackground();

    if (!paused) {
        arrowControls();
        if (gravityOn) {
            applyGravity();
            applyDrag();
        }
        moveObjects();
    }

    drawObjects();
    staticCollision();
    ballCollision();
    if(!paused){
        requestAnimationFrame(draw);
    }
}

function drawTween() {
  if(clearCanv){
    clearCanvas();
  }
  canvasBackground();

  drawObjects();

  if(!paused){
   requestAnimationFrame(drawTween);
  }
}
function getRandomBetween(min, max){
  return(Math.random() * (max - min) + min);
}
function tweenBallsCenter(){
  for(var i = 0; i < objArray.length; i++){
    if(objArray[i].centerCirc_x != undefined){
      TweenLite.to(objArray[i], getRandomBetween(2, 4), {
        x: objArray[i].centerCirc_x,
        y: objArray[i].centerCirc_y,
        delay: .007*i,
        //ease: Linear.easeNone
        //ease: Linear.easeIn
        ease: Elastic.easeOut
        //ease: Bounce.easeIn
        });
    }
    else
    if(objArray[i].resetCirc_x != undefined){
      console.log("reset: %o", objArray[i]);
      TweenLite.to(objArray[i], getRandomBetween(.3,.6), {
          x: objArray[i].resetCirc_x,
          y: objArray[i].resetCirc_y,
          delay: .007*i,
          //ease: Linear.easeNone
          ease: Expo.easeIn
          //ease: Bounce.easeOut
          //ease: Elastic.easeOut
          
      });
    }
  }
}
function tweenBallsBackToCircle(){
    for(var i = 0; i < objArray.length; i++){
      //if(objArray[i].centerCirc_x != undefined){
        TweenLite.to(objArray[i], getRandomBetween(.3,.6), {
          x: objArray[i].circle_x,
          y: objArray[i].circle_y,
          delay: .007*i,
          //ease: Linear.easeNone
          ease: Expo.easeIn
          //ease: Bounce.easeOut
          //ease: Elastic.easeOut
          
        });
     // }
    }
}
  function tweenBalls(){
    for(var i = 0; i < objArray.length; i++){
        TweenLite.to(objArray[i], .5, {
        x: objArray[i].circle_x,
        y: objArray[i].circle_y,
        delay: .007*i,
        ease: Expo.easeOut
        });
    }
}

bigBalls = true;

var NUM_BALLS = 100;
function setCirclesToCenter(numNodes, ballRadius){
    var angle, x, y, radius;
    var spaceBetween = ballRadius + 5; //15; 
    // center of the circles

    var k = numNodes<7?1:(numNodes<17?2:(numNodes<32?3:(numNodes<52?4:(numNodes<77?5:6))));
    //var k = numNodes<6?1:(numNodes<16?2:(numNodes<31?3:(numNodes<51?4:(numNodes<76?5:6))));
    var i = parseInt(NUM_BALLS-numNodes);
    objArray[i].centerCirc_x = CENTER_X;
    objArray[i].centerCirc_y = CENTER_Y;
    i++;

    while ( i < NUM_BALLS ) {
        // number of elements on this circle
        var numBallsInCircle = k * 5;
        // angular distance between elements
        var angle_range = 2 * Math.PI / numBallsInCircle;
        // every circle is bigger then the previuos of the same amount
        //var radius = k * 30;
        var radius = k * (ballRadius + spaceBetween);
        var j = 0;
        if(NUM_BALLS-i < numBallsInCircle){
            numBallsInCircle = NUM_BALLS-i;
            angle_range = 2 * Math.PI / numBallsInCircle;
        }
        while ( j < numBallsInCircle  &&  i < NUM_BALLS ) {
            var angle = j * angle_range;
            var circle_x = Math.round(CENTER_X + radius * Math.cos(angle));// + getRandomBetween(5, 9) );
            var circle_y = Math.round(CENTER_Y + radius * Math.sin(angle));// + getRandomBetween(4, 14));

            objArray[i].centerCirc_x = circle_x;
            objArray[i].centerCirc_y = circle_y;
            i++;
            j++;
        }
        k--;
    }
}
function setOuterCircleAdapt(ballRadius){
    var angle, x, y, radius;
    var spaceBetween = ballRadius + 5; //15; 
    // center of the circles
    
    var k = 8;
    var i = 0;

    while ( i < resetCircleArr.length ) {
        // number of elements on this circle
        var numBallsInCircle = k * 5;
        // angular distance between elements
        var angle_range = 2 * Math.PI / numBallsInCircle;
        // every circle is bigger then the previuos of the same amount
        //var radius = k * 30;
        var radius = k * (ballRadius + spaceBetween);
        var j = 0;
        if(resetCircleArr.length-i < numBallsInCircle){
            numBallsInCircle = resetCircleArr.length-i;
            angle_range = 2 * Math.PI / numBallsInCircle;
        }
        while ( j < numBallsInCircle  &&  i < resetCircleArr.length ) {
            var angle = j * angle_range;
            var circle_x = Math.round(CENTER_X + radius * Math.cos(angle));// + getRandomBetween(5, 9) );
            var circle_y = Math.round(CENTER_Y + radius * Math.sin(angle));// + getRandomBetween(4, 14));
            resetCircleArr[i].resetCirc_x = circle_x;
            resetCircleArr[i].resetCirc_y = circle_y;
            i++;
            j++;
        }
        k--;
    }
}
function setCircles(numNodes, ballRadius){
    var angle, x, y, radius;
    var spaceBetween = ballRadius + 5; //15; 
    // center of the circles
    
    var k = 8;
    var i = 0;
    while ( i < numNodes ) {
        // number of elements on this circle
        var numBallsInCircle = k * 5;
        // angular distance between elements
        var angle_range = 2 * Math.PI / numBallsInCircle;
        // every circle is bigger then the previuos of the same amount
        //var radius = k * 30;
        var radius = k * (ballRadius + spaceBetween);
        var j = 0;
        // if 
        if(numNodes-i < numBallsInCircle){
            numBallsInCircle = numNodes-i;
            angle_range = 2 * Math.PI / numBallsInCircle;
        }
        while ( j < numBallsInCircle  &&  i < numNodes ) {
            var angle = j * angle_range;
            var circle_x = Math.round(CENTER_X + radius * Math.cos(angle));
            var circle_y = Math.round(CENTER_Y + radius * Math.sin(angle));

            var tmpBall = new Ball(CENTER_X,CENTER_Y, circle_x, circle_y, ballRadius);
            tmpBall.dx = randomDx();
            tmpBall.dy = randomDy();
            objArray[objArray.length] = tmpBall;    
            i++;
            j++;
        }
        k--;
    }

}
function resizeCanvas(){
  var canvas_w;
  if(window.innerWidth <= MAX_CANVAS_W){
      canvas_w = window.innerWidth;
  }
  else{
    canvas_w = MAX_CANVAS_W;
  }
  canvas.style.width = canvas_w + 'px';
//canvas.style.height = height+'px';
}
function addListeners(){
    window.addEventListener('load', resizeCanvas, false);
    window.addEventListener('resize', resizeCanvas, false);
}


var BALL_RADIUS = 7;
setCircles(100, BALL_RADIUS);
//var k = numNodes<7?1:(numNodes<17?2:(numNodes<32?3:(numNodes<52?4:(numNodes<77?5:6))));
setCirclesToCenter(25, BALL_RADIUS);
var resetCircleArr = [], tmpObj;
for(var i = 0; i < NUM_BALLS; i++){
    if(objArray[i].centerCirc_x == undefined){
      tmpObj = {};
      tmpObj.outerCirleIndx = i;
      resetCircleArr[resetCircleArr.length] = tmpObj;
    }
}
setOuterCircleAdapt(BALL_RADIUS);

for(var i = 0; i < resetCircleArr.length; i++){
    objArray[resetCircleArr[i].outerCirleIndx].resetCirc_x = resetCircleArr[i].resetCirc_x;
    objArray[resetCircleArr[i].outerCirleIndx].resetCirc_y = resetCircleArr[i].resetCirc_y; 
}

addListeners();
drawTween();
tweenBalls();
setTimeout(function(){
  tweenBallsCenter();
}, 2600);
setTimeout(function(){
    tweenBallsBackToCircle();
}, 7000);
setTimeout(function(){
  draw();
}, 9000);

//*********************** */

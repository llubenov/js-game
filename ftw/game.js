/* @author Lyusien Lyubenov */ 

/* All global variables */
//canvas
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
//score
var score = 0;
//timer
var seconds = "00";
var minutes = "00";
//audio 
var collect = new Audio('collect.wav'); // http://www.freesound.org/people/DrMinky/sounds/166184/
collect.volume = 0.7;
var lossSound = new Audio('lose.wav'); 	// http://www.freesound.org/people/suntemple/sounds/253174/
//images
var	background = new Image();
background.src = "backFinal.png";
var	endPicture = new Image();
endPicture.src = "background.jpg";

// screen related variables
var width = 800;
var height = 600;
var middle = width / 2;
var moveScreenUp = 0.5;

// animation variables
var animationScreen = true;
var previousCircles = 2500;

// circles
var circles = [];

canvas.height = height;
canvas.width = width;

var difficulty;
var animation;
var timer;
var playerObject = [];
var keyDown = {};	// gameplayButtons

window.onload = function() {
  ctx.fillStyle = "#F00";
  ctx.font = "bold 16px Arial";
  ctx.drawImage(background,0, 0);
  ctx.fillText("click space to start the game !", (middle - 110), 300);
  canvas.addEventListener('mousedown', mouseClick);
};


/* Keyboard and mouse interaction handling */

window.addEventListener('keydown', function(e) {
  if(e.keyCode == 32) {
    e.preventDefault();
		resetGame();
		score =0;
		startGame();
	}
  keyDown[e.keyCode] = true;
});

window.addEventListener('keyup', function(e) {
  delete keyDown[e.keyCode];
});	

function calculateMousePos(evt){
			var rect = canvas.getBoundingClientRect();
			var root = document.documentElement; //handle to html
			var mouseX = evt.clientX - rect.left - root.scrollLeft; // takes the x position
			var mouseY = evt.clientY - rect.top - root.scrollTop; // takes the y position
			return {
			x:mouseX,
			y:mouseY
    };
}

function mouseClick(evt){
	if(!ended){
	resetGame();
	score = 0;
	startGame();
		}
}

// 65 87 68 83 - left up right down 
function createplayerObject() {
  playerObject = [];
  playerObject.push(new Player({
    x: 370,
    y: 500,
    width: 30,
    height: 30,
    speed: 1,
    minspeed: 0,
    maxspeed: 500,
    momentum: 3,
    color: 'red',
    up: 87,
    left: 65,
    down: 83,
    right: 68,  
  }));
}

/* Starting the game */
function startGame() {
		ended = false;
	    resetGame();
	    createplayerObject(); 
		requestAnimationFrame(circlesAnimate);	
	  time = Date.now();
	  playerObject.forEach(function(o) {
		o.render();
	  });
  
  animation = setInterval(rendering, 5);
    //requestAnimationFrame(animate);
    timer = setInterval(function() {
    seconds = parseInt(seconds) + 1;
    if(seconds < 10) {
      seconds = "0" + seconds;
    }
    if(seconds > 60) {
      seconds = "00";
      minutes = parseInt(minutes) + 1;
    }
  }, 1000);
}

 
/* When game runs */
function rendering() {
  /* Update the player position */
  playerObject.forEach(function(player) {
    update((Date.now() - time) / 1000, player);
  });

  /* Clear the canvas*/
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if(!ended) {
    /* Background Rendering */
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, middle, height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(middle, 0, middle, height);
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 16px Arial";
    ctx.fillText("click to restart", 10, (height - 10));
    ctx.fillText("score:", 25, 20);
	ctx.fillText(score, 77,20);
    ctx.font = "bold 16px Arial";
    ctx.fillText("timer:", (width - 105), 20);
	
	/* MINUTES AND SECONDS - TIMER */
	ctx.font = "bold 15px Arial";
	ctx.fillText(minutes, (width-50), 20);
	 ctx.fillText(":", (width - 34), 19);
	ctx.font = "bold 15px Arial";
	ctx.fillText(seconds, (width-25),20);
	
	
	pushAllCircles();
	
	/* render the playerObject */
    playerObject.forEach(function(o) {
      o.render();
    });
	
	
  }
  
/* WILL UPDATE */
  if(ended) {  
 
	ctx.fillStyle = "#FFF";
    ctx.font = "bold 16px Arial";
	ctx.drawImage(endPicture,0, 0);
    ctx.fillText("highscores", 10, 25);
	ctx.fillText("you scored:", (middle - 70), 230);
    ctx.fillText(score,(middle+30), 230 );
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 16px Arial";
    ctx.fillText("game over, try again !!!", (middle - 90), 200);
    ctx.fillText("press space to restart the game :)", (middle - 125), 300);
	highScores();
  }
  time = Date.now();
}

/* GAMEPLAY */

function update(move, player) {
	
	 if(player.y+player.height > canvas.height){
		     if(!ended) {
      gameOver();
    }
		 // need to make sure that this function works and game over is displayed correctly !!!
	 }
	 
  // Moving left
  if(player.left in keyDown && player.x > 0) {
    player.x -= player.speed * move;
    if((player.speed * player.momentum) < player.maxspeed) {
      player.speed *= player.momentum;
    }
  }

  // Moving up
  if(player.up in keyDown && player.y > 0) {
    player.y -= player.speed * move;
    if((player.speed * player.momentum) < player.maxspeed) {
      player.speed *= player.momentum;
    }
  }
  // Moving right
  if(player.right in keyDown && player.x + player.width < canvas.width) {
    player.x += player.speed * move;
    if((player.speed * player.momentum) < player.maxspeed) {
      player.speed *= player.momentum;
    }
  }
  
  // Moving down
  if(player.down in keyDown && player.y+player.height < canvas.height) {
    player.y += player.speed * move;
    if((player.speed * player.momentum) < player.maxspeed) {
      player.speed *= player.momentum;
    }
  }


  
/* SLIDER */
  for(var j = 0; j < circles.length ; j++){
	circles[j].y += moveScreenUp;
}


 for (i = 0; i < circles.length; i++) {
        if (collision(circles[i], playerObject[0])) {		// checks if there is collision between the circles and the rectangle
			circles.splice(i,1);		// if there is removes the circle from the array
			collect.play();		// plays the collect sound
			score++;
        }
    }
	
/* Increases speed of the game - so it gets harder */ 
	
	// minute 2
	if(minutes >= 2){
		for(var j = 0; j < circles.length ; j++){	
		circles[j].y += 0.4;;
		}
	}
	// minute 4
	if(minutes >= 4){
		for(var j = 0; j < circles.length ; j++){	
		circles[j].y += 0.43;;
		}
	}
	// minute 6 
	if(minutes >= 6){
		for(var j = 0; j < circles.length ; j++){	
		circles[j].y += 0.47;;
		}
	}
	
/* GETTING BIGGER if player is collecting the circles */ 
	
	if(score >= 15){
		player.width = 35;
		player.height = 35;
		player.y += 0.1;
	}
	if(score >= 30){
		player.width = 40;
		player.height = 40;
		player.y += 0.1;
	}
	if(score >= 45){
		player.width = 44;
		player.height = 44;
		player.y += 0.1;
	}
	if(score >= 60){
		player.width = 48;
		player.height = 48;
		player.y += 0.1;
	}
	if(score >= 75){
		player.width = 52;
		player.height = 52;
		player.y += 0.05;
	}
	
	if(score >= 90){
		player.width = 55;
		player.height = 55;
		player.y += 0.05;
	}
	if(score >= 105){
		player.width = 60;
		player.height = 60;
		player.y += 0.05;
	}
	if(score >= 120){
		player.width = 64;
		player.height = 64;
		player.y += 0.05;
	}
	if(score >= 135){
		player.width = 67;
		player.height = 67;
		player.y += 0.05;
	}
	if(score >= 150){
		player.width = 70;
		player.height = 70;
		player.y += 0.05;
	}
	if(score >= 200){
		player.width = 75;
		player.height = 75;
		player.y += 0.05;
	}
	
	/* Checks how many circles are left and draws new ones */
	if (!ended){		// if the game is over stop creating new circles
		if(circles.length < 14){
		drawCircle();
	}	
	}
}

/* SCORES RELATED FUNCTIONS */

function highScores() {
  var begin = 390;
  var scores = [];
  
  for (var i = 0; i < localStorage.length; i++){
    var score = localStorage.getItem(localStorage.key(i));
    scores.push({"score": parseInt(score)});
	
  }
  scores.sort(compare);
  
  
  for (var s in scores){
	
	ctx.fillText("TOP 3", (middle - 25), 350);
	ctx.fillText("score:", (middle - 30), begin);
    ctx.fillText(scores[s].score, (middle + 20), begin);
    begin += 20;
    if(s == 2) break;	// displays top 3 
  }
  
}

/* Comparing scores in order to get the highest score */ 

function compare(player1,player2) {
  if (player1.score < player2.score){
     return 1;
  }
  if (player1.score > player2.score){
    return -1
  }
  return 0;
}


/* If game is over */ 
function gameOver() {
  //lossSound.play();			// this will be playing the sound
  var rightNow = new Date();
  var handle = rightNow.toISOString().slice(0,19).replace(/T/g," ");

  debugger;	
  localStorage.setItem(handle, score);	// stores score and date
  lossSound.play();
  resetGame();
  ended = true;
  
}


/* Game reset function */ 
function resetGame() {
  clearInterval(animation);
  clearInterval(timer);
  //circles = [];
  circles.splice(0,circles.length);
 // cancelAnimationFrame(circlesAnimate);
  keyDown = {};
  canvas.width = canvas.width; 
 // canvas.height = canvas.height;
  minutes = "00";
  seconds = "00";
  }

function drawCircle() {
    var r = 8;				// radius
    var x = Math.random() * (canvas.width-2*r) + r;
    var y = Math.random() * (canvas.height-2*r) + r;

    /* check if it is overlapping with another circle */ 
    while (true) {
        var overlap = 0;
        for (var i = 0; i < circles.length; i++) {
            var circle = circles[i];
            var dx = x - circle.x;
            var dy = y - circle.y;
            var rr = r + circle.radius;
            if (dx * dx + dy * dy < rr * rr) {
                overlap++;
            }
        }
        // checks if overlaps with another circle and if not - breaks 
        if (overlap == 0) {
            break;
        }
    var x = Math.random() * (canvas.width-2*r) + r;
    var y = Math.random() * (canvas.height-2*r) + r;
    }

    // pushing new circle into existing ones 
    circles.push({
        x: x,
        y: y,
        radius: r,
        color: generateColor(),
        countdown: 250 + Math.random() * 10000
    });
}


function circlesAnimate(t) {

    // get new animation frame
    if (animationScreen) {
        requestAnimationFrame(circlesAnimate);
    }

    // calc timeElapsed time since the last frame
    var timeElapsed = t - previousCircles;
    previousCircles = t + 2;

	// first reduce the countdown timer then 
	//removes circles that time has passed and the countdown is less than 0 
    var i = circles.length;
    while (--i >= 0) {	//first second
        var circle = circles[i];
        circle.countdown -= timeElapsed;
        if (circle.countdown < 0) {
            circles.splice(i, 1);
            drawCircle();
        }
    }
    // pushing circles
    pushAllCircles();
}

function pushAllCircles() {
	for (var i = 0; i < circles.length; i++) {
        var circle = circles[i];
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = circle.color;
        ctx.fill();
    }
}

/* GENERATES RANDOM COLOR */

function generateColor() {
    return ('#' + Math.floor(Math.random() * 16777215).toString(16)); 
}

/* CIRCLE AND RECTANGLE COLLISION */ 

function collision(circle, player) {
    var distanceX = Math.abs(circle.x - player.x - player.width / 2);
    var distanceY = Math.abs(circle.y - player.y - player.height / 2);

    if (distanceX > (player.width / 2 + circle.radius)) {
        return false;
    }
    if (distanceY > (player.height / 2 + circle.radius)) {
        return false;
    }

    if (distanceX <= (player.width / 2)) {
        return true;
    }
    if (distanceY <= (player.height / 2)) {
        return true;
    }
	// distance between playerPiece and circles centers
	
    var dx = distanceX - player.width / 2;
    var dy = distanceY - player.height / 2;
    return (dx * dx + dy * dy <= (circle.radius * circle.radius));
}

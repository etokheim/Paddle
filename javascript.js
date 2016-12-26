// ********************
//    Menu settings
// ********************
// highlight the multiplayer mode
var menuOn = true,
	multiplayer = true,
	teamplay = true,
	debugging = false;


document.getElementById("2_players").style.background = "rgba(255, 255, 255, .3)";
document.getElementById("teamplay").style.background = "rgba(255, 255, 255, .3)";

function toggleMultiplayer(object) {
	if(object == "1_player") {
		document.getElementById("2_players").style.background = "none";
		document.getElementById("1_player").style.background = "rgba(255, 255, 255, .3)";
		multiplayer = false;
	} else {
		document.getElementById("1_player").style.background = "none";
		document.getElementById("2_players").style.background = "rgba(255, 255, 255, .3)";
		multiplayer = true;
	}

	if(debugging) {if(debugging) {console.log("Multiplayer: " + multiplayer);}}
}

function toggleTeamplay(object) {
	if(object == "no_teamplay") {
		document.getElementById("teamplay").style.background = "none";
		document.getElementById("no_teamplay").style.background = "rgba(255, 255, 255, .3)";
		teamplay = false;
	}else{
		document.getElementById("no_teamplay").style.background = "none";
		document.getElementById("teamplay").style.background = "rgba(255, 255, 255, .3)";
		teamplay = true;
	}

	if(debugging) {console.log("Teamplay: " + teamplay);}
}


function toggleMenu() {
	$(".menu_on").toggleClass("menu_off");
	menuOn = !menuOn;
}


function toggleSettings() {
	$(".settings_on").toggleClass("settings_off");
	if(debugging) {console.log("Settings Toggled");}
}
// Since we are toggeling the class (so we can easily add animations),
// we must display the settings first in order for the css to work.
// When the class is being toggeled, it will look like this:
// <div class="settings_on"> -> <div class="settings_on settings_off>"
// It is always the first css class assigned to an element which decides.
toggleSettings();


function startGame() {
	toggleMenu();
	draw();
	game();

	if(debugging) {console.log("Game Started");}
}



// ********************
//  Game settings etc.
// ********************
var canvas = document.getElementById("canvas_id");
var ctx = canvas.getContext("2d");
var player1Score = 0;
var player2Score = 0;
var timePlayed = 0;
var multiplayer = true;
var teamplay = false;
var teamScore = 0;
var canvasColor = "#1E023F";
var lvl = 1;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.backgroundColor = canvasColor;
window.onresize = function() {
	// alert("WINDOW RESIZED! Refresh page to compensate");
};



// ********************
//   Sound effects!
// ********************
// buffers automatically when created
var sfxHitWall = new Audio("sfx/hitWall.mp3"),
	sfxHitArray = [new Audio("sfx/hit1.mp3"), new Audio("sfx/hit2.mp3"), new Audio("sfx/hit3.mp3")];
// (new Audio()).canPlayType("audio/ogg; codecs=vorbis");
// more advanced audio stuff: http://webaudio.github.io/web-audio-api/



// ********************
//    Sprite Images
// ********************
var bossSprite = new Image();
bossSprite.src = "img/boss1.png";

var bossBall = {
	radius: 100,
	x: canvas.width/2,
	y: -100,
	xms: 0,
	yms: 0,
	mass: 1
};

var bossSprite = sprite({
	width: 905,
	height: 994,
	image: bossSprite,
	numberOfFrames: 1,
	ticksPerFrame: 1,
	x: bossBall.x,
	y: bossBall.y,
	scaleRatio: 0.0002
});

bossSprite.x = bossBall.x - (bossSprite.width * bossSprite.scaleRatio)/2;
bossSprite.y = bossBall.y;



// **********
//   Balls
// **********
var ballsArray = [];
function ballConstructor(x, xms, y, yms, radius, mass) {
	this.xmsDefault = 0;
	this.ymsDefault = 0;
	this.xms = xms;
	this.yms = yms;
	this.xDefault = canvas.width/2 - radius/2;
	this.yDefault = canvas.height/2 - radius/2;
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.radiusDefault = 10 * canvas.width/1000;
	this.friction = 0.005;

	// ball not being hit = 0;
	// ball being hit on the left side = 1;
	// ball being hit on the right side = 2;
	this.beingHit = 0;
	this.beingHitX = 0;
	this.beingHitY = 0;
	this.color = "#E1C829";
	this.storeXms = 0;
	this.storeYms = 0;
	this.mass = mass;
}

// Function for creating balls
function createBall(x, xms, y, yms, radius, mass) {
	ballsArray.push(new ballConstructor(x, xms, y, yms, radius, mass));
}

// Function for drawing/animating balls
function drawBall() {
	for(var j = 0; j < ballsArray.length; j++) {
		if (ballsArray[j].radius > 0) {
			ctx.beginPath();
			ctx.fillStyle = ballsArray[j].color;
			ctx.arc(ballsArray[j].x, ballsArray[j].y, ballsArray[j].radius, 0, Math.PI*2, false);
			ctx.fill();
			ctx.closePath();

			// Update ball position
			ballsArray[j].x += ballsArray[j].xms;
			ballsArray[j].y += ballsArray[j].yms;

			// Reduce radius so that the ballsArray die after a few seconds
			// ballsArray[j].radius = Math.max(ballsArray[j].radius - 0.05, 0.0);

			// Adds friction to the balls
			ballsArray[j].xms -= ballsArray[j].xms * ballsArray[j].friction;
			ballsArray[j].yms -= ballsArray[j].yms * ballsArray[j].friction;
		} else {
			// Remove the particle object from the array
			ballsArray.splice(j, 1);
		}
	}
}


// **********
//  PLAYERS
// **********
var player1 = {
	height: 100 * canvas.width/1000,
	width: 25 * canvas.width/1000,
	xDefault: canvas.width - (25 * canvas.width/1000)*3,
	yDefault: canvas.height/2 - (100 * canvas.width/1000)/2,
	x: this.xDefault,
	y: this.yDefault,
	xmsDefault: 8 * canvas.width/1000,
	ymsDefault: 8 * canvas.width/1000,
	xms: 10,
	yms: 10,
	// For when hitting on the topside of the paddle
	topSpeed: 0,
	bottomSpeed: 0,
	// paddleSpeed * kickspeed when hitting the ball
	kickMultiplayer: 1.5,
	// Controls
	leftPressed: false,
	rightPressed: false,
	upPressed: false,
	downPressed: false,
	color: "#eee",
	movement: false
};

var player2 = {
	height: 100 * canvas.width/1000,
	width: 25 * canvas.width/1000,
	xDefault: (25 * canvas.width/1000)*2,
	yDefault: canvas.height/2 - (100 * canvas.width/1000)/2,
	x: this.xDefault,
	y: this.yDefault,
	xmsDefault: 8 * canvas.width/1000,
	ymsDefault: 8 * canvas.width/1000,
	xms: 10,
	yms: 10,
	// For when hitting on the topside of the paddle
	topSpeed: 0,
	bottomSpeed: 0,
	// paddleSpeed * kickspeed when hitting the ball
	kickMultiplayer: 1.5,
	// Controls
	dPressed: false,
	aPressed: false,
	wPressed: false,
	sPressed: false,
	color: "#eee",
	movement: false
};



// ***********************
//  No arrowkey scrolling
// ***********************
var ar = new Array(33, 34, 35, 36, 37, 38, 39, 40);
$(document).keydown(function(e) {
	 var key = e.which;
	  if($.inArray(key,ar) > -1) {
		  e.preventDefault();
		  return false;
	  }
	  return true;
});



// ********************
//  Arrowkey controls
// ********************
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
// The jQuery Hotkeys plugin makes key handling across browsers much much easier. Rather than crying over indecipherable cross-browser keyCode and charCode issues, we can bind events like so:
// $(document).bind("keydown", "left", function() { ... });
// function update() {
//   if (keydown.left) {
//     player.x -= 2;
//   }

//   if (keydown.right) {
//     player.x += 2;
//   }
// }


function keyDownHandler(e) {
	// Start game with space IF you are in the menu
	if(menuOn) {
		if (e.keyCode === 0 || e.keyCode === 32) {
			startGame();
		}
	}

	if(player1.movement) {
		if(e.keyCode == 39) {
			player1.rightPressed = true;
		}
		else if(e.keyCode == 37) {
			player1.leftPressed = true;
		}
		else if(e.keyCode == 38) {
			player1.upPressed = true;
		}
		else if(e.keyCode == 40) {
			player1.downPressed = true;
		}
	}

	if(player2.movement) {
		if(e.keyCode == 87) {
			player2.wPressed = true;
		}
		else if(e.keyCode == 68) {
			player2.dPressed = true;
		}
		else if(e.keyCode == 83) {
			player2.sPressed = true;
		}
		else if(e.keyCode == 65) {
			player2.aPressed = true;
		}
	}
}


function keyUpHandler(e) {
	if(e.keyCode == 39) {
		player1.rightPressed = false;
	}
	else if(e.keyCode == 37) {
		player1.leftPressed = false;
	}
	else if(e.keyCode == 38) {
		player1.upPressed = false;
	}
	else if(e.keyCode == 40) {
		player1.downPressed = false;
	}
	else if(e.keyCode == 87) {
		player2.wPressed = false;
	}
	else if(e.keyCode == 68) {
		player2.dPressed = false;
	}
	else if(e.keyCode == 83) {
		player2.sPressed = false;
	}
	else if(e.keyCode == 65) {
		player2.aPressed = false;
	}
}


function toggleMovementPlayer1() {
	player1.movement = !player1.movement;
}


function toggleMovementPlayer2() {
	player2.movement = !player2.movement;
}


// function newBall() {
// 	player1.movement = false;
// 	player2.movement = false;
// 	ball.radius = 0;
// 	ball.x = ball.xDefault;
// 	ball.y = ball.yDefault;
// 	player1.x = player1.xDefault;
// 	player1.y = player1.yDefault;
// 	player2.x = player2.xDefault;
// 	player2.y = player2.yDefault;
// 	ball.xms = ball.xmsDefault;
// 	ball.yms = ball.ymsDefault;
// }
function newBall() {
	player1.movement = false;
	player2.movement = false;
	player1.x = player1.xDefault;
	player1.y = player1.yDefault;
	player2.x = player2.xDefault;
	player2.y = player2.yDefault;

	createBall(canvas.width/2 - 10/2, 0, canvas.height/2 - 10/2, 0, 10, 1);
	// Shoots the last ball created
	ballsArray[ballsArray.length - 1].xms = (Math.round(Math.random() * 5) + 7) * (Math.round(Math.random()) * 2 - 1) * canvas.width/1000;
	ballsArray[ballsArray.length - 1].yms = (Math.round(Math.random() * 2) + 4) * (Math.round(Math.random()) * 2 - 1) * canvas.width/1000;
	console.log("New ball created! = " + ballsArray[0]);
	player1.movement = true;
	player2.movement = true;
}

newBall();


function drawPlayer1() {
	// Main rectangle
	ctx.beginPath();
	ctx.rect(player1.x, player1.y, player1.width, player1.height);
	ctx.fillStyle = player1.color;
	ctx.fill();
	ctx.closePath();

	// Rectangle-ception
	ctx.beginPath();
	ctx.rect(player1.x + 5, player1.y + 5, player1.width - 10, player1.height - 10);
	ctx.fillStyle = "#1E023F";
	ctx.fill();
	ctx.closePath();
}


function drawPlayer2() {
	// Main rectangle
	ctx.beginPath();
	ctx.rect(player2.x, player2.y, player2.width, player2.height);
	ctx.fillStyle = player2.color;
	ctx.fill();
	ctx.closePath();
}


var particles = [];

// Constructor for particle objects
function collisionParticlesConstructor(x, y, m) {
	this.x = x;
	this.y = y;
	this.radius = 1 * Math.random()*3 + 0.5;
	this.vx = m * Math.random()*3;
	this.vy = -1.5 + Math.random()*3;
}


// Function for creating particles
function createCollisionParticles(x, y, m, quantity) {
	for(i = 0; i < quantity; i++) {
		particles.push(new collisionParticlesConstructor(x, y, m));
	}
}

// Function for emitting particles
function drawParticles() {
	for(var j = 0; j < particles.length; j++) {
		if (particles[j].radius > 0) {
			ctx.beginPath();
			ctx.fillStyle = "#E1C829";
			ctx.arc(particles[j].x, particles[j].y, particles[j].radius, 0, Math.PI*2, false);
			ctx.fill();
			ctx.closePath();

			// Update particle position
			particles[j].x += particles[j].vx;
			particles[j].y += particles[j].vy;

			// Reduce radius so that the particles die after a few seconds
			particles[j].radius = Math.max(particles[j].radius - 0.05, 0.0);

			// Update particle velocity
			particles[j].vx -= 0.01 * particles[j].vx;
			particles[j].vy -= 0.01 * particles[j].vy;
		} else {
			// Remove the particle object from the array
			particles.splice(j, 1);
		}
	}
}


var boolDrawbossBall = false;

function newBoss(lvl) {
	ball.storeXms = ball.xms;
	ball.storeYms = ball.yms;
	ball.yms = 0;
	ball.xms = 0;
	// player1.movement = false;
	// player2.movement = false;
	if(lvl == 1) {
		drawbossBall();
	}
}


function drawbossBall() {
	ctx.beginPath();
	ctx.arc(bossBall.x, bossBall.y, bossBall.radius, 10, 0, Math.PI*2);
	ctx.fillStyle = "rgba(200, 150, 200, 0.5)";
	ctx.fill();
	ctx.closePath();
}


function sprite (options) {
	var that = {},
		frameIndex = 0,
		tickCount = 0,
		ticksPerFrame = options.ticksPerFrame || 0,
		numberOfFrames = options.numberOfFrames || 1;

	that.ctx = ctx;
	that.width = options.width;
	that.height = options.height;
	that.x = options.x || 0;
	that.y = options.y || 0;
	that.image = options.image;
	that.scaleRatio = options.scaleRatio || 1;

	that.update = function () {

		tickCount += 1;

		if (tickCount > ticksPerFrame) {

			tickCount = 0;

			// If the current frame index is in range
			if (frameIndex < numberOfFrames - 1) {
				// Go to the next frame
				frameIndex += 1;
			} else {
				frameIndex = 0;
			}
		}
	};

	that.render = function () {

	  // Draw the animation
	  ctx.drawImage(
		that.image,
		frameIndex * that.width / numberOfFrames,
		0,
		that.width / numberOfFrames,
		that.height,
		that.x,
		that.y,
		that.width / numberOfFrames * that.scaleRatio,
		that.height * that.scaleRatio);
	};

	that.getFrameWidth = function () {
		return that.width / numberOfFrames;
	};

	return that;
}


function draw() {
	requestAnimationFrame(draw);

	if(!menuOn) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawBall();
		drawPlayer1();
		drawPlayer2();
		drawParticles();

		// For debugging
		// console.log("Ball: x = " + ballsArray[0].x + " y = " + ballsArray[0].y);

		// ctx.beginPath();
		// ctx.moveTo(canvas.width / 2, canvas.height / 2);
		// ctx.lineTo(, );
		// ctx.stroke();

		if(boolDrawbossBall) {
			drawbossBall();
			bossSprite.update();
			bossSprite.render();

			if(bossBall.y < canvas.height/2) {
				bossBall.y = bossBall.y + 3;
				bossSprite.y = bossBall.y;
			}
		}
	}
}


/*---------------------------------------------------------------------------------------------------------------------------------------------------
																	COLLISION LOGIC
---------------------------------------------------------------------------------------------------------------------------------------------------*/


var lastHit;

function game() {
	requestAnimationFrame(game);

	// :::BALLZ TO THE WALLZ COLLISION:::
	// right side
	for(i = 0; i < ballsArray.length; i++) {
		if(ballsArray[i].x + ballsArray[i].xms > canvas.width + ballsArray[i].radius) {
			// Destroys the ball
			ballsArray.splice(i, 1);

			player2Score++;
			teamScore = 0;
			document.getElementById("ball_in_play_count").innerHTML = teamScore;
			document.getElementById("scorePlayer2").innerHTML = player2Score;

			// Reset score
			teamScore = 0;
			document.getElementById("ball_in_play_count").innerHTML = teamScore;

			lastHit = null;
			newBall();
		}


		// left side
		if(ballsArray[i].x + ballsArray[i].xms < 0 - ballsArray[i].radius) {
			// Destroys the ball
			ballsArray.splice(i, 1);

			player1Score++;
			teamScore = 0;
			document.getElementById("ball_in_play_count").innerHTML = teamScore;
			document.getElementById("scorePlayer1").innerHTML = player1Score;

			// Reset score
			teamScore = 0;
			document.getElementById("ball_in_play_count").innerHTML = teamScore;

			lastHit = null;
			newBall();
		}

		// top side
		if(ballsArray[i].y + ballsArray[i].yms > canvas.height - ballsArray[i].radius) {
			ballsArray[i].yms = -ballsArray[i].yms;
			sfxHitWall.play();

			lastHit = null;
		}

		// bottom side
		if(ballsArray[i].y + ballsArray[i].yms < ballsArray[i].radius) {
			ballsArray[i].yms = -ballsArray[i].yms;
			sfxHitWall.play();

			lastHit = null;
		}
	}

	// Paddle movement (paddle + wall collision)
	if(player1.rightPressed && player1.x < canvas.width - player1.width) {
		player1.x += player1.xms;
	}
	if(player1.leftPressed && player1.x > 0) {
		player1.x -= player1.xms;
	}
	if(player1.upPressed && player1.y > 0) {
		player1.y -= player1.yms;
	}
	if(player1.downPressed && player1.y < canvas.height - player1.height) {
		player1.y += player1.yms;
	}
	if(player2.dPressed && player2.x < canvas.width-player1.width) {
		player2.x += player2.xms;
	}
	if(player2.aPressed && player2.x > 0) {
		player2.x -= player2.xms;
	}
	if(player2.wPressed && player2.y > 0) {
		player2.y -= player2.yms;
	}
	if(player2.sPressed && player2.y < canvas.height - player2.height) {
		player2.y += player2.yms;
	}


	// :::PLAYER 1 + BALL COLLISION:::
	for(i = 0; i < ballsArray.length; i++) {
		// Distance between ball x-position and paddle-center < ball radius + half the paddle width (+ xms)
		if(Math.abs(ballsArray[i].x - (player1.x + player1.width/2)) <= ballsArray[i].radius + player1.width/2 + Math.abs(ballsArray[i].xms) &&
		// Distance between ball y-position and paddle-center < ball radius + half the paddle height (+ yms)
		   Math.abs(ballsArray[i].y - (player1.y + player1.height/2)) <= ballsArray[i].radius + player1.height/2 + Math.abs(ballsArray[i].yms) && lastHit != "player1") {

		   	// Sets the ball's x-velocity to either a positive or a negative value depending on which side of the paddle it hit
		    // Left-side hit
			if(ballsArray[i].x < player1.x + player1.width/2) {
				ballsArray[i].xms = -player1.xms * player1.kickMultiplayer;
				createCollisionParticles(ballsArray[i].x + ballsArray[i].radius - Math.abs(ballsArray[i].xms), ballsArray[i].y, -1, 20);
			// Right-side hit
			}else{
				ballsArray[i].xms = player1.xms * player1.kickMultiplayer;
				createCollisionParticles(ballsArray[i].x - ballsArray[i].radius + Math.abs(ballsArray[i].xms), ballsArray[i].y, 1, 20);
			}

			// Changes the ball's y-speed and changes the movement in the y-direction depending on where it hits the paddle
			ballsArray[i].yms = (((((100 / player1.height) * (ballsArray[i].y - player1.y)) * 2) - 100) / 100) * player1.xms;

			// Plays a random sound effect from the array
			sfxHitArray[Math.floor(Math.random() * sfxHitArray.length)].play();

			// Update score
			teamScore ++;
			document.getElementById("ball_in_play_count").innerHTML = teamScore;

			// lastHit is set to player1 to prevent the collision code from being executed more than once
			lastHit = "player1";
		}


		// :::PLAYER 2 + BALL COLLISION:::
		if(Math.abs(ballsArray[i].x - (player2.x + player2.width/2)) <= ballsArray[i].radius + player2.width/2 + Math.abs(ballsArray[i].xms) &&
		   Math.abs(ballsArray[i].y - (player2.y + player2.height/2)) <= ballsArray[i].radius + player2.height/2 + Math.abs(ballsArray[i].yms) && lastHit != "player2") {

			if(ballsArray[i].x < player2.x + player2.width/2) {
				ballsArray[i].xms = -player2.xms * player2.kickMultiplayer;
				createCollisionParticles(ballsArray[i].x + ballsArray[i].radius - Math.abs(ballsArray[i].xms), ballsArray[i].y, -1, 20);
			}else{
				ballsArray[i].xms = player2.xms * player2.kickMultiplayer;
				createCollisionParticles(ballsArray[i].x - ballsArray[i].radius + Math.abs(ballsArray[i].xms), ballsArray[i].y, 1, 20);
			}

			ballsArray[i].yms = (((((100 / player2.height) * (ballsArray[i].y - player2.y)) * 2) - 100) / 100) * player2.xms;
			sfxHitArray[Math.floor(Math.random() * sfxHitArray.length)].play();
			teamScore ++;
			document.getElementById("ball_in_play_count").innerHTML = teamScore;
			lastHit = "player2";
		}
	}


	// :::PADDLE + PARTICLE COLLISION:::
	for(var i = 0; i < particles.length; i++) {
		// Player 1
		if(Math.abs(particles[i].x - (player1.x + player1.width/2)) <= particles[i].radius + player1.width/2 + Math.abs(particles[i].vx) &&
		   Math.abs(particles[i].y - (player1.y + player1.height/2)) <= particles[i].radius + player1.height/2 + Math.abs(particles[i].vy)) {

			particles[i].vx -= (particles[i].x < player1.x + player1.width/2) ? player1.xms : -player1.xms;
			particles[i].x += particles[i].vx;
			particles[i].y += particles[i].vy;
		}

		// Player 2
		if(Math.abs(particles[i].x - (player2.x + player2.width/2)) <= particles[i].radius + player2.width/2 + Math.abs(particles[i].vx) &&
		   Math.abs(particles[i].y - (player2.y + player2.height/2)) <= particles[i].radius + player2.height/2 + Math.abs(particles[i].vy)) {

			particles[i].vx -= (particles[i].x < player2.x + player2.width/2) ? player2.xms : -player2.xms;
			particles[i].x += particles[i].vx;
			particles[i].y += particles[i].vy;
		}
	}


	// :::BALL + BOSS COLLISION:::
	for(i = 0; i < ballsArray.length; i++) {
		if(Math.sqrt(Math.pow(ballsArray[i].x - bossBall.x, 2) + Math.pow(ballsArray[i].y - bossBall.y, 2)) <= ballsArray[i].radius + bossBall.radius /*&& lastHit != "boss"*/) {
			if(debugging) {console.log("green!");}

			var ballVelocity = Math.sqrt(Math.pow(ballsArray[i].xms, 2) + Math.pow(ballsArray[i].yms, 2));
			if(debugging) {console.log("ballVelocity = " + ballVelocity);}

			var bossVelocity = Math.sqrt(Math.pow(bossBall.xms, 2) + Math.pow(bossBall.yms, 2)) + 1; // alert +1 to avoid devide by zero
			if(debugging) {console.log("bossVelocity = " + bossVelocity);}

			var thetaBall = Math.abs(Math.acos(ballsArray[i].xms / ballVelocity));
			if(debugging) {console.log("thetaBall = " + thetaBall);}

			var thetaBoss = Math.abs(Math.acos(bossBall.xms / bossVelocity));
			if(debugging) {console.log("thetaBoss = " + thetaBoss);}

			var phi = Math.acos((ballsArray[i].xms * (bossBall.x - ballsArray[i].x) + ballsArray[i].yms * (bossBall.y - ballsArray[i].y)) / (ballVelocity * Math.sqrt(Math.pow(bossBall.x - ballsArray[i].x, 2) + Math.pow(bossBall.y - ballsArray[i].y, 2))));
			if(debugging) {console.log("phi = " + phi);}

			ballsArray[i].xms = (ballVelocity * Math.cos(thetaBall - phi) * (ballsArray[i].mass - bossBall.mass) + 2 * bossBall.mass * bossVelocity * Math.cos(thetaBoss - phi)) / (ballsArray[i].mass + bossBall.mass) * Math.cos(phi) + ballVelocity * Math.sin(thetaBall - phi) * Math.cos(phi + Math.PI / 2);
			ballsArray[i].yms = (ballVelocity * Math.cos(thetaBall - phi) * (ballsArray[i].mass - bossBall.mass) + 2 * bossBall.mass * bossVelocity * Math.cos(thetaBoss - phi)) / (ballsArray[i].mass + bossBall.mass) * Math.sin(phi) + ballVelocity * Math.sin(thetaBall - phi) * Math.sin(phi + Math.PI / 2);
			if(debugging) {console.log("ballsArray[i].xms = " + ballsArray[i].xms + " ballsArray[i].yms = " + ballsArray[i].yms);}

			lastHit = "boss";
		}
	}
} // End of game()

startGame();
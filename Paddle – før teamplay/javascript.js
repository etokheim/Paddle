// ********************
//    Menu settings
// ********************
// highlight the multiplayer mode
if(multiplayer) {
	document.getElementById("2_players").style.background = "rgba(255, 255, 255, .3)";
} else {
	document.getElementById("1_player").style.background = "rgba(255, 255, 255, .3)";
}
function togglePlayerCount(object) {
	multiplayer = !multiplayer;
	document.getElementById(object).style.background = "rgba(255, 255, 255, .3)";
	if(object == "1_player") {
		document.getElementById("2_players").style.background = "none";
	} else {
		document.getElementById("1_player").style.background = "none";
	}
}


// highlight the teamplay mode
if(teamplay) {
	document.getElementById("teamplay").style.background = "rgba(255, 255, 255, .3)";
} else {
	document.getElementById("no_teamplay").style.background = "rgba(255, 255, 255, .3)";
}
function toggleTeamplay(object) {
	teamplay = !teamplay;
	console.log(object);
	document.getElementById(object).style.background = "rgba(255, 255, 255, .3)";
	if(object == "no_teamplay") {
		document.getElementById("teamplay").style.background = "none";
	} else {
		document.getElementById("no_teamplay").style.background = "none";
	}
}

var canvas = document.getElementById("canvas_id");
var ctx = canvas.getContext("2d");
var FPS = 30;
var passToDraw = [];

// ********************
//  Game settings etc.
// ********************
var player1Score = 0;
var player2Score = 0;
var timePlayed = 0;
var movementPlayer1 = false;
var movementPlayer2 = false;
var multiplayer = false;
var teamplay = true;
var canvasColor = "#1E023F";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.backgroundColor = canvasColor;
window.onresize = function() {
	// alert("WINDOW RESIZED! Refresh page to compensate");
}

// ********************
//   Sound effects! 
// ********************
// buffers automatically when created
var sfxHitWall = new Audio("sfx/hitWall.mp3");
var sfxHitArray = [new Audio("sfx/hit1.mp3"), new Audio("sfx/hit2.mp3"), new Audio("sfx/hit3.mp3")];
// (new Audio()).canPlayType("audio/ogg; codecs=vorbis");
// more advanced audio stuff: http://webaudio.github.io/web-audio-api/



// **********
//   Ball 1
// **********
var ballXMSDefault = 0;
var ballYMSDefault = 0;
var ballXMS = 0;
var ballYMS = 0;
var ballXDefault = canvas.width / 2;
var ballYDefault = canvas.height / 2;
var ballX = ballXDefault;
var ballY = ballYDefault;
var ballRadiusDefault = 10 * canvas.width/1000;
var ballRadius = 0;
var ballFriction = 0.995;
// ball not being hit = 0;
// ball being hit on the left side = 1;
// ball being hit on the right side = 2;
var ballBeingHit = 0;
var ballBeingHitX = 0;
var ballBeingHitY = 0;
var ballColor = "#E1C829";

var ballGhost1X = ballX - ballXMS;
var ballGhost1Y = ballY - ballYMS;
var ballGhost2X = ballX - ballXMS*2;
var ballGhost2Y = ballY - ballYMS*2;
var ballGhost1Radius = 0;
var ballGhost2Radius = 0;


// **********
//  PLAYER 1
// **********
var paddleHeight = 100 * canvas.width/1000;
var paddleWidth = 25 * canvas.width/1000;
var paddleXMS = 8 * canvas.width/1000;
var paddleYMS = 8 * canvas.width/1000;
var topSpeed = 0;
var bottomSpeed = 0;
// paddleSpeed * kickspeed when hitting the ball
var kickMultiplayer = 1.5;
var paddleXDefault = canvas.width - canvas.width/25 - paddleWidth;
var paddleYDefault = canvas.height / 2 - paddleHeight / 2;
var paddleX = paddleXDefault;
var paddleY = paddleYDefault;
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;
var paddlePlayer1Color = "#eeeeee";


// **********
//  PLAYER 2
// **********
var paddleHeight2 = 100 * canvas.width/1000;
var paddleWidth2 = 25 * canvas.width/1000;
var paddleXMS2Default = 8 * canvas.width/1000;
var paddleYMS2Default = 8 * canvas.width/1000;
var paddleXMS2 = paddleXMS2Default;
var paddleYMS2 = paddleYMS2Default;
var topSpeed2 = 0;
var bottomSpeed2 = 0;
// paddleSpeed * kickspeed when hitting the ball
var kickMultiplayer2 = 1.5;
var paddleX2Default = canvas.width/25;
var paddleY2Default = canvas.height / 2 - paddleHeight / 2;
var paddleX2 = paddleX2Default;
var paddleY2 = paddleY2Default;
var dPressed = false;
var aPressed = false;
var wPressed = false;
var sPressed = false;
var paddlePlayer2Color = "#eeeeee";


// **********
//   tests
// **********
var particles = [];
var particlesCount = 20;
var particlePos = {};
var multiplier = 1;
var particleSize = 2 * canvas.width/1000;
var createParticlesY = 0;


// ***********************
//  No arrowkey scrolling
// ***********************
var ar = new Array(33,34,35,36,37,38,39,40);
$(document).keydown(function(e) {
     var key = e.which;
      //console.log(key);
      //if(key==35 || key == 36 || key == 37 || key == 39)
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
	if(movementPlayer1) {
		if(e.keyCode == 39) {
			rightPressed = true;
		}
		else if(e.keyCode == 37) {
			leftPressed = true;
		}
		else if(e.keyCode == 38) {
			upPressed = true;
		}
		else if(e.keyCode == 40) {
			downPressed = true;
		}
	}
	if(movementPlayer2) {
		if(e.keyCode == 87) {
			wPressed = true;
		}
		else if(e.keyCode == 68) {
			dPressed = true;
		}
		else if(e.keyCode == 83) {
			sPressed = true;
		}
		else if(e.keyCode == 65) {
			aPressed = true;
		}
	}
}

function keyUpHandler(e) {
	if(e.keyCode == 39) {
		rightPressed = false;
	}
	else if(e.keyCode == 37) {
		leftPressed = false;
	}
	else if(e.keyCode == 38) {
		upPressed = false;
	}
	else if(e.keyCode == 40) {
		downPressed = false;
	}   
	else if(e.keyCode == 87) {
		wPressed = false;
	}
	else if(e.keyCode == 68) {
		dPressed = false;
	}
	else if(e.keyCode == 83) {
		sPressed = false;
	}
	else if(e.keyCode == 65) {
		aPressed = false;
	}
}

function toggleMovementPlayer1() {
	movementPlayer1 = !movementPlayer1;
}

function toggleMovementPlayer2() {
	movementPlayer2 = !movementPlayer2;
}
newBall();

function newBall() {
	movementPlayer1 = false;
	movementPlayer2 = false;
	ballX = ballXDefault;
	ballY = ballYDefault;
	paddleX = paddleXDefault;
	paddleY = paddleYDefault;
	paddleX2 = paddleX2Default;
	paddleY2 = paddleY2Default;
	ballRadius = 0;
	ballXMS = ballXMSDefault;
	ballYMS = ballYMSDefault;

	passToDraw.push(newBall2);
}

function newBall2() {
	if(ballRadius < ballRadiusDefault) {
		ballRadius++;
		ballGhost1Radius = ballRadius * 0.75;
		ballGhost2Radius = ballRadius * 0.5;
	} else {
		passToDraw = [];
		ballXMS = (Math.round(Math.random() * 5) + 7) * (Math.round(Math.random()) * 2 - 1) * canvas.width/1000;
		ballYMS = (Math.round(Math.random() * 2) + 4) * (Math.round(Math.random()) * 2 - 1) * canvas.width/1000;
		movementPlayer1 = true;
		movementPlayer2 = true;
	}
}


function drawPlayer1() {
	ctx.beginPath();
	ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight);
	ctx.fillStyle = paddlePlayer1Color;
	ctx.fill();
	ctx.closePath();
}


function tester1() {
	ctx.beginPath();
	ctx.rect(paddleX + 5, paddleY + 5, paddleWidth - 10, paddleHeight - 10);
	ctx.fillStyle = "#1E023F";
	ctx.fill();
	ctx.closePath();
}

function drawPlayer2() {
	ctx.beginPath();
	ctx.rect(paddleX2, paddleY2, paddleWidth2, paddleHeight2);
	ctx.fillStyle = paddlePlayer2Color;
	ctx.fill();
	ctx.closePath();
}

function drawBall() {
	ctx.beginPath();
	ctx.arc(ballX, ballY, ballRadius, 10, 0, Math.PI*2);
	ctx.fillStyle = ballColor;
	ctx.fill();
	ctx.closePath();
}

function drawBallGhost1() {
	ctx.beginPath();
	ctx.arc(ballGhost1X, ballGhost1Y, ballGhost1Radius, 10, 0, Math.PI*2);
	ctx.fillStyle = ballColor;
	ctx.fill();
	ctx.closePath();
}

function drawBallGhost2() {
	ctx.beginPath();
	ctx.arc(ballGhost2X, ballGhost2Y, ballGhost2Radius, 10, 0, Math.PI*2);
	ctx.fillStyle = ballColor;
	ctx.fill();
	ctx.closePath();
}

// Function for creating particles object
function createParticles(x, y, m) {
	this.x = x || 0;
	this.y = y || 0;
	
	this.radius = particleSize;
	
	this.vx = m * Math.random()*1.5;
	this.vy = -1.5 + Math.random()*3;
}

// Function for emitting particles
function drawParticles() { 
	for(var j = 0; j < particles.length; j++) {		
		ctx.beginPath();
		ctx.fillStyle = ballColor;
		if (particles[j].radius > 0) {
			ctx.arc(particles[j].x, particles[j].y, particles[j].radius, 0, Math.PI*2, false);
		}
		ctx.fill();
		
		particles[j].x += particles[j].vx;
		particles[j].y += particles[j].vy;
		
		// Reduce radius so that the particles die after a few seconds
		particles[j].radius = Math.max(particles[j].radius - 0.05, 0.0);
	}
}

// var splashParticleCount = 0;
// var splashParticles = [];
// function objMkr(up, right) {
// 	var splashParticleObject = NaN;
// 	var sp = {"up": up, "right": right};
// 	splashParticleCount++;

// 	return sp;
// }

// var obj1 = new objMkr(50, 100);
// splashParticles.push(obj1);
// obj1 = new objMkr(25, 120);
// splashParticles.push(obj1);
// obj1 = new objMkr(115, 20);
// splashParticles.push(obj1);
// obj1 = new objMkr(60, 40);
// splashParticles.push(obj1);

// function splashMovement() {
// 	// display and move the objects

// 	// ctx.beginPath();
// 	// ctx.arc(ballX, ballY, 3, 10, 0, Math.PI*2);
// 	// ctx.fillStyle = "#0095DD";
// 	// ctx.fill();
// 	// ctx.closePath();
// }

function draw() {
	requestAnimationFrame(draw);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBallGhost2();
	drawBallGhost1();
	drawBall();
	drawPlayer1();
	drawPlayer2();
	tester1();

	if(passToDraw.length > 0) {
		// console.log(passToDraw.length)
		for (var i = 0; i < passToDraw.length; i++) {
			// console.log("function being passed to draw()");
			passToDraw[i]();
		}
		// passToDraw = [];
	}
}
draw();

function game() {
	requestAnimationFrame(game);
	// Ball + wall collision
	// right side
	if(ballX + ballXMS > canvas.width + ballRadius) {
		// ballXMS = -ballXMS;

		player2Score++;
		document.getElementById("scorePlayer2").innerHTML = player2Score;

		newBall();
	}
	// left side
	if(ballX + ballXMS < 0 - ballRadius) {
		// ballXMS = -ballXMS;

		player1Score++;
		document.getElementById("scorePlayer1").innerHTML = player1Score;

		newBall();
	}
	// top side
	if(ballY + ballYMS > canvas.height-ballRadius) {
		ballYMS = -ballYMS;
		sfxHitWall.play();
	}
	// bottom side
	if(ballY + ballYMS < ballRadius) {
		ballYMS = -ballYMS;
		sfxHitWall.play();
	}

	// Paddle movement
	if(rightPressed && paddleX < canvas.width-paddleWidth) {
		paddleX += paddleXMS;
	}
	if(leftPressed && paddleX > 0) {
		paddleX -= paddleXMS;
	}
	if(upPressed && paddleY > 0) {
		paddleY -= paddleYMS;
	}
	if(downPressed && paddleY < canvas.height - paddleHeight) {
		paddleY += paddleYMS;
	}
	if(dPressed && paddleX2 < canvas.width-paddleWidth) {
		paddleX2 += paddleXMS2;
	}
	if(aPressed && paddleX2 > 0) {
		paddleX2 -= paddleXMS2;
	}
	if(wPressed && paddleY2 > 0) {
		paddleY2 -= paddleYMS2;
	}
	if(sPressed && paddleY2 < canvas.height - paddleHeight2) {
		paddleY2 += paddleYMS2;
	}

	// paddle + particle collision -> LEFT SIDE
	for(var j = 0; j < particles.length; j++) {
		if(particles[j].x + particles[j].vx > paddleX - particles[j].radius && particles[j].x + particles[j].vx < paddleX + paddleWidth/2
		&& particles[j].y + particles[j].vy > paddleY - particles[j].radius && particles[j].y + particles[j].vy < paddleY + paddleHeight + particles[j].radius) {		
			particles[j].vx += -paddleXMS;
			particles[j].x += particles[j].vx;
			particles[j].y += particles[j].vy;
		} else if(particles[j].x + particles[j].vx > paddleX + paddleWidth/2 - particles[j].radius && particles[j].x + particles[j].vx < paddleX + paddleWidth + particles[j].radius
		&& particles[j].y + particles[j].vy > paddleY - particles[j].radius && particles[j].y + particles[j].vy < paddleY + paddleHeight + particles[j].radius) {
			// rightside
			particles[j].vx += paddleXMS;
			particles[j].x += particles[j].vx;
			particles[j].y += particles[j].vy;
		} else if(particles[j].x + particles[j].vx > paddleX2 + paddleWidth2/2 - particles[j].radius && particles[j].x + particles[j].vx < paddleX2 + paddleWidth2 + particles[j].radius
		&& particles[j].y + particles[j].vy > paddleY2 - particles[j].radius && particles[j].y + particles[j].vy < paddleY2 + paddleHeight2 + particles[j].radius) {
			// rightside
			particles[j].vx += paddleXMS2;
			particles[j].x += particles[j].vx;
			particles[j].y += particles[j].vy;
		} else if(particles[j].x + particles[j].vx > paddleX2 + paddleWidth2/2 - particles[j].radius && particles[j].x + particles[j].vx < paddleX2 + paddleWidth2 + particles[j].radius
		&& particles[j].y + particles[j].vy > paddleY2 - particles[j].radius && particles[j].y + particles[j].vy < paddleY2 + paddleHeight2 + particles[j].radius) {
			// rightside
			particles[j].vx += paddleXMS;
			particles[j].x += particles[j].vx;
			particles[j].y += particles[j].vy;
		}
	}

	// paddle + ball collision -> RIGHT SIDE
	if(ballX + ballXMS > paddleX + paddleWidth/2 - ballRadius && ballX + ballXMS < paddleX + paddleWidth + ballRadius
		&& ballY + ballYMS > paddleY - ballRadius && ballY + ballYMS < paddleY + paddleHeight + ballRadius) {
		ballXMS = paddleXMS * kickMultiplayer;

		// For the particle system
		ballBeingHit = 1;
		multiplier = 1;
		ballbeingHitX = ballX;
		ballbeingHitY = ballY;
		// Sound effects
		sfxHitArray[Math.round(Math.random() * (sfxHitArray.length - 1))].play();
		// Set ballY speed
		ballYMS = (((((100 / paddleHeight) * (ballY - paddleY)) * 2) - 100) / 100) * paddleXMS;
	}
	// paddle + ball collision -> LEFT SIDE
	if(ballX + ballXMS > paddleX - ballRadius && ballX + ballXMS < paddleX + paddleWidth/2
		&& ballY + ballYMS > paddleY - ballRadius && ballY + ballYMS < paddleY + paddleHeight + ballRadius) {
		ballXMS = -paddleXMS * kickMultiplayer;

		// For the particle system
		ballBeingHit = 1;
		multiplier = -1;
		ballbeingHitX = ballX;
		ballbeingHitY = ballY;
		// Sound effects
		sfxHitArray[Math.round(Math.random() * (sfxHitArray.length - 1))].play();
		// Set ballY speed
		ballYMS = (((((100 / paddleHeight) * (ballY - paddleY)) * 2) - 100) / 100) * paddleXMS;
		
	}

	// paddle2 + ball collision -> RIGHT SIDE
	if(ballX + ballXMS > paddleX2 + paddleWidth2/2 - ballRadius && ballX + ballXMS < paddleX2 + paddleWidth2 + ballRadius
		&& ballY + ballYMS > paddleY2 - ballRadius && ballY + ballYMS < paddleY2 + paddleHeight2 + ballRadius) {
		ballXMS = paddleXMS2 * kickMultiplayer2;

		// For the particle system
		ballBeingHit = 1;
		multiplier = 1;
		ballbeingHitX = ballX;
		ballbeingHitY = ballY;
		// Sound effects
		sfxHitArray[Math.round(Math.random() * (sfxHitArray.length - 1))].play();
		// Set ballY speed
		ballYMS = (((((100 / paddleHeight2) * (ballY - paddleY2)) * 2) - 100) / 100) * paddleXMS2;
	}

	// paddle2 + ball collision -> LEFT SIDE
	if(ballX + ballXMS > paddleX2 - ballRadius && ballX + ballXMS < paddleX2 + ballRadius
		&& ballY + ballYMS > paddleY2 - ballRadius && ballY + ballYMS < paddleY2 + paddleHeight2 + ballRadius) {
		ballXMS = -paddleXMS2 * kickMultiplayer;

		// For the particle system
		ballBeingHit = 1;
		multiplier = -1;
		ballbeingHitX = ballX;
		ballbeingHitY = ballY;
		// Sound effects
		sfxHitArray[Math.round(Math.random() * (sfxHitArray.length - 1))].play();
		// Set ballY speed
		ballYMS = (((((100 / paddleHeight2) * (ballY - paddleY2)) * 2) - 100) / 100) * paddleXMS2;
	}

	ballXMS = ballXMS * ballFriction;
	ballYMS = ballYMS * ballFriction;
	ballGhost1X = ballX - ballXMS*0.03/2;
	ballGhost1Y = ballY - ballYMS*0.03/2;
	ballGhost2X = ballX - ballXMS*0.7;
	ballGhost2Y = ballY - ballYMS*0.7;
	ballX += ballXMS;
	ballY += ballYMS;



	// If ballBeingHit has a value, push the particles
	if(ballBeingHit == 1) {
		if(multiplier == 1) {
			// creating the particles
			for(var k = 0; k < particlesCount; k++) {
				particles.push(new createParticles(ballX - ballRadius*2, ballY, multiplier));
			}
		}
		if(multiplier == -1) {
			// creating the particles
			for(var k = 0; k < particlesCount; k++) {
				particles.push(new createParticles(ballX + ballRadius*2, ballY, multiplier));
			}
		}
	}

	for (var i = 0; i < particles.length; i++) {
		particles[i].vx = particles[i].vx - 0.1*particles[i].vx;
		particles[i].vy = particles[i].vy - 0.1*particles[i].vy; 
	};
	
	// Emit particles/sparks
	drawParticles();
	
	// reset ballBeingHit
	ballBeingHit = 0;
}

function toggleMenu() {
	$(".menu_on").toggleClass("menu_off");
}

function toggleSettings() {
	$(".settings_on").toggleClass("settings_off");
	console.log("settings toggled");
}
toggleSettings();

function startGame() {
	toggleMenu();

	game();
	// setInterval(function() {
	// 	game();
	// }, 10);

	// setInterval(function() {
	// 	draw();
	// }, 1000 / FPS);
}

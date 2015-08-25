window.addEventListener("load",init,false);
window.addEventListener("keydown",onKeyDown,false);
window.addEventListener("keyup",onKeyUp,false);
window.addEventListener("mousemove",onMouseMove,false);

var WIDTH = 1000;
var HEIGHT = 500;

var ctx;

var x = WIDTH/2;
var y = HEIGHT/2;
var dx = 0;
var dy = 0;

var intervalId=0;

var paddlex;
var paddleh;
var paddlew;
var ballr = 10;

var bricks;
var NROWS = 5;
var NCOLS = 10;
var BRICKWIDTH = (WIDTH/NCOLS) - 1;
var BRICKHEIGHT = 20;
var PADDING = 1;
var BrokenB = 0;
var TotalB = NROWS * NCOLS;

var rowcolors=["#2c3e50","#18bc9c","#3498db","#f39c12","#e74c3c"];


var rightDown = false;
var leftDown = false;

var isPaused = false;
var isStarted = false;
var isFinished = false;
var isDead = false;

var audio_blop = new Audio("audio/blop.mp3");
var audio_pop = new Audio("audio/pop.mp3");
var audio_pling = new Audio("audio/pling.mp3");

function onKeyDown(evt){
  if(evt.keyCode == 39) rightDown = true;
  if(evt.keyCode == 37) leftDown = true;  
  if(evt.keyCode == 80) pause();
  if(evt.keyCode == 83) start();
  if(evt.keyCode == 82) restart();
  if(evt.keyCode == 67) cont();
}

function onKeyUp(evt){
  if(evt.keyCode == 39) rightDown = false;
  if(evt.keyCode == 37) leftDown = false;  
}

function onMouseMove(evt){
  var canvas = document.getElementById("canvas");
  var rect = canvas.getBoundingClientRect();
  var aux = evt.pageX - rect.left - (paddlew/2);
  if (aux > 0-paddlew+10 && aux < WIDTH-10){ 
    paddlex = aux;
  }
}

function init_paddle(){
  paddleh = 10;
  paddlew = 100;
  paddlex = (WIDTH / 2) - (paddlew/2);
}

function init_bricks(){
  bricks = new Array(NROWS);
  for(var i=0;i<NROWS;i++){
    bricks[i] = new Array(NCOLS);
    for(var j=0;j<NCOLS;j++){
      bricks[i][j] = 1;
    }
  }
}

function check_collision(){
  rowheight = BRICKHEIGHT + PADDING;
  colwidth = BRICKWIDTH + PADDING;
  row = Math.floor(y/rowheight);
  col = Math.floor(x/colwidth);
  if(row < NROWS  && row >= 0 && col >= 0 && bricks[row][col] == 1){
    audio_blop.play();
    dy = -dy;
    bricks[row][col] = 0;
    BrokenB++;
    document.getElementById("progbar").style.width= (BrokenB*100)/TotalB +"%";
  }
  if(BrokenB==TotalB){
   gameFinished();
  }
}

function gameFinished(){
  isFinished = true;
  clearInterval(intervalId);
  clear();
  ctx.font = "bold 55px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("GAME FINISHED!",WIDTH/2,HEIGHT/2);
  isStarted = false;
}

function init(){
  var canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  intervalId = setInterval(draw,10);
  init_paddle();
  init_bricks();
  //draw(); 
    ctx.save();
    ctx.font = "bold 55px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Press S to Start",WIDTH/2,HEIGHT/2);
    ctx.restore();
}

function draw(){
  if(!isPaused && isStarted){
    clear();
    ctx.save();
    ctx.fillStyle = "#575050"
    circle(x,y,ballr);
    rect(paddlex, HEIGHT-paddleh,paddlew,paddleh);
    ctx.restore();
    check_collision();
    draw_bricks();
    
    if(x > WIDTH - ballr){
      dx = -dx;
      x = WIDTH - ballr;
    }
    if(x < ballr){
      dx = -dx;
      x = ballr;
    }
    if(y < ballr){ 
      dy = -dy;
      y = ballr;
    }else if(y > HEIGHT-ballr){
      if(x > paddlex &&  x < paddlex + paddlew) {
        audio_blop.play();
        dx = 8 * ((x-(paddlex+paddlew/2))/paddlew);
        dy = -dy;
        y = HEIGHT - ballr;
      }
      else if(y + ballr > HEIGHT){
        clearInterval(intervalId);
        isDead = true;
          ctx.save();
          ctx.font = "bold 55px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("You Lost! Press R to Restart",WIDTH/2,HEIGHT/2);
          ctx.restore();
      }
    }
    
    if(rightDown&&paddlex<(WIDTH-10)) paddlex +=5;
    if(leftDown&&paddlex>-90) paddlex -= 5;
    
    x += dx;
    y += dy;
  }
}

function draw_bricks(){
  ctx.save();
  for(i=0;i<NROWS;i++){
    ctx.fillStyle = rowcolors[i];
    for(j=0;j<NCOLS;j++){
      if(bricks[i][j] == 1){
        rect((j*(BRICKWIDTH + PADDING)) + PADDING,
             (i*(BRICKHEIGHT + PADDING)) + PADDING,
             BRICKWIDTH, BRICKHEIGHT);
      }
    }
  }
  ctx.restore();
}

function circle(x,y,r){
  ctx.beginPath();
  ctx.arc(x,y,r,0,Math.PI*2,true);
  ctx.closePath();
  ctx.fill();
}

function rect(x,y,w,h){
  //ctx.beginPath();
  //ctx.rect(x,y,w,h);
  //ctx.closePath();
  //ctx.fill();
  roundRect(x,y,w,h);
}

function clear(){
  ctx.clearRect(0,0,WIDTH,HEIGHT);
}

function pause(){
  audio_pop.play();
  if(isPaused){
    isPaused = false;
    document.getElementById("pause").innerHTML = "PAUSE";
  }else{
    isPaused = true;
    ctx.save();
    ctx.font = "bold 55px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Game Paused!",WIDTH/2,HEIGHT/2);
    ctx.restore();
    document.getElementById("pause").innerHTML = "RESUME";    
  }
}

function start(){
  if(!isStarted) {
    isStarted = true;
    audio_pop.play();
    dx = 0;
    dy = 4;
  }
}

function cont(){
  if(isDead){
    isDead = false;
    x = WIDTH/2;
    y = HEIGHT/2;
    dx = 0;
    dy = 4;
    intervalId = setInterval(draw,10);
  }
}

function restart(){
  if(isFinished){
    clear();
    clearInterval(intervalId);
    isFinished = false;
    isStarted = false;
    BrokenB = 0;
    document.getElementById("progbar").style.width= "0%";
    x = WIDTH/2;
    y = HEIGHT/2;
    init();
    return;
  }
  if(isPaused){
    isPaused = false;
    document.getElementById("pause").innerHTML = "PAUSE";
  }
  paddlex = (WIDTH / 2) - (paddlew/2);
  isDead = false;
  isStarted = true;
  clearInterval(intervalId);
  audio_pop.play();
  x = WIDTH/2;
  y = HEIGHT/2;
  init_bricks();
  dx = 0;
  dy = 4;
  BrokenB = 0;
  document.getElementById("progbar").style.width= "0%";
  intervalId = setInterval(draw,10);
}

function roundRect(x, y, width, height) {
  radius = 5;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();  
}
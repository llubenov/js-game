/* @author Lyusien Lyubenov */ 

/* Object details */ 

function Player(preference) {
  this.x = preference.x;
  this.y = preference.y;
  this.width = preference.width;
  this.height = preference.height;
  this.speed = preference.speed;
  this.minspeed = preference.minspeed;
  this.maxspeed = preference.maxspeed;
  this.momentum = preference.momentum;
  this.color = preference.color;
  this.left = preference.left;
  this.up = preference.up;
  this.right = preference.right;
  this.down = preference.down;
}


/* Checks where the player is  */
		
Player.prototype.render = function () {
  if(this.y > canvas.height - this.height) { 
    // player is on the left side of the screen
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
	} else {                                           
    // player is in the right side of the screen
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
   
  }
};

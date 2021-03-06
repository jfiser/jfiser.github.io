
function Ball(start_x, start_y, circle_x, circle_y, radius) {
    this.radius = radius;
    this.dx = randomDx();
    this.dy = randomDy();
    // mass is that of a sphere as opposed to circle.
    this.mass = this.radius * this.radius * this.radius;
    this.x = start_x;
    this.y = start_y;
    this.circle_x = circle_x;
    this.circle_y = circle_y;
    
    this.color = "rgb(255, 255, 78)"; //randomColor();
    this.draw = function() {
        ctx.beginPath();

        ctx.arc(Math.round(this.x), Math.round(this.y), this.radius, 0, 2*Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        //ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        //ctx.stroke();
        ctx.closePath();
    };
    this.speed = function() {
        // magnitude of velocity vector
        var tmp =  Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        //console.log("tmp: " + tmp)
        return tmp;
    };
    this.angle = function() {
        //angle of ball with the x axis
        return Math.atan2(this.dy, this.dx);
    };
    this.onGround = function() {
        return (this.y + this.radius >= canvas.height)
    }
}
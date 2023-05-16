class Pellet {
    constructor({position}) {
        this.position = position;
        this.radius = 3;
    }

    draw() {
        CTX.beginPath();
        CTX.arc(this.position.x,this.position.y, this.radius, 0, Math.PI*2);
        CTX.fillStyle = 'white';
        CTX.fill();
        CTX.closePath();
    }
}
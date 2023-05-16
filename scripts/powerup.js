class PowerUp {
    constructor({position}) {
        this.position = position;
        this.radius = 9;
    }

    draw() {
        CTX.beginPath();
        CTX.arc(this.position.x,this.position.y, this.radius, 0, Math.PI*2);
        CTX.fillStyle = 'green';
        CTX.fill();
        CTX.closePath();
    }
}
class Player {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.radians = 0.75;
        this.openRate = 0.12;
        this.rotation = 0;
    }

    draw() {
        CTX.save();
        CTX.translate(this.position.x, this.position.y);
        CTX.rotate(this.rotation);
        CTX.translate(-this.position.x, -this.position.y);
        CTX.beginPath();
        CTX.arc(this.position.x,this.position.y, this.radius, this.radians, Math.PI*2 - this.radians);
        CTX.lineTo(this.position.x, this.position.y);
        CTX.fillStyle = 'yellow';
        CTX.fill();
        CTX.closePath();
        CTX.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if(this.radians < 0 || this.radians > 0.75)
            this.openRate *= (-1);

        this.radians += this.openRate;
    }
}
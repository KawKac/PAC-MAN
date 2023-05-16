class Ghost {
    static speed = 2;

    constructor({position, velocity, color = COLORS[Math.floor(Math.random() * COLORS.length)] }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.color = color;
        this.prevCollisions = [];
        this.speed = 2;
        this.scared = false
    }

    draw() {
        const size = 30; // Rozmiar ducha

        // Rysowanie ciała ducha
        CTX.beginPath();
        CTX.arc(this.position.x, this.position.y, size/2, 0, Math.PI*2);
        CTX.fillStyle = this.scared? 'grey' : this.color;
        CTX.fill();
        CTX.closePath();

        // Rysowanie oczu ducha
        const eyeSize = size/5;
        CTX.beginPath();
        CTX.arc(this.position.x - eyeSize, this.position.y - eyeSize, eyeSize, 0, Math.PI * 2);
        CTX.arc(this.position.x + eyeSize, this.position.y - eyeSize, eyeSize, 0, Math.PI * 2);
        CTX.fillStyle = 'white';
        CTX.fill();
        CTX.closePath();

        // Rysowanie źrenic ducha
        const pupilSize = size/10;
        CTX.beginPath();
        CTX.arc(this.position.x - eyeSize, this.position.y - eyeSize, pupilSize, 0, Math.PI * 2);
        CTX.arc(this.position.x + eyeSize, this.position.y - eyeSize, pupilSize, 0, Math.PI * 2);
        CTX.fillStyle = 'black';
        CTX.fill();
        CTX.closePath();

        // Rysowanie ust ducha
        if (this.scared) {
            // Jeśli duch jest przestraszony, rysujemy usta jako okrąg
            CTX.beginPath();
            CTX.arc(this.position.x, this.position.y + size/4, size/6, 0, Math.PI * 2, false);
            CTX.fillStyle = 'black';
            CTX.fill();
            CTX.closePath();
        } else {
            // W przeciwnym przypadku, rysujemy usta jako linię prostą
            const mouthWidth = size/2;
            CTX.beginPath();
            CTX.moveTo(this.position.x - mouthWidth/2, this.position.y + size/4);
            CTX.lineTo(this.position.x + mouthWidth/2, this.position.y + size/4);
            CTX.lineWidth = size/10;
            CTX.strokeStyle = 'black';
            CTX.stroke();
            CTX.closePath();
        }
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}
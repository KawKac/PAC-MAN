const CANVAS = document.querySelector('canvas');
const CTX = CANVAS.getContext('2d');

CANVAS.width = innerWidth-5;
CANVAS.height = innerHeight-5;

class Boundary {
    static width = 40;
    static height = 40;
    constructor ({position}) {
        this.position = position;
        this.width = 40;
        this.height = 40;
    }

    draw() {
        CTX.fillStyle = 'blue';
        CTX.fillRect(this.position.x, this.position.y, this.width, this.height)

    }
}

class Player {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
    }

    draw() {
        CTX.beginPath();
        CTX.arc(this.position.x,this.position.y, this.radius, 0, Math.PI*2);
        CTX.fillStyle = 'yellow';
        CTX.fill();
        CTX.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

const BOUNDARIES = [];
const PLAYER = new Player({position: {
    x: Boundary.width + Boundary.width / 2, 
    y: Boundary.height + Boundary.height / 2
}, velocity: {x: 0, y: 0}});
const KEYS = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
};

let lastKey = '';

const MAP = [
    ['-','-','-','-','-','-'],
    ['-',' ',' ',' ',' ','-'],
    ['-',' ','-','-',' ','-'],
    ['-',' ',' ',' ',' ','-'],
    ['-','-','-','-','-','-']
];

MAP.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch(symbol) {
            case '-':
                BOUNDARIES.push(new Boundary({
                    position:{
                        x:Boundary.width*j,
                        y:Boundary.height*i
                    }
                }))
                break;
        }
    })
});

function animate(){
    requestAnimationFrame(animate);

    CTX.clearRect(0,0,CANVAS.width,CANVAS.height);

    BOUNDARIES.forEach((Boundary) => {
        Boundary.draw();
    });
    
    PLAYER.update();

    PLAYER.velocity.x = 0;
    PLAYER.velocity.y = 0;

    if(KEYS.w.pressed && lastKey === 'w') PLAYER.velocity.y = -5;
    else if (KEYS.a.pressed && lastKey === 'a') PLAYER.velocity.x = -5;
    else if (KEYS.s.pressed && lastKey === 's') PLAYER.velocity.y = 5;
    else if (KEYS.d.pressed && lastKey === 'd') PLAYER.velocity.x = 5;
}

animate();

window.addEventListener('keydown', ({key}) => {
    switch(key){
        case 'w':
            KEYS.w.pressed = true;
            lastKey = 'w';
            break
        case 'a':
            KEYS.a.pressed = true;
            lastKey = 'a';
            break;
        case 's':
            KEYS.s.pressed = true;
            lastKey = 's';
            break;
        case 'd':
            KEYS.d.pressed = true;
            lastKey = 'd';
            break;
    }
})

window.addEventListener('keyup', ({key}) => {
    switch(key){
        case 'w':
            KEYS.w.pressed = false;
            break
        case 'a':
            KEYS.a.pressed = false;
            break;
        case 's':
            KEYS.s.pressed = false;
            break;
        case 'd':
            KEYS.d.pressed = false;
            break;
    }
})
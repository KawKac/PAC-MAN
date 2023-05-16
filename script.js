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
    ['-','-','-','-','-','-','-'],
    ['-',' ',' ',' ',' ',' ','-'],
    ['-',' ','-',' ','-',' ','-'],
    ['-',' ',' ',' ',' ',' ','-'],
    ['-',' ','-',' ','-',' ','-'],
    ['-',' ',' ',' ',' ',' ','-'],
    ['-','-','-','-','-','-','-']
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

function circleCollidesWithRectangle({circle, rectangle}) {
    return (circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height && 
        circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x && 
        circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y && 
        circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width);
}

function animate(){
    requestAnimationFrame(animate);

    CTX.clearRect(0,0,CANVAS.width,CANVAS.height);

    if(KEYS.w.pressed && lastKey === 'w') {
        for(let i = 0; i<BOUNDARIES.length; i++) {
            const BOUNDARY = BOUNDARIES[i]; 
            if (circleCollidesWithRectangle({
                circle: {...PLAYER, 
                    velocity: {
                        x: 0,
                        y: -5
                }},
                rectangle: BOUNDARY
            })) {
                PLAYER.velocity.y = 0;
                break;
            } else { PLAYER.velocity.y = -5; }
        }
    }
    else if (KEYS.a.pressed && lastKey === 'a') {
        for(let i = 0; i<BOUNDARIES.length; i++) {
            const BOUNDARY = BOUNDARIES[i]; 
            if (circleCollidesWithRectangle({
                circle: {...PLAYER, 
                    velocity: {
                        x: -5,
                        y: 0
                }},
                rectangle: BOUNDARY
            })) {
                PLAYER.velocity.x = 0;
                break;
            } else { PLAYER.velocity.x = -5; }
        }
    }
    else if (KEYS.s.pressed && lastKey === 's') {
        for(let i = 0; i<BOUNDARIES.length; i++) {
            const BOUNDARY = BOUNDARIES[i]; 
            if (circleCollidesWithRectangle({
                circle: {...PLAYER, 
                    velocity: {
                        x: 0,
                        y: 5
                }},
                rectangle: BOUNDARY
            })) {
                PLAYER.velocity.y = 0;
                break;
            } else { PLAYER.velocity.y = 5; }
        }
    }
    else if (KEYS.d.pressed && lastKey === 'd') {
        for(let i = 0; i<BOUNDARIES.length; i++) {
            const BOUNDARY = BOUNDARIES[i]; 
            if (circleCollidesWithRectangle({
                circle: {...PLAYER, 
                    velocity: {
                        x: 5,
                        y: 0
                }},
                rectangle: BOUNDARY
            })) {
                PLAYER.velocity.x = 0;
                break;
            } else { PLAYER.velocity.x = 5; }
        }
    }

    BOUNDARIES.forEach((Boundary) => {
        Boundary.draw();

        if (circleCollidesWithRectangle({
            circle:PLAYER,
            rectangle: Boundary
        })) {
            console.log('aaa');

            PLAYER.velocity.x = 0;
            PLAYER.velocity.y = 0;
        }
    });
    
    PLAYER.update();

    // PLAYER.velocity.x = 0;
    // PLAYER.velocity.y = 0;
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
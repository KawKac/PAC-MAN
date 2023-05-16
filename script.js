const CANVAS = document.querySelector('canvas');
const CTX = CANVAS.getContext('2d');

const SCOREEL = document.querySelector('#scoreEl');

CANVAS.width = 21 * 40; //innerWidth - innerWidth/10;
CANVAS.height = 14 * 40; //innerHeight - innerHeight/10;

class Boundary {
    static width = 40;
    static height = 40;
    constructor ({position, image}) {
        this.position = position;
        this.width = 40;
        this.height = 40;
        this.image = image;
    }

    draw() {
        CTX.drawImage(this.image, this.position.x, this.position.y);
    }
}

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

class Ghost {
    static speed = 2;

    constructor({position, velocity, color = 'red'}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.color = color;
        this.prevCollisions = [];
        this.speed = 2;
        this.scared = false
    }

    draw() {
        CTX.beginPath();
        CTX.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2);
        CTX.fillStyle = this.scared? 'grey' : this.color;
        CTX.fill();
        CTX.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

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

const PELLETS = [];
const BOUNDARIES = [];
const POWERUPS = [];
const GHOSTS = [
    new Ghost({
        position: {
            x: Boundary.width * 6 + Boundary.width / 2, 
            y: Boundary.height + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        }
    }),
    new Ghost({
        position: {
            x: Boundary.width * 13 + Boundary.width / 2, 
            y: Boundary.height * 4 + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
        color: 'pink'
    }),
    new Ghost({
        position: {
            x: Boundary.width * 9 + Boundary.width / 2, 
            y: Boundary.height * 12 + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
        color: 'orange'
    })
];
const PLAYER = new Player({
    position: {
        x: Boundary.width * 10 + Boundary.width / 2, 
        y: Boundary.height * 6 + Boundary.height / 2
    }, 
    velocity: {
        x: 0,
        y: 0
    }
});
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

const MAP = [
    ['1','-','-','-','-','-','-','-','-','-','/','-','-','-','/','-','-','-','/','/','2'],
    ['|','*','.','.','.','.','.','.','.','.','|','*','.','.','u','.','.','.','4','_','6'],
    ['|','.','b','.','^','.','b','.','b','.','|','.','^','.','.','.','^','.','.','.','|'],
    ['|','.','.','.','|','.','.','.','.','.','|','.','4',']','.','[','_','-','2','.','|'],
    ['|','.','[','-','+',']','.','[',']','.','u','.','.','.','.','.','.','.','u','.','|'],
    ['|','.','.','.','u','.','.','.','.','.','.','.','^','.','b','.','^','.','.','.','|'],
    ['|','.','b','.','.','.','1',']','.','b','c','[','6','.','.','.','4',']','.','[','6'],
    ['|','.','.','.','^','.','u','.','.','.','.','.','|','.','b','.','.','.','.','.','|'],
    ['|','.','^','.','|','.','.','.','^','.','^','.','|','.','.','.','^','.','^','.','|'],
    ['|','.','u','.','|','.','b','.','u','.','|','.','u','.','^','.','u','.','u','.','|'],
    ['|','.','.','.','u','.','.','.','.','.','|','.','.','.','|','.','.','.','.','.','|'],
    ['|','.','b','.','.','.','[','-',']','.','4','-','-','-','_','-',']','.','b','.','|'],
    ['|','*','.','.','^','.','.','.','.','.','.','.','.','.','.','.','.','.','.','*','|'],
    ['4','-','-','-','_','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','3']
];

function createImage(src){
    const image = new Image();
    image.src = src;
    return image;
}

MAP.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch(symbol) {
            case '-':
                BOUNDARIES.push(new Boundary({
                    position:{
                        x:Boundary.width*j,
                        y:Boundary.height*i
                    },
                    image: createImage('./img/pipeHorizontal.png')
                }))
                break;
            case '|':
                BOUNDARIES.push(new Boundary({
                    position:{
                        x:Boundary.width*j,
                        y:Boundary.height*i
                    },
                    image: createImage('./img/pipeVertical.png')
                }))
                break;
            case '1':
                BOUNDARIES.push(new Boundary({
                    position:{
                        x:Boundary.width*j,
                        y:Boundary.height*i
                    },
                    image: createImage('./img/pipeCorner1.png')
                }))
                break;
            case '2':
                BOUNDARIES.push(new Boundary({
                    position:{
                        x:Boundary.width*j,
                        y:Boundary.height*i
                    },
                    image: createImage('./img/pipeCorner2.png')
                }))
                break;
            case '3':
                BOUNDARIES.push(new Boundary({
                    position:{
                        x:Boundary.width*j,
                        y:Boundary.height*i
                    },
                    image: createImage('./img/pipeCorner3.png')
                }))
                break;
            case '4':
                BOUNDARIES.push(new Boundary({
                    position:{
                        x:Boundary.width*j,
                        y:Boundary.height*i
                    },
                    image: createImage('./img/pipeCorner4.png')
                }))
                break;
            case '5':
                BOUNDARIES.push(new Boundary({
                    position:{
                        x:Boundary.width*j,
                        y:Boundary.height*i
                    },
                    image: createImage('./img/pipeConnectorRight.png')
                }))
                break;
            case '6':
                BOUNDARIES.push(new Boundary({
                    position:{
                        x:Boundary.width*j,
                        y:Boundary.height*i
                    },
                    image: createImage('./img/pipeConnectorLeft.png')
                }))
                break;
            case 'b':
                BOUNDARIES.push(new Boundary({
                    position:{
                        x:Boundary.width*j,
                        y:Boundary.height*i
                    },
                    image: createImage('./img/block.png')
                }))
                break;
            case '+':
                BOUNDARIES.push(new Boundary({
                    position:{
                        x:Boundary.width*j,
                        y:Boundary.height*i
                    },
                    image: createImage('./img/pipeCross.png')
                }))
                break;
            case '^':
                BOUNDARIES.push(new Boundary({
                    position:{
                        x:Boundary.width*j,
                        y:Boundary.height*i
                    },
                    image: createImage('./img/capTop.png')
                }))
                break;
            case '[':
                BOUNDARIES.push(new Boundary({
                    position:{
                        x:Boundary.width*j,
                        y:Boundary.height*i
                    },
                    image: createImage('./img/capLeft.png')
                }))
                break;
            case ']':
                BOUNDARIES.push(new Boundary({
                    position:{
                        x:Boundary.width*j,
                        y:Boundary.height*i
                    },
                    image: createImage('./img/capRight.png')
                }))
                break;
            case '_':
                BOUNDARIES.push(new Boundary({
                    position:{
                        x:Boundary.width*j,
                        y:Boundary.height*i
                    },
                    image: createImage('./img/pipeConnectorTop.png')
                }))
                break;
            case 'u':
                BOUNDARIES.push(new Boundary({
                    position:{
                        x:Boundary.width*j,
                        y:Boundary.height*i
                    },
                    image: createImage('./img/capBottom.png')
                }))
                break;
            case '/':
                BOUNDARIES.push(new Boundary({
                    position:{
                        x:Boundary.width*j,
                        y:Boundary.height*i
                    },
                    image: createImage('./img/pipeConnectorBottom.png')
                }))
                break;
            case '.':
                PELLETS.push(new Pellet({
                    position:{
                        x:Boundary.width * j + Boundary.width/2,
                        y:Boundary.height * i + Boundary.height/2
                    }
                }))
                break;
            case '*':
                POWERUPS.push(new PowerUp ({
                    position: {
                        x:Boundary.width * j + Boundary.width/2,
                        y:Boundary.height * i + Boundary.height/2
                    }
                }))
                break;
        }
    })
});

function circleCollidesWithRectangle({circle, rectangle}) {
    const PADDING = Boundary.width / 2 - circle.radius - 1;
    return (circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + PADDING && 
        circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - PADDING && 
        circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - PADDING && 
        circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + PADDING);
}

let lastKey = '';
let score = 0;
let animationId;

function animate(){
    animationId = requestAnimationFrame(animate);

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

    for(let i = GHOSTS.length - 1; 0 <= i; i--) {
        const ghost = GHOSTS[i];
        if (
            Math.hypot(
                ghost.position.x - PLAYER.position.x,
                ghost.position.y - PLAYER.position.y
            ) < ghost.radius + PLAYER.radius) {
                if(ghost.scared){
                    GHOSTS.splice(i, 1);
                    score += 100;
                    SCOREEL.innerHTML = score;
                    setTimeout(() => {
                        switch (i) {
                            case 0:
                                GHOSTS.push(
                                    new Ghost({
                                        position: {
                                            x: Boundary.width * 10 + Boundary.width / 2, 
                                            y: Boundary.height * 6 + Boundary.height / 2
                                        },
                                        velocity: {
                                            x: 0,
                                            y: Ghost.speed
                                        }
                                    })
                                );
                                break;
                            case 1:
                                GHOSTS.push(
                                    new Ghost({
                                        position: {
                                            x: Boundary.width * 10 + Boundary.width / 2, 
                                            y: Boundary.height * 6 + Boundary.height / 2
                                        },
                                        velocity: {
                                            x: 0,
                                            y: Ghost.speed
                                        },
                                        color: 'pink'
                                    })
                                );
                                break;
                            case 2:
                                GHOSTS.push(
                                    new Ghost({
                                        position: {
                                            x: Boundary.width * 10 + Boundary.width / 2, 
                                            y: Boundary.height * 6 + Boundary.height / 2
                                        },
                                        velocity: {
                                            x: 0,
                                            y: Ghost.speed
                                        },
                                        color: 'orange'
                                    })
                                );
                                break;
                        }
                    }, 5000);
                } else {
                    cancelAnimationFrame(animationId);
                    alert('Przegrałeś');
                }
            }
    }

    if (PELLETS.length === 0) {
        cancelAnimationFrame(animationId);
        alert('Wygrałeś!');
    }

    for(let i = POWERUPS.length - 1; 0 <= i; i--) {
        const powerUp = POWERUPS[i];
        powerUp.draw();

        if (
            Math.hypot(
                powerUp.position.x - PLAYER.position.x,
                powerUp.position.y - PLAYER.position.y
            ) < powerUp.radius + PLAYER.radius) {
                POWERUPS.splice(i, 1);
                GHOSTS.forEach(ghost => {
                    ghost.scared = true;
                    setTimeout(() => {
                        ghost.scared = false;
                    }, 5000);
                })
            }
        
    }

    for(let i = PELLETS.length - 1; 0 <= i; i--) {
        const pellet = PELLETS[i]

        pellet.draw();

        if (
            Math.hypot(
                pellet.position.x - PLAYER.position.x,
                pellet.position.y - PLAYER.position.y
            ) < pellet.radius + PLAYER.radius) {
                PELLETS.splice(i, 1);
                score += 10;
                SCOREEL.innerHTML = score;
            }
    };

    BOUNDARIES.forEach((Boundary) => {
        Boundary.draw();

        if (circleCollidesWithRectangle({
            circle:PLAYER,
            rectangle: Boundary
        })) {
            PLAYER.velocity.x = 0;
            PLAYER.velocity.y = 0;
        }
    });
    
    PLAYER.update();

    GHOSTS.forEach((ghost => {
        ghost.update();

        const COLLISIONS = [];

        BOUNDARIES.forEach(boundry => {
            if (!COLLISIONS.includes('right') && circleCollidesWithRectangle({
                circle: {...ghost, 
                    velocity: {
                        x: ghost.speed,
                        y: 0
                }},
                rectangle: boundry
            })) {
                COLLISIONS.push('right');
            }

            if (!COLLISIONS.includes('left') && circleCollidesWithRectangle({
                circle: {...ghost, 
                    velocity: {
                        x: -ghost.speed,
                        y: 0
                }},
                rectangle: boundry
            })) {
                COLLISIONS.push('left');
            }

            if (!COLLISIONS.includes('up') && circleCollidesWithRectangle({
                circle: {...ghost, 
                    velocity: {
                        x: 0,
                        y: -ghost.speed
                }},
                rectangle: boundry
            })) {
                COLLISIONS.push('up');
            }

            if (!COLLISIONS.includes('down') && circleCollidesWithRectangle({
                circle: {...ghost, 
                    velocity: {
                        x: 0,
                        y: ghost.speed
                }},
                rectangle: boundry
            })) {
                COLLISIONS.push('down');
            }
        })
        if (COLLISIONS.length > ghost.prevCollisions.length)
            ghost.prevCollisions = COLLISIONS;

        if (JSON.stringify(COLLISIONS) !== JSON.stringify(ghost.prevCollisions)) {
            if(ghost.velocity.x > 0) ghost.prevCollisions.push('right');
            else if(ghost.velocity.x < 0) ghost.prevCollisions.push('left');
            else if(ghost.velocity.y < 0) ghost.prevCollisions.push('up');
            else if(ghost.velocity.y > 0) ghost.prevCollisions.push('down');

            const PATHWAYS = ghost.prevCollisions.filter(collision => {
                return !COLLISIONS.includes(collision);
            })
            const DIRECTION = PATHWAYS[Math.floor(Math.random() * PATHWAYS.length)];

            switch (DIRECTION) {
                case 'down':
                    ghost.velocity.x = 0;
                    ghost.velocity.y = ghost.speed;
                    break;
                case 'up':
                    ghost.velocity.x = 0;
                    ghost.velocity.y = -ghost.speed;
                    break;
                case 'left':
                    ghost.velocity.x = -ghost.speed;
                    ghost.velocity.y = 0;
                    break;
                case 'right':
                    ghost.velocity.x = ghost.speed;
                    ghost.velocity.y = 0;
                    break;
            }
            ghost.prevCollisions = [];
        }
    }))

    if (PLAYER.velocity.x > 0 ) PLAYER.rotation = 0;
    else if (PLAYER.velocity.x < 0 ) PLAYER.rotation = Math.PI;
    else if (PLAYER.velocity.y > 0 ) PLAYER.rotation = Math.PI / 2;
    else if (PLAYER.velocity.y < 0 ) PLAYER.rotation = Math.PI * 1.5;


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
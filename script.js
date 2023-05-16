const CANVAS = document.querySelector('canvas');
const CTX = CANVAS.getContext('2d');

const SCOREEL = document.querySelector('#scoreEl');

//ilość kafelków * szerokość px
CANVAS.width = 21 * 40; 
CANVAS.height = 14 * 40;

const COLORS = ["red", "blue", "orange", "purple", "pink", "turquoise", "magenta", "lime", "cyan", "maroon", "navy", "teal", "indigo", "coral"];

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

const GAME_MUSIC = new Audio("./music/game.mp3");
GAME_MUSIC.loop = true;
GAME_MUSIC.autoplay = true;
GAME_MUSIC.volume = 0.5;

const GHOST_KILL_MUSIC = new Audio("./music/ghostkill.mp3");
GHOST_KILL_MUSIC.loop = false;
GHOST_KILL_MUSIC.autoplay = true;

const LOSE_MUSIC = new Audio("./music/lose.mp3");
LOSE_MUSIC.loop = false;
LOSE_MUSIC.autoplay = true;

const PELLET_SOUND = new Audio("./music/pellet.mp3");
PELLET_SOUND.loop = false;
PELLET_SOUND.autoplay = true;

const POWER_UP_SOUND = new Audio("./music/powerup.mp3");
POWER_UP_SOUND.loop = false;
POWER_UP_SOUND.autoplay = true;

const WINNER_SOUND = new Audio("./music/win.mp3");
WINNER_SOUND.loop = false;
WINNER_SOUND.autoplay = true;

const PLAY_BUTTON = new Audio("./music/playbutton.mp3");
PLAY_BUTTON.loop = false;
PLAY_BUTTON.autoplay = false;
PLAY_BUTTON.volume = 0.75;

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

function finish_game(win) {
    animationId = requestAnimationFrame(animate);

    CANVAS.parentNode.removeChild(CANVAS);

    SCOREEL.parentNode.style.display = 'none';

    const newCanvas = document.createElement('canvas');
    const newCTX = newCanvas.getContext('2d');
    newCanvas.width = 21 * 40;
    newCanvas.height = 14 * 40;

    document.body.appendChild(newCanvas);

    newCTX.font = '48px "Press Start 2P", "Press Start", cursive';
    newCTX.textAlign = 'center';
    newCTX.fillStyle = 'white';

    if(win) {
        newCTX.fillText('Wygrałeś!', newCanvas.width/2, (newCanvas.height/6)*2);
        newCTX.fillText('Twój wynik to:', newCanvas.width/2, (newCanvas.height/6)*4);
        newCTX.fillText(score, newCanvas.width/2, (newCanvas.height/6)*5);
    } else {
        newCTX.fillText('Przegrałeś!', newCanvas.width/2, (newCanvas.height/6)*2);
        newCTX.fillText('Twój wynik to:', newCanvas.width/2, (newCanvas.height/6)*4);
        newCTX.fillText(score, newCanvas.width/2, (newCanvas.height/6)*5);
    }
    cancelAnimationFrame(animationId);

    const button = document.createElement('url');
    button.setAttribute("class","pgb");
    button.setAttribute("id","restart_button");
    button.setAttribute("onclick","refresh()");
    button.setAttribute("href","");
    document.body.appendChild(document.createElement('br'));
    document.body.appendChild(button);
    button.innerHTML = "↻";
}

function refresh() {
    window.location.reload();
}

function animate(){
    animationId = requestAnimationFrame(animate);

    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);

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
                    GHOST_KILL_MUSIC.pause();
                    GHOST_KILL_MUSIC.currentTime = 0;
                    GHOST_KILL_MUSIC.play();
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
                    GAME_MUSIC.pause();
                    LOSE_MUSIC.play();
                    cancelAnimationFrame(animationId);
                    finish_game(false);
                }
            }
    }

    if (PELLETS.length === 0) {
        GAME_MUSIC.pause();
        WINNER_SOUND.play();
        cancelAnimationFrame(animationId);
        finish_game(true);
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
                POWER_UP_SOUND.pause();
                POWER_UP_SOUND.currentTime = 0;
                POWER_UP_SOUND.play();
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
                PELLET_SOUND.pause();
                PELLET_SOUND.currentTime = 0;
                PELLET_SOUND.play();
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

function play_game() {
    PLAY_BUTTON.play();
    const uiElement = document.getElementsByClassName("ui")[0];
    uiElement.classList.add('fade-out');
    setTimeout(() => {
        uiElement.parentNode.removeChild(uiElement);
        GAME_MUSIC.play();
        document.getElementsByClassName("score")[0].style.visibility = "visible";
        animate();
    }, 1500);
}

window.addEventListener('keydown', ({key}) => {
    switch(key){
        case 'w':
        case 'W':
        case '8':
        case 'ArrowUp':
            KEYS.w.pressed = true;
            lastKey = 'w';
            break
        case 'a':
        case 'A':
        case '4':
        case 'ArrowLeft':
            KEYS.a.pressed = true;
            lastKey = 'a';
            break;
        case 's':
        case 'S':
        case '2':
        case 'ArrowDown':
            KEYS.s.pressed = true;
            lastKey = 's';
            break;
        case 'd':
        case 'D':
        case '6':
        case 'ArrowRight':
            KEYS.d.pressed = true;
            lastKey = 'd';
            break;
    }
})

window.addEventListener('keyup', ({key}) => {
    switch(key){
        case 'w':
        case 'W':
        case '8':
        case 'ArrowUp':   
            KEYS.w.pressed = false;
            break
        case 'a':
        case 'A':
        case '4':
        case 'ArrowLeft':
            KEYS.a.pressed = false;
            break;
        case 's':
        case 'S':
        case '2':
        case 'ArrowDown':
            KEYS.s.pressed = false;
            break;
        case 'd':
        case 'D':
        case '6':
        case 'ArrowRight':
            KEYS.d.pressed = false;
            break;
    }
})
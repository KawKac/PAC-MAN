const SCOREEL = document.querySelector('#scoreEl');

const COLORS = ["red", "blue", "orange", "purple", "pink", "turquoise", "magenta", "lime", "cyan", "maroon", "navy", "teal", "indigo", "coral"];

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
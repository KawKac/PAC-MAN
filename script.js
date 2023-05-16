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

const MAP = [
    ['-','-','-','-','-','-'],
    ['-',' ',' ',' ',' ','-'],
    ['-',' ','-','-',' ','-'],
    ['-',' ',' ',' ',' ','-'],
    ['-','-','-','-','-','-']
];

const BOUNDARIES = [];

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

BOUNDARIES.forEach((Boundary) => {
    Boundary.draw()
});

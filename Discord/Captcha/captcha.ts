import Canvas from "canvas";
Canvas.registerFont(require("path").resolve(__dirname, "./Swift.ttf"), {
    family: "swift"
});

function randomText(): string{
    return Math.random()
    .toString(36)
    .replace(/[^a-z]|[gkqr]+/gi, "")
    .substring(0, 6)
    .toUpperCase()

}

function transformTable (s: string): string{
    switch(s){
        case '0': return '2';
        case '1': return '3';
        case '2': return '3';
        case '3': return '4';
        case '4': return '5';
        case '5': return '6';
        case '6': return '7';
        case '7': return '8';
        case '8': return '7';
        case '9': return '8';
        case 'a': return '9';
        case 'b': return 'a';
        case 'c': return 'b';
        case 'd': return 'c';
        case 'e': return 'c';
        case 'f': return 'd';
        default:
            console.log('fucko: ', s); 
            return '0';
    }
}

export class DiscordCaptcha {
    private _canvas: Canvas.Canvas;
    private _value: string;

    constructor() {
        let colorScheme = makeRandomColor();
        console.log('Creating new captcha');
        // Initialize canvas
        this._canvas = Canvas.createCanvas(400, 400);
        const ctx = this._canvas.getContext("2d");
        // Set background color
        ctx.globalAlpha = 1;
        ctx.fillStyle = makeSimilarColor(colorScheme);
        ctx.beginPath();
        ctx.fillRect(0, 0, 400, 400);
        ctx.save();
        // Set style for lines
        ctx.strokeStyle = makeRandomColor();
        ctx.lineWidth = 4;
        // Draw 10 lines
        ctx.beginPath();
        const coords = [];
        for (let i = 0; i < 4; i++) {
            if (!coords[i])
                coords[i] = [];
            for (let j = 0; j < 5; j++)
                coords[i][j] = Math.round(Math.random() * 80) + j * 80;
            if (!(i % 2))
                coords[i] = shuffleArray(coords[i]);
        }
        for (let i = 0; i < coords.length; i++) {
            if (!(i % 2)) {
                for (let j = 0; j < coords[i].length; j++) {
                    if (!i) {
                        ctx.moveTo(coords[i][j], 0);
                        ctx.lineTo(coords[i + 1][j], 400);
                    }
                    else {
                        ctx.moveTo(0, coords[i][j]);
                        ctx.lineTo(400, coords[i + 1][j]);
                    }
                }
            }
        }
        ctx.stroke();
        // Set style for circles
        ctx.fillStyle = makeSimilarColor(colorScheme);
        ctx.lineWidth = 0;
        // Draw circles
        for (let i = 0; i < 900; i++) {
            ctx.beginPath();
            ctx.arc(Math.round(Math.random() * 360) + 20, // X coordinate
            Math.round(Math.random() * 360) + 20, // Y coordinate
            Math.round(Math.random() * 7) + 1, // Radius
            0, // Start anglez
            Math.PI * 2 // End angle
            );
            ctx.fill();
        }
        // Set style for text
        ctx.font = "bold 90px swift";
        ctx.fillStyle = makeSimilarColor(colorScheme);
        // Set position for text
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.translate(0, 400);
        ctx.translate(Math.round(Math.random() * 50) + 200, -1 * Math.round(Math.random() * 100 - 50) - 200);
        ctx.rotate(Math.random()*2*Math.PI);
        // Set text value and print it to canvas
        ctx.beginPath();
        this._value = "";
        while (this._value.length !== 6)
            this._value = randomText();
        ctx.fillText(this._value, 0, 0);
        // Draw foreground noise
        ctx.restore();
        for (let i = 0; i < 5000; i++) {
            ctx.beginPath();
            let color = makeSimilarColor(colorScheme);
            ctx.arc(Math.round(Math.random() * 400), // X coordinate
            Math.round(Math.random() * 400), // Y coordinate
            Math.random() * 2, // Radius
            0, // Start angle
            Math.PI * 2 // End angle
            );
            ctx.fill();
        }
        let vertMirror = Math.random() > 0.5? -1: 1;
        let horiztMirror = Math.random() > 0.5? -1: 1;
        console.log('Vert: ', vertMirror);
        console.log('Horiz: ', horiztMirror);
        ctx.scale(vertMirror, horiztMirror);
        ctx.save();

    }
    get value() {
        return this._value;
    }
    get JPEGStream() {
        return this._canvas.createJPEGStream();
    }
    get PNGStream() {
        return this._canvas.createPNGStream();
    }
}

function makeRandomColor() {
    let color = "#";
    while (color.length < 7) color += Math.round(Math.random() * 16).toString(16);
    color += "a0";
    return color;
}

function makeSimilarColor(color: string): string {
    let newColor = color.split('');
    newColor[1] = transformTable(newColor[1]);
    newColor[3] = transformTable(newColor[3]);
    newColor[5] = transformTable(newColor[5]);

    return newColor.join('');
}

function shuffleArray(arr: any[]){
    let i = arr.length, temp, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== i) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * i);
        i -= 1;
        // And swap it with the current element.
        temp = arr[i];
        arr[i] = arr[randomIndex];
        arr[randomIndex] = temp;
    }
    return arr;
};
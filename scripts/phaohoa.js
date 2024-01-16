window.addEventListener("resize", resizeCanvas);
window.addEventListener("DOMContentLoaded", onLoad);
var tiengPhaoHoa = new Audio("./resources/Tieng-ban-phao-hoa-www_tiengdong_com.mp3");
const dynamicText = "Happy New Year 2024";

const probability = 0.05;
let canvas, ctx, w, h, particles = [], xPoint, yPoint, displayText = false;
const phaohoaBtn = document.getElementById("phaohoaBtn");
const phaohoaBtnClose = document.getElementById("phaohoaBtnClose");
const modalphaohoa = document.getElementById("modal-phao-hoa");
phaohoaBtn.addEventListener("click", () => {
    tiengPhaoHoa.volume = 1;
    tiengPhaoHoa.currentTime = 0;
    tiengPhaoHoa.play();
});
phaohoaBtnClose.addEventListener("click", () => {
    modalphaohoa.removeAttribute("#modal-phaohoa");
    tiengPhaoHoa.volume = 0;
    tiengPhaoHoa.currentTime = 0;
    tiengPhaoHoa.pause();
});
function onLoad() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    resizeCanvas();
    window.requestAnimationFrame(updateWorld);
    window.setTimeout(() => { displayText = true; }, 5000);
}

function resizeCanvas() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}

function updateWorld() {
    update();
    paint();
    window.requestAnimationFrame(updateWorld);
}

function update() {
    if (particles.length < 500 && Math.random() < probability) {
        createFirework();
    }
    particles = particles.filter(particle => particle.move());
}

function paint() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    particles.forEach(particle => particle.draw(ctx));

    if (displayText) {
        ctx.fillStyle = getRandomColor();
        ctx.font = "italic bold 50px 'Dancing Script', cursive";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(dynamicText, w / 2, h / 2);
    }
}

function createFirework() {
    xPoint = Math.random() * (w - 200) + 100;
    yPoint = Math.random() * (h - 200) + 100;
    const nFire = Math.random() * 50 + 100;
    const c = getRandomFireworkColor();

    for (let i = 0; i < nFire; i++) {
        const particle = new Particle(c);
        particles.push(particle);
    }
}

function Particle(color) {
    this.w = this.h = Math.random() * 4 + 1;
    this.x = xPoint - this.w / 2;
    this.y = yPoint - this.h / 2;
    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10;
    this.alpha = Math.random() * 0.5 + 0.5;
    this.color = color;
}

Particle.prototype = {
    gravity: 0.05,
    move: function () {
        this.x += this.vx;
        this.vy += this.gravity;
        this.y += this.vy;
        this.alpha -= 0.01;
        return !(this.x <= -this.w || this.x >= w || this.y >= h || this.alpha <= 0);
    },
    draw: function (c) {
        c.save();
        c.beginPath();
        c.translate(this.x + this.w / 2, this.y + this.h / 2);
        c.arc(0, 0, this.w, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.globalAlpha = this.alpha;
        c.closePath();
        c.fill();
        c.restore();
    }
};

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 16; i++) {
        color += letters[Math.floor(Math.random() * 32)];
    }
    return color;
}

function getRandomFireworkColor() {
    const colors = ["#FF5252", "#FFD740", "#64B5F6", "#69F0AE", "#FF4081", "#f44336", "#e91e63", "#9c27b0", "#3f51b5", "#2196f3", "#2196f3", "#009688", "#4caf50", "#cddc39", "#ffeb3b", "#ff5722"];
    return colors[Math.floor(Math.random() * colors.length)];
}

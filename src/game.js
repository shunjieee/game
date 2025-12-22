// // Initialize Telegram WebApp
// const tg = window.Telegram.WebApp;
// tg.expand(); // Opens the app to full height

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const overlay = document.getElementById('overlay');
const restartBtn = document.getElementById('restartBtn');

// Set canvas size
canvas.width = 300;
canvas.height = 500;

// Game State
let score = 0;
let gameOver = false;
let player = { x: 135, y: 430, size: 30 };
let obstacles = [];
let gameSpeed = 5;

// Handle Input (Mouse & Touch)
function movePlayer(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    player.x = Math.max(0, Math.min(canvas.width - player.size, x - player.size / 2));
}

canvas.addEventListener('mousemove', movePlayer);
canvas.addEventListener('touchmove', movePlayer);

// Main Game Loop
function update() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Player
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // Spawn Obstacles
    if (Math.random() < 0.03) {
        obstacles.push({ x: Math.random() * (canvas.width - 40), y: -40, size: 40 });
    }

    // Update & Draw Obstacles
    obstacles.forEach((obs, index) => {
        obs.y += gameSpeed;
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(obs.x, obs.y, obs.size, obs.size);

        // Collision Detection
        if (player.x < obs.x + obs.size &&
            player.x + player.size > obs.x &&
            player.y < obs.y + obs.size &&
            player.y + player.size > obs.y) {
            endGame();
        }

        // Score increase
        if (obs.y > canvas.height) {
            obstacles.splice(index, 1);
            score++;
            scoreElement.innerText = `Score: ${score}`;
            gameSpeed += 0.1; // Speed up
        }
    });

    requestAnimationFrame(update);
}

function endGame() {
    gameOver = true;
    overlay.classList.remove('hidden');
    tg.HapticFeedback.notificationOccurred('error');
}

function resetGame() {
    score = 0;
    gameSpeed = 5;
    obstacles = [];
    gameOver = false;
    scoreElement.innerText = `Score: 0`;
    overlay.classList.add('hidden');
    update();
}

restartBtn.addEventListener('click', resetGame);

// Start the game
update();
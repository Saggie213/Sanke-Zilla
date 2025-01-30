// Game Constants & Variables
let inputDir = { x: 0, y: 0 };
const foodSound = new Audio('music/food.mp3');
const gameOverSound = new Audio('music/gameover.mp3');
const moveSound = new Audio('music/move.mp3');
const musicSound = new Audio('music/music.mp3');
let speed = 8;
let score = 0;
let lastPaintTime = 0;
let snakeArr = [{ x: 13, y: 15 }];
let food = { x: 6, y: 7 };
let powerUps = [];
let obstacles = [];
let powerUpEffect = null;
let powerUpDuration = 0;
let shieldActive = false;

// Function to increase speed
function increaseSpeed() {
    speed += 1; // Increase the speed by 1 (or any other increment)
}

// Function to add power-ups
function addPowerUp() {
    let a = 2;
    let b = 16;
    powerUps.push({ x: Math.round(a + (b - a) * Math.random()), y: Math.round(a + (b - a) * Math.random()) });
}

// Function to add obstacles
function addObstacle() {
    let a = 2;
    let b = 16;
    obstacles.push({ x: Math.round(a + (b - a) * Math.random()), y: Math.round(a + (b - a) * Math.random()) });
}

// Function to apply power-up effect
function applyPowerUp(effect) {
    switch (effect) {
        case 'speedBoost':
            speed += 5;
            break;
        case 'slowDown':
            speed = Math.max(2, speed - 3);
            break;
        case 'shield':
            shieldActive = true;
            break;
        case 'doublePoints':
            score += 1; // Double points for the next food item
            break;
    }
    powerUpEffect = effect;
    powerUpDuration = 5000; // Power-up lasts for 5 seconds
}

// Function to remove power-up effect
function removePowerUp() {
    switch (powerUpEffect) {
        case 'speedBoost':
            speed -= 5;
            break;
        case 'slowDown':
            speed += 3;
            break;
        case 'shield':
            shieldActive = false;
            break;
    }
    powerUpEffect = null;
}

// Game Functions
function main(ctime) {
    window.requestAnimationFrame(main);
    if ((ctime - lastPaintTime) / 1000 < 1 / speed) {
        return;
    }
    lastPaintTime = ctime;
    gameEngine();
}

function isCollide(snake) {
    // If you bump into yourself 
    for (let i = 1; i < snakeArr.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }
    // If you bump into the wall
    if (snake[0].x >= 18 || snake[0].x <= 0 || snake[0].y >= 18 || snake[0].y <= 0) {
        return true;
    }
    // If you bump into an obstacle
    for (let obstacle of obstacles) {
        if (snake[0].x === obstacle.x && snake[0].y === obstacle.y) {
            return true;
        }
    }
    return false;
}

function gameEngine() {
    // Part 1: Updating the snake array & Food
    if (isCollide(snakeArr)) {
        if (shieldActive) {
            shieldActive = false; // Remove shield on collision
        } else {
            gameOverSound.play();
            musicSound.pause();
            inputDir = { x: 0, y: 0 };
            alert("Game Over. Press any key to play again!");
            snakeArr = [{ x: 13, y: 15 }];
            powerUps = [];
            obstacles = [];
            musicSound.play();
            score = 0;
            speed = 8; // Reset speed to initial value
            powerUpEffect = null; // Reset power-up effect
        }
    }

    // If you have eaten the food, increment the score and regenerate the food
    if (snakeArr[0].y === food.y && snakeArr[0].x === food.x) {
        foodSound.play();
        score += 1;
        if (score % 5 === 0) { // Increase speed for every 5 points
            increaseSpeed();
        }
        if (score > hiscoreval) {
            hiscoreval = score;
            localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
            hiscoreBox.innerHTML = "HiScore: " + hiscoreval;
        }
        scoreBox.innerHTML = "Score: " + score;
        snakeArr.unshift({ x: snakeArr[0].x + inputDir.x, y: snakeArr[0].y + inputDir.y });
        let a = 2;
        let b = 16;
        food = { x: Math.round(a + (b - a) * Math.random()), y: Math.round(a + (b - a) * Math.random()) };

        // Add power-up or obstacle
        if (score > 10) { // Only add power-ups and obstacles when score is above 10
            if (Math.random() < 0.5) {
                addPowerUp();
            } else {
                addObstacle();
            }
        }
    }

    // Check if the snake has encountered a power-up
    for (let i = 0; i < powerUps.length; i++) {
        if (snakeArr[0].x === powerUps[i].x && snakeArr[0].y === powerUps[i].y) {
            applyPowerUp(['speedBoost', 'slowDown', 'shield', 'doublePoints'][Math.floor(Math.random() * 4)]);
            powerUps.splice(i, 1);
        }
    }

    // Update power-up duration
    if (powerUpEffect && powerUpDuration > 0) {
        powerUpDuration -= 1000 / speed;
    } else if (powerUpEffect && powerUpDuration <= 0) {
        removePowerUp();
    }

    // Moving the snake
    for (let i = snakeArr.length - 2; i >= 0; i--) {
        snakeArr[i + 1] = { ...snakeArr[i] };
    }

    snakeArr[0].x += inputDir.x;
    snakeArr[0].y += inputDir.y;

    // Part 2: Display the snake and Food
    // Display the snake
    board.innerHTML = "";
    snakeArr.forEach((e, index) => {
        let snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = e.y;
        snakeElement.style.gridColumnStart = e.x;

        if (index === 0) {
            snakeElement.classList.add('head');
        } else {
            snakeElement.classList.add('snake');
        }
        board.appendChild(snakeElement);
    });

    // Display the food
    let foodElement = document.createElement('div');
    foodElement.style.gridRowStart = food.y;
    foodElement.style.gridColumnStart = food.x;
    foodElement.classList.add('food');
    board.appendChild(foodElement);

    // Display power-ups
    powerUps.forEach((pu) => {
        let powerUpElement = document.createElement('div');
        powerUpElement.style.gridRowStart = pu.y;
        powerUpElement.style.gridColumnStart = pu.x;
        powerUpElement.classList.add('power-up');
        board.appendChild(powerUpElement);
    });

    // Display obstacles
    obstacles.forEach((ob) => {
        let obstacleElement = document.createElement('div');
        obstacleElement.style.gridRowStart = ob.y;
        obstacleElement.style.gridColumnStart = ob.x;
        obstacleElement.classList.add('obstacle');
        board.appendChild(obstacleElement);
    });
}

// Main logic starts here
window.requestAnimationFrame(main);

// Play the background music when the game loads
musicSound.play();

let hiscore = localStorage.getItem("hiscore");
if (hiscore === null) {
    hiscoreval = 0;
    localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
} else {
    hiscoreval = JSON.parse(hiscore);
    hiscoreBox.innerHTML = "HiScore: " + hiscore;
}

window.addEventListener('keydown', e => {
    inputDir = { x: 0, y: 1 }; // Start the game
    moveSound.play();
    switch (e.key) {
        case "ArrowUp":
            inputDir.x = 0;
            inputDir.y = -1;
            break;
        case "ArrowDown":
            inputDir.x = 0;
            inputDir.y = 1;
            break;
        case "ArrowLeft":
            inputDir.x = -1;
            inputDir.y = 0;
            break;
        case "ArrowRight":
            inputDir.x = 1;
            inputDir.y = 0;
            break;
    }
});

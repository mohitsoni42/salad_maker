document.addEventListener('DOMContentLoaded', function () {
    initializeGame();
});


let gameInterval;
let timerUpdateInterval;
let score = 0;
let timer = 20;
let encouragementDisplayed = false;
let badFruitClicked = false;
let comet;

let gameContainer;
let trailCanvas;
let trailCtx;
const trail = [];


function initializeGame() {
    gameContainer = document.getElementById('game-container');
    trailCanvas = document.getElementById('trail-canvas');
    trailCtx = trailCanvas.getContext('2d');

    gameContainer.addEventListener('mousemove', handleMouseMove);
    resizeTrailCanvas();

    document.getElementById('start-btn').addEventListener('click', startGame);

    updateScore();
}

function resizeTrailCanvas() {
    // Set the size of the trail canvas to match the game container
    trailCanvas.width = gameContainer.clientWidth;
    trailCanvas.height = gameContainer.clientHeight;
}

function handleMouseMove(event) {
    const rect = gameContainer.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    addTrailPoint(mouseX, mouseY);
    drawTrail();
}

function addTrailPoint(x, y) {
    trail.push({ x, y, createdAt: Date.now() });
}

function drawTrail() {
    trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    const radius = 5; // Adjust the radius of each point

    for (let i = 0; i < trail.length; i++) {
        const point = trail[i];
        const lifeLeft = 1 - (Date.now() - point.createdAt) / 500; // Adjust the duration of the trail

        if (lifeLeft > 0) {
            const alpha = lifeLeft > 0.5 ? 1 : lifeLeft * 2; // Adjust the alpha (transparency) based on lifeLeft
            trailCtx.fillStyle = `rgba(255, 0, 0, ${alpha})`; // Adjust the color

            trailCtx.beginPath();
            trailCtx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
            trailCtx.fill();
        }
    }
}
function getEncouragementMessage() {
    const messages = [
        'Well done! Your final score is',
        'Amazing! You scored',
        'Great job! Your score is',
        'Fantastic! You achieved a score of',
        'Impressive! Your final score is'
    ];

    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
}

function startGame() {
    document.getElementById('start-btn').disabled = true;

    // Clear existing message elements
    document.querySelectorAll('.encouragement-message').forEach(messageElement => gameContainer.removeChild(messageElement));

    score = 0;
    updateScore();
    timer = 30;

    // Set initial speed factor
    let speedFactor = 1.0;

    // Uncomment the line below to enable the interval for creating fruits
    gameInterval = setInterval(() => {
        if (timer === 0) {
            stopGame();
        } else {
            createRandomFruit();
            // Increase speed factor by 10% each second
            speedFactor *= 1.10;
        }
    }, 1000 / speedFactor);

    // Display and update the timer
    const timerContainer = document.getElementById('timer-container');
    timerContainer.innerText = `Time: ${timer}`;
    timerUpdateInterval = setInterval(() => {
        if (timer === 0) {
            stopGame();
        } else {
            timer--;
            timerContainer.innerText = `Time: ${timer}`;
        }
    }, 1000);

     // Enable the start button after stopping the game
     document.getElementById('start-btn').disabled = true;
}

function stopGame() {
    clearInterval(gameInterval);
    clearInterval(timerUpdateInterval);

    // Clear previous fruits and bad fruits
    document.querySelectorAll('.fruit, .bad-fruit').forEach(fruit => gameContainer.removeChild(fruit));

    // Clear existing message elements
    document.querySelectorAll('.encouragement-message').forEach(messageElement => gameContainer.removeChild(messageElement));

    const encouragementMessage = badFruitClicked ? "Oh no! You cut a bad apple. Can't make the salad now." : `You made salad of ${score} Apples, Enjoy...`;

    // Create a message element
    const messageElement = document.createElement('div');
    messageElement.classList.add('encouragement-message');
    messageElement.innerText = encouragementMessage;
    messageElement.style.fontSize = '30px';
    messageElement.style.color = '#C70039';
    messageElement.style.position = 'absolute';
    messageElement.style.top = '50%';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translate(-50%, -50%)';

    // Append the message to the game container
    gameContainer.appendChild(messageElement);

    // Display the timer if it's not a bad fruit click
    if (!badFruitClicked) {
        // Clear the timer display
        document.getElementById('timer-container').innerText = '';
    }

    // Enable the start button after stopping the game
    document.getElementById('start-btn').disabled = false;

    // Reset flags
    badFruitClicked = false;
}

function removeEncouragementContainer() {
    const encouragementContainer = document.getElementById('encouragement-container');
    if (encouragementContainer) {
        encouragementContainer.remove();
    }
}

function createRandomFruit() {
    const fruit = document.createElement('div');
    fruit.classList.add('fruit');

    // Set random position at the top of the game container
    const maxX = gameContainer.clientWidth - 50;
    const randomX = Math.floor(Math.random() * maxX);

    fruit.style.left = `${randomX}px`;
    fruit.style.top = '0';

    // Set random fruit type
    const fruitType = Math.random() < 0.5 ? 'apple' : 'orange';
    fruit.classList.add(fruitType);

    // Attach hover event to the fruit
    fruit.addEventListener('mouseover', () => {
        playHoverSound();
        gameContainer.removeChild(fruit);
        updateScore();
    });

    gameContainer.appendChild(fruit);

    // Animate the fruit's downward movement
    animateFruit(fruit);

    // Adjust the probability for creating a bad fruit
    const createBadFruit = Math.random() < 0.1;

    if (createBadFruit) {
        createBadFruitElement();
    }
}

function animateFruit(fruit) {
    let positionY = 0;
    const animationInterval = setInterval(() => {
        positionY += 5; // Adjust the speed as needed
        fruit.style.top = `${positionY}px`;

        // Stop the animation when the fruit reaches the bottom
        if (positionY >= gameContainer.clientHeight - 50) {
            clearInterval(animationInterval);
            gameContainer.removeChild(fruit);
        }
    }, 30);
}

function createBadFruitElement() {
    if (badFruitClicked) {
        return; // Do not create more bad fruits if one has been clicked
    }

    const badFruit = document.createElement('div');
    badFruit.classList.add('bad-fruit');

    // Set random position at the top of the game container
    const maxX = gameContainer.clientWidth - 50;
    const randomX = Math.floor(Math.random() * maxX);

    badFruit.style.left = `${randomX}px`;
    badFruit.style.top = '0';

    gameContainer.appendChild(badFruit);

    // Attach hover event to the bad-fruit
    badFruit.addEventListener('mouseover', () => {
        badFruitClicked = true; // Set the flag to true

        // Stop the game and display the message for clicking a bad fruit
        stopGame();

        // Play the sound for bad fruits
        playHoverSound();
    });

    // Animate the bad-fruit's downward movement
    animateFruit(badFruit);
}


function updateScore() {
    score++;
    document.getElementById('score-container').innerText = `Score: ${score}`;
}

function playHoverSound() {
    const hoverSound = document.getElementById('hover-sound');
    hoverSound.currentTime = 0; // Reset the sound to the beginning
    hoverSound.play();
}

document.querySelector('.fruit').addEventListener('mouseover', function () {
    document.getElementById('hover-sound').play();
});

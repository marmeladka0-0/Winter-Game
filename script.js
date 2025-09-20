const canvas = document.querySelector('canvas'); //нашли канвас в індекс штмл
const ctx = canvas.getContext('2d'); //просто скорочення на майбутне

//задає розміри центрального канвасу
canvas.height = window.visualViewport ?
    window.visualViewport.height : window.innerHeight;
canvas.width = window.visualViewport ?
    Math.min(window.visualViewport.width, canvas.height * 0.6) :
    Math.min(window.innerWidth, canvas.height * 0.6);

//Параметри гравця
const playerWidth = 26; //змінна для ширині игрока
const playerHeight = 50; //змінна для висоти
let playerX = canvas.width / 2 - playerWidth / 2; //початкова позиція по х по центру
let playerY = canvas.height - playerHeight * 2; //початкова позиція в самому низу

let score = -4; //результат спочатку -4, бо машинки починаються не відразу
let gameOver = false;//для зупинки гри

//висота і ширина машинок, спочатку це були просто червоні квадратики
const redRectWidth = 50;
const redRectHeight = 50;

//Загрузка зображеннь
const playerImage = new Image();
playerImage.src = './assets/player1_mini.png';  //ігрок

const redRectImage = new Image();
redRectImage.src = './assets/car.png';  //машинка

const roadImage = new Image();
roadImage.src = './assets/bigroad.png'; //дорога

const backgroundImage = new Image();
backgroundImage.src = './assets/background_snow.png';//задній фон зі снігом

const scoreBarHeight = canvas.height % 50;//висота для панелі результатів

//швидкість гравця
const speed = 50;

let redRectsHeight = canvas.height % 50;//висота з якої розташовуються ряди машинок

const numRows = 5; //скільки рядів машинок спочатку

//позиції машинок чи червоних прямокутників
let redRects = [];
for (let row = 0; row < numRows; row++) {
    //кожен рядок буде починатися з іншої висоти (відступ від верхньої межі)
    let startY = canvas.height % 50 + row * 100; //розділяемо строки по Y на 100px
    let startX = (Math.floor(Math.random() * 10) * 50) % 400; //для генерації позиції х
    let startDirection = Math.random() > 0.5 ? 1 : -1; //для напрямку
    redRects.push(
        { x: 0 + startX, y: startY, width: 50, height: 50, direction: startDirection},
        { x: 150 + startX, y: startY, width: 50, height: 50, direction: startDirection},
        { x: 300 + startX, y: startY, width: 50, height: 50, direction: startDirection}
    );
}

//функція для малювання гравця
function drawPlayer() {
    if (gameOver) {
        //Якщо гра завершена, затемнюємо екран
        ctx.fillStyle = 'rgba(49, 43, 43, 0.9)'; //напівпрозорий чорний колір
        ctx.fillRect(0, 0, canvas.width, canvas.height); //малюємо чорний прямокутник

        //показуємо повідомлення про завершення гри
        ctx.fillStyle = 'rgba(221, 247, 244, 1)'; //колір тексту
        ctx.font = '48px Arial'; //розмір та шрифт тексту
        ctx.textAlign = 'center'; //вирівнювання тексту по центру
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20); //малюємо повідомлення

        //показуємо score
        ctx.font = '24px Arial'; //розмір шрифту
        ctx.fillText(`Your score: ${Math.floor(score / 2)}`, canvas.width / 2, canvas.height / 2 + 30); //виводемо

        return; //перериваємо виконання функції, щоб зупинити гру
    }


    ctx.clearRect(0, 0, canvas.width, canvas.height); // очищаємо канвас

    //Малюємо фон, розтягуємо його по ширині та висоті канвасу
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); //фон растягується по канвасу

    //Малюємо дорогу під кожним рядом червоних прямокутників
    for (let rect of redRects) {
        ctx.drawImage(roadImage, 0, rect.y, canvas.width, 50); //малюємо дорогу під одним рядом
    }

    //малюємо полоску для рахунку зверху
    ctx.fillStyle = 'rgba(221, 247, 244, 1)'; //колір полоски
    ctx.fillRect(0, 0, canvas.width, scoreBarHeight); //малюємо полоску зверху

    //Малюємо гравця
    ctx.drawImage(playerImage, playerX, playerY, playerWidth, playerHeight);

    //малюємо машини
    for (let rect of redRects) {
        ctx.drawImage(redRectImage, rect.x, rect.y, rect.width, rect.height); //малюєм одну машину
    }

    //двигаємо машини
    moveRedRects();

    

    //відображаємо рахунок у верхній частині екрану
    ctx.fillStyle = 'black'; //колір тексту
    ctx.font = '24px Arial'; //розмір та шрифт
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${Math.floor((score < 0 ? 0 : score) / 2)}`, 10, 30); //малюємо

    checkCollision(); //перевіряємо зіткнення гравця з машинками

    drawGreenBarWithText(); //малюємо той надпис знизу, там де з Новим роком

    requestAnimationFrame(drawPlayer); //знову визиваємо цю функцію
}

function drawGreenBarWithText() {
    const barHeight = 50; //висота 
    const barY = canvas.height - barHeight; //позиція по Y

    //Малюємо полочку
    ctx.fillStyle = 'rgba(221, 247, 244, 1)';//колір
    ctx.fillRect(0, barY, canvas.width, barHeight);

    //Малюємо надпис в центрі
    ctx.fillStyle = 'rgba(49, 43, 43, 0.9)'; //колір тексту
    ctx.font = '24px Arial'; //розмір і шрифт
    ctx.textAlign = 'center'; //по центру
    ctx.textBaseline = 'middle'; //по висоті
    ctx.fillText('Happy New Year!', canvas.width / 2, barY + barHeight / 2); 
}

//функція для руху машинок
function moveRedRects() {

    for (let rect of redRects) {
        rect.x += 2 * rect.direction; //рухаємо прямокутники вправо чи вліво в залежності від його напрямку

        //якщо прямокутник виходить за межі екрана, перенести його назад на початок
        if (rect.x > canvas.width) {
            rect.x = -redRectWidth;  //переміщуємо за межі екрана ліворуч
        }
        //якщо прямокутник виходить за межі екрана зліва
        if (rect.x < -redRectWidth) {
            rect.x = canvas.width;  //переміщуємо за межі екрана праворуч
        }

    }

    redRects = redRects.filter(rect => rect.y < canvas.height - redRectHeight); //фільтруемо масив, щоб видалити машинки, які вже не на полі
}

function checkCollision() {
    for (let rect of redRects) {
        //перевірка перетину прямокутників
        if (
            playerX < rect.x + redRectWidth &&
            playerX + playerWidth > rect.x &&
            playerY < rect.y + redRectHeight &&
            playerY + playerHeight > rect.y
        ) {
            gameOver = true; //записуемо що зіткнення сталося, гра зупиняється
        }
    }
}

//Обробляемо клавішу стрелочки вверх
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        for (let rect of redRects) {
            if (rect.y < canvas.height - rect.height) {
                rect.y += speed; // Рухаємо ряди з машинками вниз
            }
        }
        score++;
        if (score % 2 === 0) { //додаємо новий ряд машинок кожні 2 строчки
            let startY = canvas.height % 50;
            let startX = (Math.floor(Math.random() * 10) * 50) % 400;
            let startDirection = Math.random() > 0.5 ? 1 : -1;
            redRects.push(
                { x: 0 + startX, y: startY, width: 50, height: 50, direction: startDirection },
                { x: 150 + startX, y: startY, width: 50, height: 50, direction: startDirection },
                { x: 300 + startX, y: startY, width: 50, height: 50, direction: startDirection }
            );
        }
    }
});

//виклик головної функції
drawPlayer();
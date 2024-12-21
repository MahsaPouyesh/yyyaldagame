const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// تنظیم اندازه‌ی canvas
canvas.width = window.innerWidth;  // عرض برابر با عرض صفحه
canvas.height = window.innerHeight; // ارتفاع برابر با ارتفاع صفحه
canvas.addEventListener('touchstart', function(e) {
    if (!musicStarted) {
        wsound.loop = true; // برای پخش بی‌پایان
        wsound.play(); // موسیقی پس‌زمینه را پخش می‌کند
        musicStarted = true; // بعد از پخش موسیقی از این به بعد پخش نمی‌شود
    }

    // شروع حرکت بازیکن
    touchStartX = e.touches[0].clientX;
});

// متغیرهای بازی
let score = 0;
let playerX = canvas.width / 2 - 45; // موقعیت اولیه پلیر (بر اساس اندازه پلیر)
const playerWidth = 155;
const playerHeight = 155;
let fallingItems = [];
let gameSpeed = 2;
let itemSpeed = 2;
const watermelonWidth = 300;
const watermelonHeight = 180;

// بارگذاری تصاویر
const watermelonImage = new Image();
const pomegranateImage = new Image();
const playerImage = new Image();
const collectSound = new Audio('sounds/ding-36029.mp3');
const pomegranateSound = new Audio('sounds/ding-sound-246413.mp3');
const gameOverSound = new Audio('sounds/game-over-2-sound-effect-230463.mp3');  // صدای پایان بازی
const winSound= new Audio('sounds/goodresult-82807.mp3'); 
const wsound=new Audio('sounds/Akam Band - Yalda (128).mp3');

watermelonImage.src = 'images/graphic-1552311_1920.png';  // هندوانه
pomegranateImage.src = 'images/pomegranate-3845463_1920.png';  // انار
playerImage.src = 'images/snow-160956_1280.png';  // تصویر پلیر

playerImage.onload = function() {
    gameLoop(); 
};

// هندسه حرکت شخصیت
let touchStartX = 0;  // متغیر برای ذخیره موقعیت اولیه لمس
let gameRunning = true;  // متغیر برای بررسی وضعیت بازی

// کنترل حرکت شخصیت با لمس
canvas.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX; // ذخیره موقعیت لمس اولیه
});

canvas.addEventListener('touchmove', function(e) {
    let touchEndX = e.touches[0].clientX; // موقعیت لمس کنونی
    const deltaX = touchEndX - touchStartX; // تغییر در موقعیت لمس

    if (deltaX > 0 && playerX < canvas.width - playerWidth) {
        // حرکت به سمت راست
        playerX += 15;  // تغییرات برای حرکت پلیر به راست
    } else if (deltaX < 0 && playerX > 0) {
        // حرکت به سمت چپ
        playerX -= 15;  // تغییرات برای حرکت پلیر به چپ
    }

    touchStartX = touchEndX;  // به‌روزرسانی موقعیت لمس برای حرکت بعدی
});
// اضافه کردن کنترل‌های کیبورد
window.addEventListener('keydown', function(e) {
    if (e.key === "ArrowRight" && playerX < canvas.width - playerWidth) {
        playerX += 15;  // حرکت به سمت راست
    } else if (e.key === "ArrowLeft" && playerX > 0) {
        playerX -= 15;  // حرکت به سمت چپ
    }
});
// ایجاد آیتم‌های جدید
function createFallingItem() {
    const randomX = Math.random() * (canvas.width - 40);
    const randomType = Math.random() > 0.5 ? 'watermelon' : 'pomegranate';
    return {
        x: randomX,
        y: -50,
        type: randomType,
    };
}

// به روز رسانی آیتم‌ها و وضعیت بازی
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // پاک کردن صفحه

    if (!gameRunning) return;  // اگر بازی تمام شده، حلقه متوقف می‌شود

    // نمایش شخصیت اصلی
    ctx.drawImage(playerImage, playerX, canvas.height - playerHeight, playerWidth, playerHeight);

    // ایجاد و حرکت آیتم‌ها
    if (Math.random() < 0.02) {
        fallingItems.push(createFallingItem());
    }

    // به‌روزرسانی وضعیت آیتم‌ها
    fallingItems = fallingItems.filter((item) => {
        item.y += itemSpeed;  // حرکت به پایین

        // نمایش آیتم‌ها
        if (item.type === 'watermelon') {
            ctx.drawImage(watermelonImage, item.x, item.y, 40, 40);
        } else {
            ctx.drawImage(pomegranateImage, item.x, item.y, 40, 40);
        }

        // برخورد با شخصیت اصلی
        if (item.y + 40 > canvas.height - playerHeight &&
            item.x < playerX + playerWidth &&
            item.x + 40 > playerX) {
            if (item.type === 'watermelon') {
                score++;
                collectSound.play(); // صدای هندوانه
            } else {
                score--;
                pomegranateSound.play(); // صدای انار
            }
            return false; // حذف آیتم از آرایه
        }

        // اگر آیتم از صفحه افتاد
        if (item.y > canvas.height) {
            return false;
        }

        return true;
    });
     // بررسی پیروزی (امتیاز 13)
     if (score === 10) {
        winSound.play(); // پخش صدای پیروزی
        alert("تو برنده شدی! امتیاز شما: " + score);  // پیغام برنده شدن
        gameRunning = false;
    }

    // بررسی پایان بازی
    if (score < 0) {
        gameOver(); // پایان بازی
        return;
    }

    // به‌روزرسانی امتیاز
    document.getElementById('score').textContent = score;

    // اجرای بازی تا زمانی که مرورگر باز است
    requestAnimationFrame(gameLoop);
}

// تابع پایان بازی
function gameOver() {
    gameRunning = false; // متوقف کردن بازی
    gameOverSound.play();  // پخش صدای پایان بازی
    alert("بازی تمام شد! امتیاز شما: " + score);  // نمایش پیام پایان بازی

    if (confirm("آیا می خواهید دوباره بازی را شروع کنید؟")) {
        restartGame();  // شروع مجدد بازی
    }
}

// تابع برای شروع مجدد بازی
function restartGame() {
    score = 0;  // بازنشانی امتیاز
    fallingItems = [];  // پاک کردن آیتم‌های سقوطی
    gameRunning = true;  // راه‌اندازی دوباره بازی
    gameLoop();  // شروع مجدد حلقه بازی
}

// ایجاد دانه‌های برف
function createSnowflakes() {
    const snowflakesContainer = document.getElementById('snowflakes');
    const snowflakeCount = 50; // تعداد دانه‌های برف

    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        
        // موقعیت تصادفی دانه‌های برف
        snowflake.style.left = Math.random() * 100 + 'vw'; // موقعیت افقی تصادفی
        snowflake.style.animationDuration = Math.random() * 3 + 7 + 's'; // مدت زمان سقوط تصادفی

        // سایز تصادفی دانه‌های برف
        const size = Math.random() * 5 + 5; // اندازه تصادفی
        snowflake.style.width = size + 'px';
        snowflake.style.height = size + 'px';

        // اضافه کردن دانه به صفحه
        snowflakesContainer.appendChild(snowflake);
    }
}

// ایجاد ابرها
function createClouds() {
    const cloudsContainer = document.getElementById('clouds');
    const cloudCount = 6;  // تعداد ابرها

    for (let i = 0; i < cloudCount; i++) {
        const cloud = document.createElement('div');
        cloud.classList.add('cloud');
        
        // موقعیت تصادفی عمودی ابرها
        cloud.style.top = Math.random() * 30 + 'vh';  // ابرها در ارتفاع‌های مختلف قرار می‌گیرند
        // موقعیت تصادفی افقی ابرها
        cloud.style.left = Math.random() * 100 + 'vw'; // ابرها در موقعیت‌های مختلف از چپ شروع می‌کنند
        
        // سایز تصادفی ابرها
        const size = Math.random() * 50 + 100;  // اندازه‌های تصادفی برای ابرها
        cloud.style.width = size + 'px';
        cloud.style.height = (size * 0.5) + 'px'; 


        cloud.style.animationDuration = Math.random() * 10 + 20 + 's'; 

         
        cloudsContainer.appendChild(cloud);
    }
}
createSnowflakes();

createClouds();

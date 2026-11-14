// Настройки
const music = document.getElementById("bg-music");
const splash = document.getElementById("splash-screen");
const mainContent = document.getElementById("main-content");
const startBtn = document.getElementById("start-btn");
const physicsLayer = document.getElementById("physics-layer");

// Список стикеров
const stickers = [
  "img/kus.png",
  "img/tsits.png",
  "img/rat.png",
  "img/cat1.png",
  "img/cat2.png",
  "img/cat3.png",
  "img/lizard1.png",
  "img/lizard2.png",
  "img/lizard3.png",
  "img/lizard4.png",
  "img/lizard5.png",
];

let physicsActive = false;
let particles = []; // Массив для хранения живых стикеров

// --- 1. Запуск и Звук ---
startBtn.addEventListener("click", () => {
  music.volume = 0.5;
  music.play().catch((e) => console.log("Аудио заблокировано:", e));

  splash.classList.add("fade-out");

  setTimeout(() => {
    mainContent.classList.add("visible");
  }, 100);

  setTimeout(() => {
    const overlay = document.querySelector(".sticker-overlay");
    if (overlay) overlay.classList.add("slapped");
  }, 2000);

  initPhysics();
  startAutoSlide();
});

// Остановка звука при смене вкладки
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    music.pause();
  } else {
    if (!splash.classList.contains("fade-out")) return;
    music.play().catch((e) => {});
  }
});

// --- 2. Логика Карусели ---
let currentSlide = 0;
const carousel = document.getElementById("carousel");
const totalSlides = document.querySelectorAll(".card").length;
let autoSlideInterval;

function updateCarousel() {
  carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function moveSlide(direction) {
  currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
  updateCarousel();
  resetAutoSlide();
}

function startAutoSlide() {
  autoSlideInterval = setInterval(() => {
    moveSlide(1);
  }, 10000); // 10 секунд на карточку
}

function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  startAutoSlide();
}

// --- 3. Убегающие кнопки ---
const escapeBtns = document.querySelectorAll(".escape-btn");
let dodgeCounts = { "close-btn": 0, "mute-btn": 0 };

escapeBtns.forEach((btn) => {
  btn.addEventListener("mouseover", () => {
    if (dodgeCounts[btn.id] < 3) {
      dodge(btn);
      dodgeCounts[btn.id]++;
    }
  });

  btn.addEventListener("click", () => {
    if (btn.id === "close-btn") {
      alert("Шут не предусмотрел закрывать ¯⁠\\⁠_⁠(⁠ツ⁠)⁠_⁠/⁠¯");
    } else if (btn.id === "mute-btn") {
      if (music.paused) music.play();
      else music.pause();
      btn.innerHTML = music.paused ? "🔇" : "🔊";
    }
  });
});

function dodge(element) {
  const maxX = window.innerWidth - 60;
  const maxY = window.innerHeight - 60;
  element.style.left = `${Math.floor(Math.random() * maxX)}px`;
  element.style.top = `${Math.floor(Math.random() * maxY)}px`;
  element.style.right = "auto";
}

// --- 4. Финал: Кнопка "Ладно прощаю" ---
document.getElementById("forgive-btn").addEventListener("click", function (e) {
  for (let i = 0; i < 5; i++) {
    createHeart(e.clientX, e.clientY);
  }
});

function createHeart(x, y) {
  const heart = document.createElement("div");
  heart.classList.add("flying-heart");
  heart.innerText = "🫶";
  heart.style.left = x - 25 + "px";
  heart.style.top = y - 25 + "px";
  heart.style.transform = `translateX(${Math.random() * 100 - 50}px)`;
  physicsLayer.appendChild(heart);
  setTimeout(() => heart.remove(), 2000);
}

// --- 5. ФИЗИКА СТИКЕРОВ (Железобетонная версия) ---
function initPhysics() {
  physicsActive = true;
  spawnRandomSticker();
  setInterval(spawnRandomSticker, 2000); // Спавн раз в 2 секунды
  requestAnimationFrame(updatePhysics);
}

function spawnRandomSticker() {
  if (!physicsActive) return;
  const src = stickers[Math.floor(Math.random() * stickers.length)];
  createParticle(src);
}

function createParticle(src) {
  const img = document.createElement("img");
  img.src = src;
  img.classList.add("floating-sticker");

  const x = Math.random() * (window.innerWidth - 100);
  const y = Math.random() * (window.innerHeight - 100);

  // ОЧЕНЬ МЕДЛЕННАЯ СКОРОСТЬ
  const dx = (Math.random() - 0.5) * 2;
  const dy = (Math.random() - 0.5) * 2;

  const particle = { el: img, x, y, dx, dy, width: 100, height: 100 };

  img.style.left = `${x}px`;
  img.style.top = `${y}px`;
  img.style.transform = `rotate(${Math.random() * 360}deg)`;

  img.addEventListener("click", (e) => {
    e.stopPropagation();
    particle.dx *= 3;
    particle.dy *= 3;
  });

  physicsLayer.appendChild(img);
  particles.push(particle);

  // ЖЕСТКОЕ УДАЛЕНИЕ ЧЕРЕЗ 10 СЕКУНД
  setTimeout(() => {
    img.style.transition = "opacity 0.6s ease";
    img.style.opacity = "0";

    setTimeout(() => {
      img.remove(); // Удаляем из HTML
      // Безопасно удаляем из массива (не перезаписываем переменную!)
      const index = particles.findIndex((p) => p.el === img);
      if (index > -1) {
        particles.splice(index, 1);
      }
    }, 600);
  }, 10000);
}

function updatePhysics() {
  if (!physicsActive) return;

  particles.forEach((p) => {
    p.x += p.dx;
    p.y += p.dy;

    if (p.x <= 0 || p.x + p.width >= window.innerWidth) p.dx *= -1;
    if (p.y <= 0 || p.y + p.height >= window.innerHeight) p.dy *= -1;

    if (p.x < 0) p.x = 0;
    if (p.y < 0) p.y = 0;
    if (p.x + p.width > window.innerWidth) p.x = window.innerWidth - p.width;
    if (p.y + p.height > window.innerHeight)
      p.y = window.innerHeight - p.height;

    p.el.style.left = `${p.x}px`;
    p.el.style.top = `${p.y}px`;
  });

  requestAnimationFrame(updatePhysics);
}

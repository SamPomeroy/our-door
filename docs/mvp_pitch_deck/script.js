const slides = Array.from(document.querySelectorAll('.slide'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const slideCounter = document.getElementById('slideCounter');
const slideTitle = document.getElementById('slideTitle');
const progressFill = document.getElementById('progressFill');
const ambientCanvas = document.getElementById('ambientCanvas');
let activeIndex = 0;

function showSlide(index) {
  if (index < 0 || index >= slides.length) {
    return;
  }

  slides[activeIndex].classList.remove('active');
  activeIndex = index;
  slides[activeIndex].classList.add('active');
  slideCounter.textContent = `${activeIndex + 1} / ${slides.length}`;
  slideTitle.textContent = slides[activeIndex].dataset.title || `Slide ${activeIndex + 1}`;
  progressFill.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
}

function nextSlide() {
  const nextIndex = Math.min(activeIndex + 1, slides.length - 1);
  showSlide(nextIndex);
}

function prevSlide() {
  const prevIndex = Math.max(activeIndex - 1, 0);
  showSlide(prevIndex);
}

prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' || event.key === 'PageDown') {
    nextSlide();
  }
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    prevSlide();
  }
});

showSlide(activeIndex);

function startAmbientBackground() {
  if (!ambientCanvas) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ctx = ambientCanvas.getContext('2d');
  let width = 0;
  let height = 0;
  let animationId;
  let time = 0;

  const ribbons = [
    { color: 'rgba(251, 146, 60, 0.36)', offset: 0, amplitude: 72, speed: 0.012 },
    { color: 'rgba(147, 197, 253, 0.32)', offset: 2.1, amplitude: 96, speed: 0.009 },
    { color: 'rgba(244, 114, 182, 0.18)', offset: 4.2, amplitude: 58, speed: 0.015 },
    { color: 'rgba(250, 204, 21, 0.16)', offset: 5.6, amplitude: 42, speed: 0.011 },
  ];

  function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    ambientCanvas.width = Math.floor(width * pixelRatio);
    ambientCanvas.height = Math.floor(height * pixelRatio);
    ambientCanvas.style.width = `${width}px`;
    ambientCanvas.style.height = `${height}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function drawRibbon(ribbon, index) {
    const yBase = height * (0.24 + index * 0.16);
    const xShift = Math.sin(time * ribbon.speed + ribbon.offset) * width * 0.08;

    ctx.beginPath();
    for (let x = -80; x <= width + 80; x += 18) {
      const progress = x / Math.max(width, 1);
      const waveA = Math.sin(progress * Math.PI * 2.2 + time * ribbon.speed + ribbon.offset);
      const waveB = Math.cos(progress * Math.PI * 5.1 - time * ribbon.speed * 1.4);
      const y = yBase + waveA * ribbon.amplitude + waveB * ribbon.amplitude * 0.32;

      if (x === -80) {
        ctx.moveTo(x + xShift, y);
      } else {
        ctx.lineTo(x + xShift, y);
      }
    }

    ctx.strokeStyle = ribbon.color;
    ctx.lineWidth = 16 - index * 2;
    ctx.lineCap = 'round';
    ctx.shadowColor = ribbon.color;
    ctx.shadowBlur = 26;
    ctx.stroke();

    ctx.strokeStyle = ribbon.color.replace('0.', '0.0');
    ctx.lineWidth = 48 - index * 5;
    ctx.shadowBlur = 42;
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    ribbons.forEach(drawRibbon);

    ctx.globalCompositeOperation = 'source-over';
    time += 1;
    animationId = window.requestAnimationFrame(draw);
  }

  function stop() {
    window.cancelAnimationFrame(animationId);
    ctx.clearRect(0, 0, width, height);
  }

  function updateMotionPreference() {
    if (prefersReducedMotion.matches) {
      stop();
      return;
    }

    stop();
    draw();
  }

  resizeCanvas();
  updateMotionPreference();
  window.addEventListener('resize', resizeCanvas);
  prefersReducedMotion.addEventListener('change', updateMotionPreference);
}

startAmbientBackground();

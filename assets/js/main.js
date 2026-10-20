const menuButton = document.querySelector('#nav-toggle');
const menu = document.querySelector('#nav-menu');

if (menuButton && menu) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    menu.classList.toggle('is-open', !isOpen);
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      menu.classList.remove('is-open');
    });
  });
}

const year = document.querySelector('#year');
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const gravityPortrait = document.querySelector('.gravity-portrait');
if (gravityPortrait) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const portrait = gravityPortrait.querySelector('img');
  const canvas = gravityPortrait.querySelector('canvas');
  const context = canvas.getContext('2d');
  let scrollFrame = 0;

  const initializeParticles = () => {
    const size = Math.round(gravityPortrait.clientWidth);
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const sampleCanvas = document.createElement('canvas');
    const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
    const sampleSize = Math.round(size * scale);
    const sampleStep = Math.max(2, Math.round(scale * 1.5));
    const particles = [];

    sampleCanvas.width = sampleSize;
    sampleCanvas.height = sampleSize;
    sampleContext.drawImage(portrait, 0, 0, sampleSize, sampleSize);
    const imageData = sampleContext.getImageData(0, 0, sampleSize, sampleSize).data;
    canvas.width = sampleSize * 9;
    canvas.height = sampleSize;

    for (let y = 0; y < sampleSize; y += sampleStep) {
      for (let x = 0; x < sampleSize; x += sampleStep) {
        const offset = (y * sampleSize + x) * 4;
        const alpha = imageData[offset + 3];
        if (alpha < 100) continue;

        const seed = (x * 73856093) ^ (y * 19349663);
        const random = (value) => {
          const noise = Math.sin(seed + value * 78.233) * 43758.5453;
          return noise - Math.floor(noise);
        };
        particles.push({
          x: x / scale + size,
          y: y / scale,
          red: imageData[offset],
          green: imageData[offset + 1],
          blue: imageData[offset + 2],
          alpha: alpha / 255,
          drift: 35 + random(1) * 195,
          lift: (random(2) - 0.35) * 260,
          gust: 0.65 + random(4) * 1.1,
          size: sampleStep / scale,
        });
      }
    }

    const updateGravityPortrait = () => {
      const progress = reducedMotion.matches ? 0 : Math.min(window.scrollY / 620, 1);
      const scatter = progress ** 0.9;

      portrait.style.visibility = 'visible';
      portrait.style.opacity = String(0.2 * (1 - progress));
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (const particle of particles) {
        const wind = scatter * particle.gust * 3;
        const particleOpacity = Math.min(progress * 2.4, 1) * 0.55 * (1 - progress);
        context.fillStyle = `rgba(${particle.red}, ${particle.green}, ${particle.blue}, ${particle.alpha * particleOpacity})`;
        context.fillRect(
          (particle.x + particle.drift * wind) * scale,
          (particle.y + particle.lift * scatter) * scale,
          particle.size * scale * (1 + progress * 0.3),
          particle.size * scale * (1 + progress * 0.3),
        );
      }
      scrollFrame = 0;
    };

    updateGravityPortrait();

    window.addEventListener('scroll', () => {
      if (!scrollFrame) {
        scrollFrame = window.requestAnimationFrame(updateGravityPortrait);
      }
    }, { passive: true });

  };

  if (portrait.complete) {
    initializeParticles();
  } else {
    portrait.addEventListener('load', initializeParticles, { once: true });
  }
}

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const header = document.querySelector('.site-header');

function updateHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  nav.classList.remove('is-open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
  nav.classList.toggle('is-open', !isOpen);
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', (event) => {
  if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
}

document.querySelectorAll('.liquid-link').forEach((element) => {
  element.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty('--x', `${event.clientX - rect.left}px`);
    element.style.setProperty('--y', `${event.clientY - rect.top}px`);
  });
});

const valuesCarousel = document.querySelector('.values-carousel');
if (valuesCarousel) {
  const track = valuesCarousel.querySelector('.values-track');
  const [firstSet, secondSet] = track.querySelectorAll('.values-badges');
  const originalBadges = Array.from(firstSet.children).map((badge) => badge.cloneNode(true));

  function fillValuesTrack() {
    firstSet.replaceChildren(...originalBadges.map((badge) => badge.cloneNode(true)));
    // Una tanda completa debe cubrir la pantalla durante todo el recorrido.
    while (firstSet.getBoundingClientRect().width < valuesCarousel.clientWidth) {
      originalBadges.forEach((badge) => {
        const copy = badge.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        firstSet.append(copy);
      });
    }
    secondSet.replaceChildren(...Array.from(firstSet.children).map((badge) => badge.cloneNode(true)));
    track.style.setProperty('--values-duration', `${firstSet.getBoundingClientRect().width / 45}s`);
  }

  fillValuesTrack();
  new ResizeObserver(fillValuesTrack).observe(valuesCarousel);
  document.fonts?.ready.then(fillValuesTrack);
}

document.getElementById('year').textContent = new Date().getFullYear();

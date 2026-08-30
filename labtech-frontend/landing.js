// Carrusel de fotitos
const slides = document.querySelectorAll('.carousel-slide');
let currentIndex = 0;

function nextSlide() {
  slides[currentIndex].classList.remove('active');
  currentIndex = (currentIndex + 1) % slides.length;
  slides[currentIndex].classList.add('active');
}

setInterval(nextSlide, 5000);

const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Control del menu hamburguesa para telefonos
const hamburgerBtn = document.getElementById('hamburger-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');
const navMenuWrapper = document.getElementById('nav-menu-wrapper');
const menuOverlay = document.getElementById('menu-overlay');
const navLinks = document.querySelectorAll('.nav-links a, .nav-menu-wrapper .nav-btn');

function toggleMenu() {
  navMenuWrapper.classList.toggle('active');
  menuOverlay.classList.toggle('active');
  document.body.style.overflow = navMenuWrapper.classList.contains('active') ? 'hidden' : 'auto';
}

if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleMenu);
if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);

// Cerrar el menú automáticamente al hacer clic en un enlace
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (navMenuWrapper.classList.contains('active')) {
      toggleMenu();
    }
  });
});
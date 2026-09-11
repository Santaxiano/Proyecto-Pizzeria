// Carrusel de fotitos
const diapositivas = document.querySelectorAll('.diapositiva-carrusel');
let indiceActual = 0;

function siguienteDiapositiva() {
  diapositivas[indiceActual].classList.remove('activa');
  indiceActual = (indiceActual + 1) % diapositivas.length;
  diapositivas[indiceActual].classList.add('activa');
}

setInterval(siguienteDiapositiva, 5000);

const encabezado = document.querySelector('.encabezado');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    encabezado.classList.add('desplazado');
  } else {
    encabezado.classList.remove('desplazado');
  }
});

// Control del menu hamburguesa para telefonos
const botonHamburguesa = document.getElementById('boton-hamburguesa');
const botonCerrarMenu = document.getElementById('boton-cerrar-menu');
const contenedorMenuNavegacion = document.getElementById('contenedor-menu-navegacion');
const capaFondoMenu = document.getElementById('capa-fondo-menu');
const enlacesNavegacion = document.querySelectorAll('.enlaces-navegacion a, .contenedor-menu-navegacion .boton-ingreso');

function alternarMenu() {
  contenedorMenuNavegacion.classList.toggle('activo');
  capaFondoMenu.classList.toggle('activo');
  document.body.style.overflow = contenedorMenuNavegacion.classList.contains('activo') ? 'hidden' : 'auto';
}

if (botonHamburguesa) botonHamburguesa.addEventListener('click', alternarMenu);
if (botonCerrarMenu) botonCerrarMenu.addEventListener('click', alternarMenu);
if (capaFondoMenu) capaFondoMenu.addEventListener('click', alternarMenu);

// Cerrar el menú automáticamente al hacer clic en un enlace
enlacesNavegacion.forEach(enlace => {
  enlace.addEventListener('click', () => {
    if (contenedorMenuNavegacion.classList.contains('activo')) {
      alternarMenu();
    }
  });
});
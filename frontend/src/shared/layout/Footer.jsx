import { Link } from 'react-router';

const ANIO_ACTUAL = new Date().getFullYear();

function Footer() {
  return (
    <footer className="pie-pagina py-5" id="contacto">
      <div className="container">
        <div className="row gy-4">
          <div className="col-12 col-md-4">
            <h4 className="fw-bold mb-1" style={{ color: 'var(--color-rojo-tomate)' }}>+PIZZA</h4>
            <span className="linea-decorativa"></span>
            <p className="small pe-lg-4">
              Mucho más que pizza libre. Masa artesanal, horno napolitano y la mejor energía en el corazón de San Luis.
            </p>
          </div>

          <div className="col-12 col-md-4">
            <h5>Horarios & Atención</h5>
            <span className="linea-decorativa"></span>
            <p className="mb-1 small">Lunes a Sábado: 12:00 - 15:30 | 19:00 - 00:30</p>
            <p className="mb-2 small">Domingo: 19:00 - 01:00</p>
            <p className="fw-bold text-light mb-0">📞 +54 266 454-5759</p>
          </div>

          <div className="col-12 col-md-4">
            <h5>Encontranos</h5>
            <span className="linea-decorativa"></span>
            <p className="small mb-3">📍 Pringles 1091, San Luis Capital</p>
            <div className="d-flex gap-2">
              <a 
                href="https://www.instagram.com/maspizza.sl" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-social"
              >
                Instagram
              </a>
              <a 
                href="https://wa.me/5492664545759" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-social"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="border-top border-secondary mt-5 pt-3 text-center small text-secondary">
          <p className="mb-0">
            &copy; {ANIO_ACTUAL} +PIZZA. Todos los derechos reservados.
            <Link to="/login" className="text-secondary text-decoration-none ms-3" style={{ fontSize: '0.75rem' }}>
              Acceso Personal
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
import { Link } from 'react-router';

import './ReservaPage.css';

function ReservaPage() {
  return (
    <main className="reserva-pagina">
      <Link className="reserva-boton-salon" to="/salon">
        Ir al salón
      </Link>
    </main>
  );
}

export default ReservaPage;
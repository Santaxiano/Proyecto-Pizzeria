import FormularioReserva from '../components/FormularioReserva'; // Importación de tu formulario
import { crearReserva } from '../services/reservaService';

function ReservaPage() {
  const handleNuevaReserva = (reserva) => crearReserva(reserva);

  return (
    <div className="container py-5" style={{ maxWidth: '680px' }}>
      <header className="text-center mb-4">
        <span 
          className="badge text-uppercase px-3 py-2 mb-2"
          style={{ backgroundColor: 'var(--color-rojo-tomate)', color: '#fff' }}
        >
          Salón & Eventos
        </span>
        <h1 className="display-6 fw-bold mb-2" style={{ color: 'var(--color-negro)' }}>
          Reservá tu Mesa
        </h1>
        <p className="text-secondary mb-0">
          Asegurá tu lugar en <strong>+PIZZA</strong>. Completá los 3 pasos y coordinamos tu mesa por WhatsApp.
        </p>
      </header>

      <div className="card shadow-sm border rounded-4 p-4 p-md-5 bg-white">
        <FormularioReserva onReservaConfirmada={handleNuevaReserva} />
      </div>
    </div>
  );
}

export default ReservaPage;
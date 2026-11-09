import { Link } from 'react-router';

const formatoDiaSemana = new Intl.DateTimeFormat('es-AR', { weekday: 'short' });

// "2026-11-08" -> "dom 08/11" (se arma con hora local para que no corra un día)
function mostrarDia(texto) {
  const [anio, mes, dia] = texto.split('-').map(Number);
  const diaSemana = formatoDiaSemana.format(new Date(anio, mes - 1, dia)).replace('.', '');
  return `${diaSemana} ${texto.slice(8, 10)}/${texto.slice(5, 7)}`;
}

export default function ProximasReservas({ reservas }) {
  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h2 className="h5 fw-bold mb-0">Próximas reservas</h2>
        <Link to="/gestor/salon" className="small fw-semibold text-dark">Ver todas</Link>
      </div>
      {reservas.length > 0 ? (
        <ul className="list-group list-group-flush">
          {reservas.map((reserva) => (
            <li key={reserva.id} className="list-group-item d-flex justify-content-between align-items-center gap-2">
              <div className="text-truncate">
                <div className="fw-semibold text-truncate">{reserva.cliente}</div>
                <div className="small text-secondary text-truncate">{reserva.lugar}</div>
              </div>
              <div className="text-end text-nowrap small">
                <div className="fw-semibold">{mostrarDia(reserva.fecha)} · {reserva.hora}</div>
                <div className="text-secondary">👥 {reserva.comensales}</div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card-body text-center text-muted py-4">No hay reservas próximas.</div>
      )}
    </div>
  );
}

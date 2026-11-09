import { Link } from 'react-router';
import { formatearPrecio } from '../../../shared/utils/formato';

const formatoFecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' });

const clasesEstado = {
  Pendiente: 'bg-danger',
  Confirmada: 'bg-primary',
  Finalizada: 'bg-success',
};

function mostrarFecha(fecha) {
  if (!fecha) return 'Sin fecha registrada';
  const valor = new Date(fecha);
  return Number.isNaN(valor.getTime()) ? 'Fecha no disponible' : formatoFecha.format(valor);
}

export default function PedidosRecientes({ pedidos }) {
  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h2 className="h5 fw-bold mb-0">Pedidos recientes</h2>
        <Link to="/gestor/comandas" className="small fw-semibold text-dark">Ver todos</Link>
      </div>
      {pedidos.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col">Pedido</th>
                <th scope="col">Cliente</th>
                <th scope="col">Estado</th>
                <th scope="col">Total</th>
                <th scope="col">Registrado</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <th scope="row">#{pedido.id}</th>
                  <td>{pedido.cliente}</td>
                  <td>
                    <span className={`badge ${clasesEstado[pedido.estado] || 'bg-secondary'}`}>{pedido.estado}</span>
                  </td>
                  <td className="text-nowrap">{formatearPrecio(Number(pedido.total) || 0)}</td>
                  <td className="text-nowrap small text-muted">{mostrarFecha(pedido.creado_en)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-body text-center text-muted py-5">Todavía no hay pedidos registrados.</div>
      )}
    </div>
  );
}

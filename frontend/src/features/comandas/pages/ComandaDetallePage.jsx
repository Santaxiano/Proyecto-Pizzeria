import { Link, useParams } from 'react-router';
import './salonComandas.css';
import comandas from '../../../../../backend/data/pedidos.json';

export default function ComandaDetallePage() {
  const { comandaId } = useParams();
  const comandasAbiertas = comandaId === 'todas'
    ? comandas
    : comandas.filter((comanda) => comanda.id === comandaId);

  return (
    <section className="salon-comandas container py-4">
      <header className="vista-encabezado d-flex flex-column flex-md-row align-items-start align-items-md-end justify-content-between gap-3 mb-4">
        <div>
          <p className="vista-ceja">COMANDA ABIERTA</p>
          <h1>{comandaId === 'todas' ? 'Todos los pedidos' : 'Detalle de la comanda'}</h1>
          <p className="vista-descripcion">Detalle de las comandas abiertas</p>
        </div>
        <Link className="btn btn-outline-secondary" to="/gestor/comandas">Volver a comandas</Link>
      </header>

      {comandasAbiertas.map((comanda) => (
        <section className="card detalle-comanda mb-3" key={comanda.id}>
          <div className="card-header bg-white d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
            <div>
              <span className={`badge etiqueta-tipo-pedido ${comanda.tipo}`}>
                {comanda.tipo === 'salon' ? 'Salón' : 'Delivery'}
              </span>
              <h2 className="h5 mt-2 mb-0">{comanda.mesa || 'Pedido a domicilio'}</h2>
            </div>
            <span className="small text-secondary">{comanda.inicio}{comanda.personas ? ` · ${comanda.personas} personas` : ''}</span>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead>
                <tr><th scope="col">Producto</th><th className="text-end" scope="col">Cant.</th><th className="text-end" scope="col">Subtotal</th></tr>
              </thead>
              <tbody>
                {comanda.items.map((item) => (
                  <tr key={item.producto}>
                    <td>{item.producto}</td><td className="text-end">{item.cantidad}</td><td className="text-end">{item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><th colSpan="2" scope="row">Total</th><th className="text-end">{comanda.total}</th></tr>
              </tfoot>
            </table>
          </div>
        </section>
      ))}
    </section>
  );
}
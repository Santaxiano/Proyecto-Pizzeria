import { Link } from 'react-router';
import './salonComandas.css';
import comandas from '../../../../../backend/data/pedidos.json';

function TarjetaComanda({ comanda }) {
  return (
    <article className="col">
      <div className="card h-100 comanda-tarjeta">
        <div className="card-body d-flex flex-column">
          <div className="comanda-tarjeta-cabecera d-flex align-items-center justify-content-between gap-2 mb-3">
            <span className={`badge etiqueta-tipo-pedido ${comanda.tipo}`}>
              {comanda.tipo === 'salon' ? 'Salón' : 'Delivery'}
            </span>
            <span className="badge etiqueta-estado ocupada">{comanda.estado}</span>
          </div>
          <h2 className="card-title h5 mb-2">{comanda.mesa || 'Pedido a domicilio'}</h2>
          <p className="comanda-metadatos text-secondary mb-4">
            {comanda.inicio}{comanda.personas ? ` · ${comanda.personas} personas` : ''}
          </p>
          <div className="comanda-tarjeta-pie d-flex align-items-center justify-content-between gap-2 mt-auto pt-3 border-top">
            <strong>{comanda.total}</strong>
            <Link className="btn btn-outline-secondary btn-sm" to={`/gestor/comandas/${comanda.id}`}>
              Ver detalle
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ComandasPage() {
  return (
    <section className="salon-comandas container py-4">
      <header className="vista-encabezado d-flex flex-column flex-md-row align-items-start align-items-md-end justify-content-between gap-3 mb-4">
        <div>
          <p className="vista-ceja">OPERACIONES</p>
          <h1>Comanda</h1>
          <p className="vista-descripcion">Pedidos en curso en el salón</p>
        </div>
        <Link className="btn btn-success fw-bold" to="/gestor/comandas/todas">Abrir comanda</Link>
      </header>

      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3" aria-label="Comandas abiertas">
        {comandas.map((comanda) => <TarjetaComanda key={comanda.id} comanda={comanda} />)}
      </div>
    </section>
  );
}
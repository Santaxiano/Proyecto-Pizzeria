import { Link, useParams } from 'react-router';
import './salonComandas.css';

const comandasAbiertas = [
  { mesa: 'Mesa 2', inicio: '20:15', personas: 3, items: [['Pizza muzzarella', 2, '$ 12.000'], ['Gaseosa 1.5 L', 1, '$ 3.500'], ['Empanadas', 3, '$ 3.000']], total: '$ 18.500' },
  { mesa: 'Mesa 5', inicio: '20:40', personas: 5, items: [['Pizza napolitana', 2, '$ 16.000'], ['Pizza especial', 1, '$ 11.000'], ['Agua mineral', 2, '$ 5.800']], total: '$ 32.800' }
];

export default function ComandaDetallePage() {
  const { mesaId } = useParams();

  return (
    <section className="salon-comandas">
      <header className="vista-encabezado">
        <div>
          <p className="vista-ceja">COMANDA ABIERTA</p>
          <h1>{mesaId === 'todas' ? 'Todos los pedidos' : `Mesa ${mesaId}`}</h1>
          <p className="vista-descripcion">Detalle de las comandas abiertas del salón</p>
        </div>
        <Link className="accion-secundaria" to="/gestor/comandas">Volver a comandas</Link>
      </header>

      {comandasAbiertas.map((comanda) => (
        <section className="detalle-comanda" key={comanda.mesa}>
          <div className="detalle-mesa">
            <h2>{comanda.mesa}</h2>
            <span>{comanda.inicio} · {comanda.personas} personas</span>
          </div>
          <div className="detalle-titulos"><span>Producto</span><span>Cant.</span><span>Subtotal</span></div>
          {comanda.items.map(([producto, cantidad, subtotal]) => (
            <div className="detalle-fila" key={producto}>
              <span>{producto}</span><span>{cantidad}</span><strong>{subtotal}</strong>
            </div>
          ))}
          <div className="detalle-total"><span>Total</span><strong>{comanda.total}</strong></div>
        </section>
      ))}
    </section>
  );
}
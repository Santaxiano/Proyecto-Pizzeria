import { Link } from 'react-router';
import './salonComandas.css';

const comandas = [
  { mesaId: 'mesa-2', mesa: 'Mesa 2', inicio: '20:15', personas: 3, estado: 'En preparación', total: '$ 18.500' },
  { mesaId: 'mesa-5', mesa: 'Mesa 5', inicio: '20:40', personas: 5, estado: 'En preparación', total: '$ 32.800' }
];

export default function ComandasPage() {
  return (
    <section className="salon-comandas">
      <header className="vista-encabezado">
        <div>
          <p className="vista-ceja">OPERACIONES</p>
          <h1>Comandas abiertas</h1>
          <p className="vista-descripcion">Pedidos en curso en el salón</p>
        </div>
        <Link className="accion-principal" to="/gestor/comandas/todas">Abrir comanda</Link>
      </header>

      <div className="tabla-comandas" role="table" aria-label="Comandas abiertas">
        <div className="fila-comanda fila-comanda-titulos" role="row">
          <span role="columnheader">Mesa</span>
          <span role="columnheader">Inicio</span>
          <span role="columnheader">Personas</span>
          <span role="columnheader">Estado</span>
          <span role="columnheader">Total</span>
        </div>
        {comandas.map((comanda) => (
          <article className="fila-comanda" role="row" key={comanda.mesaId}>
            <strong role="cell">{comanda.mesa}</strong>
            <span role="cell">{comanda.inicio}</span>
            <span role="cell">{comanda.personas}</span>
            <span role="cell"><span className="etiqueta-estado ocupada">{comanda.estado}</span></span>
            <strong role="cell">{comanda.total}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
import { useState } from 'react';
import './ComandasPage.css';

const etapas = ['Recibido', 'En preparación', 'Listo/En camino', 'Entregado'];

const comandasEjemplo = [
  {
    id: 'P-104',
    destino: 'Mesa 2',
    hora: '20:14',
    tipo: 'Salón',
    productos: ['1x Margherita', '1x Fainá'],
    estado: 0
  },
  {
    id: 'P-105',
    destino: 'Mesa 5',
    hora: '20:18',
    tipo: 'Salón',
    productos: ['1x Napolitana', '2x Gaseosa'],
    estado: 1
  },
  {
    id: 'P-106',
    destino: 'Av. España 420',
    hora: '20:09',
    tipo: 'Envío',
    productos: ['1x Especial +Pizza', '1x Agua'],
    estado: 2
  },
  {
    id: 'P-107',
    destino: 'Belgrano 815',
    hora: '19:56',
    tipo: 'Envío',
    productos: ['2x Muzza'],
    estado: 3
  }
];

function ComandasPage() {
  const [comandas, setComandas] = useState(comandasEjemplo);

  const avanzarComanda = (id) => {
    setComandas((actuales) => actuales.map((comanda) => (
      comanda.id === id && comanda.estado < etapas.length - 1
        ? { ...comanda, estado: comanda.estado + 1 }
        : comanda
    )));
  };

  const renderComanda = (comanda) => (
    <article className="comanda-tarjeta" key={comanda.id}>
      <div className="comanda-cabecera">
        <span className="comanda-id">{comanda.id}</span>
        <span className="comanda-hora">{comanda.hora}</span>
      </div>
      <h3>{comanda.destino}</h3>
      <span className="comanda-tipo">{comanda.tipo}</span>
      <ul className="comanda-productos">
        {comanda.productos.map((producto) => <li key={producto}>{producto}</li>)}
      </ul>
      <div className="comanda-pie">
        <span className={`comanda-estado estado-${comanda.estado}`}>
          {etapas[comanda.estado]}
        </span>
        <button
          className="comanda-accion"
          type="button"
          onClick={() => avanzarComanda(comanda.id)}
          disabled={comanda.estado === etapas.length - 1}
        >
          {comanda.estado === etapas.length - 1 ? 'Entregado' : `Pasar a ${etapas[comanda.estado + 1]}`}
        </button>
      </div>
    </article>
  );

  const comandasCocina = comandas.filter((comanda) => comanda.estado < 2);
  const comandasEnvios = comandas.filter((comanda) => comanda.estado >= 2);

  return (
    <main className="comandas-pagina">
      <header className="comandas-encabezado">
        <div>
          <p className="comandas-ceja">OPERACIONES</p>
          <h1>Panel de comandas</h1>
        </div>
        <span className="comandas-conteo">{comandas.length} pedidos</span>
      </header>

      <div className="comandas-columnas">
        <section className="comandas-columna" aria-labelledby="titulo-cocina">
          <div className="comandas-columna-titulo">
            <h2 id="titulo-cocina">Cocina</h2>
            <span>{comandasCocina.length}</span>
          </div>
          <div className="comandas-lista">
            {comandasCocina.length > 0
              ? comandasCocina.map(renderComanda)
              : <p className="comandas-vacio">No hay pedidos pendientes en cocina.</p>}
          </div>
        </section>

        <section className="comandas-columna" aria-labelledby="titulo-envios">
          <div className="comandas-columna-titulo">
            <h2 id="titulo-envios">Envíos y entregas</h2>
            <span>{comandasEnvios.length}</span>
          </div>
          <div className="comandas-lista">
            {comandasEnvios.length > 0
              ? comandasEnvios.map(renderComanda)
              : <p className="comandas-vacio">Todavía no hay pedidos listos para salir.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

export default ComandasPage;
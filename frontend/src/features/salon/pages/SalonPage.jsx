import '../../comandas/pages/salonComandas.css';
import mesas from '../../../../../backend/data/mesas.json';

const estadoClase = {
  Libre: 'libre',
  Ocupada: 'ocupada',
  Reservada: 'reservada'
};

function TarjetaMesa({ mesa }) {
  const estadoCss = estadoClase[mesa.estado];

  return (
    <article className="col">
      <div className={`card h-100 mesa-item mesa-${estadoCss}`}>
        <div className="card-body">
          <div className="mesa-cabecera d-flex align-items-center justify-content-between">
            <span className="mesa-icono" aria-hidden="true">{String(mesa.id).padStart(2, '0')}</span>
            <span className={`badge etiqueta-estado ${estadoCss}`}>{mesa.estado}</span>
          </div>
          <h2 className="h5 mt-3 mb-1">Mesa {mesa.id}</h2>
          <p className="mesa-dato mb-1">
            {mesa.comensales ? `${mesa.comensales} comensales` : `Hasta ${mesa.capacidad} personas`}
          </p>
          <p className="mesa-hora mb-0">
            {mesa.estado === 'Ocupada' ? `Desde ${mesa.desde}` : mesa.estado === 'Reservada' ? `Reserva ${mesa.desde}` : 'Disponible'}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function SalonPage() {
  const resumen = mesas.reduce((conteo, mesa) => {
    conteo[mesa.estado] += 1;
    return conteo;
  }, { Libre: 0, Ocupada: 0, Reservada: 0 });

  return (
    <section className="salon-comandas container py-4">
      <header className="vista-encabezado d-flex flex-column flex-md-row align-items-start align-items-md-end justify-content-between gap-3 mb-4">
        <div>
          <p className="vista-ceja">OPERACIONES</p>
          <h1>Salón</h1>
          <p className="vista-descripcion">Distribución y disponibilidad de mesas</p>
        </div>
      </header>

      <div className="resumen-mesas d-flex flex-wrap gap-4 py-3 my-3 border-top border-bottom" aria-label="Resumen de mesas">
        <span className="d-inline-flex align-items-center gap-2"><i className="punto-estado libre" /> Libres <strong>{resumen.Libre}</strong></span>
        <span className="d-inline-flex align-items-center gap-2"><i className="punto-estado ocupada" /> Ocupadas <strong>{resumen.Ocupada}</strong></span>
        <span className="d-inline-flex align-items-center gap-2"><i className="punto-estado reservada" /> Reservadas <strong>{resumen.Reservada}</strong></span>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3">
        {mesas.map((mesa) => <TarjetaMesa key={mesa.id} mesa={mesa} />)}
      </div>
    </section>
  );
}
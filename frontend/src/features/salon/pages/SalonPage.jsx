import '../../comandas/pages/salonComandas.css';

const mesas = [
  { id: 1, estado: 'Libre', capacidad: 4 },
  { id: 2, estado: 'Ocupada', capacidad: 4, comensales: 3, desde: '20:15' },
  { id: 3, estado: 'Reservada', capacidad: 6, desde: '21:30' },
  { id: 4, estado: 'Libre', capacidad: 2 },
  { id: 5, estado: 'Ocupada', capacidad: 6, comensales: 5, desde: '20:40' },
  { id: 6, estado: 'Libre', capacidad: 4 },
  { id: 7, estado: 'Reservada', capacidad: 2, desde: '22:00' },
  { id: 8, estado: 'Libre', capacidad: 4 }
];

const estadoClase = {
  Libre: 'libre',
  Ocupada: 'ocupada',
  Reservada: 'reservada'
};

export default function SalonPage() {
  return (
    <section className="salon-comandas">
      <header className="vista-encabezado">
        <div>
          <p className="vista-ceja">OPERACIONES</p>
          <h1>Salón</h1>
          <p className="vista-descripcion">Distribución y disponibilidad de mesas</p>
        </div>
      </header>

      <div className="resumen-mesas" aria-label="Resumen de mesas">
        <span><i className="punto-estado libre" /> Libres <strong>4</strong></span>
        <span><i className="punto-estado ocupada" /> Ocupadas <strong>2</strong></span>
        <span><i className="punto-estado reservada" /> Reservadas <strong>2</strong></span>
      </div>

      <div className="rejilla-mesas">
        {mesas.map((mesa) => (
          <article className={`mesa-item mesa-${estadoClase[mesa.estado]}`} key={mesa.id}>
            <div className="mesa-cabecera">
              <span className="mesa-icono" aria-hidden="true">{String(mesa.id).padStart(2, '0')}</span>
              <span className={`etiqueta-estado ${estadoClase[mesa.estado]}`}>{mesa.estado}</span>
            </div>
            <h2>Mesa {mesa.id}</h2>
            <p className="mesa-dato">
              {mesa.comensales ? `${mesa.comensales} comensales` : `Hasta ${mesa.capacidad} personas`}
            </p>
            <p className="mesa-hora">
              {mesa.estado === 'Ocupada' ? `Desde ${mesa.desde}` : mesa.estado === 'Reservada' ? `Reserva ${mesa.desde}` : 'Disponible'}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
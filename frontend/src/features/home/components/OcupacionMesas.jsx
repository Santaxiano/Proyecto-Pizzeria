const ESTADOS = [
  { clave: 'libres', nombre: 'Libres', color: '#1baf7a' },
  { clave: 'ocupadas', nombre: 'Ocupadas', color: '#eb6834' },
  { clave: 'reservadas', nombre: 'Reservadas', color: '#2a78d6' },
];

export default function OcupacionMesas({ mesas }) {
  const ocupacion = mesas.total > 0 ? Math.round((mesas.ocupadas / mesas.total) * 100) : 0;

  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-header bg-white py-3">
        <h2 className="h5 fw-bold mb-0">Mesas ahora</h2>
        <p className="text-muted small mb-0">Estado actual (no depende del período).</p>
      </div>
      <div className="card-body">
        {mesas.total > 0 ? (
          <>
            <p className="mb-2">
              <span className="h3 fw-bold">{ocupacion}%</span>
              <span className="text-secondary small"> ocupado · {mesas.total} mesas</span>
            </p>

            <div className="progress-stacked mb-3" style={{ height: 14 }}>
              {ESTADOS.filter((e) => mesas[e.clave] > 0).map((estado) => (
                <div
                  key={estado.clave}
                  className="progress"
                  role="progressbar"
                  aria-label={`${estado.nombre}: ${mesas[estado.clave]}`}
                  aria-valuenow={mesas[estado.clave]}
                  aria-valuemin={0}
                  aria-valuemax={mesas.total}
                  style={{ width: `${(mesas[estado.clave] / mesas.total) * 100}%`, height: 14 }}
                >
                  <div className="progress-bar" style={{ backgroundColor: estado.color, borderRight: '2px solid #fff' }} />
                </div>
              ))}
            </div>

            <ul className="list-unstyled mb-0">
              {ESTADOS.map((estado) => (
                <li key={estado.clave} className="d-flex align-items-center gap-2 py-1 small">
                  <span
                    aria-hidden="true"
                    className="rounded-circle flex-shrink-0"
                    style={{ width: 10, height: 10, backgroundColor: estado.color }}
                  />
                  <span className="flex-grow-1">{estado.nombre}</span>
                  <strong>{mesas[estado.clave]}</strong>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="text-center text-muted py-4">No hay mesas cargadas.</div>
        )}
      </div>
    </div>
  );
}

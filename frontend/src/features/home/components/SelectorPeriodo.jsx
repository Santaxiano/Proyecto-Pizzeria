import { fechaLocal } from '../hooks/useEstadisticas';

const OPCIONES = [
  { tipo: 'hoy', etiqueta: 'Hoy' },
  { tipo: '7dias', etiqueta: '7 días' },
  { tipo: '30dias', etiqueta: '30 días' },
];

export default function SelectorPeriodo({ periodo, onCambiar, deshabilitado }) {
  const hoy = fechaLocal();

  return (
    <div className="d-flex flex-wrap align-items-center gap-2" role="group" aria-label="Período de las estadísticas">
      <div className="btn-group" role="group">
        {OPCIONES.map((opcion) => (
          <button
            key={opcion.tipo}
            type="button"
            className={`btn btn-sm ${periodo.tipo === opcion.tipo ? 'btn-dark' : 'btn-outline-dark'}`}
            aria-pressed={periodo.tipo === opcion.tipo}
            onClick={() => onCambiar({ ...periodo, tipo: opcion.tipo })}
            disabled={deshabilitado}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      <label className="d-flex align-items-center gap-2 mb-0 small fw-semibold">
        <span className="text-nowrap">📅 Día:</span>
        <input
          type="date"
          className={`form-control form-control-sm ${periodo.tipo === 'fecha' ? 'border-dark border-2' : ''}`}
          value={periodo.tipo === 'fecha' ? periodo.fecha : ''}
          max={hoy}
          onChange={(e) => e.target.value && onCambiar({ tipo: 'fecha', fecha: e.target.value })}
          disabled={deshabilitado}
          aria-label="Elegir un día puntual"
        />
      </label>
    </div>
  );
}

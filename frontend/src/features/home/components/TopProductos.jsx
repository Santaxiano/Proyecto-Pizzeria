import { formatearPrecio } from '../../../shared/utils/formato';

export default function TopProductos({ productos }) {
  const maximo = Math.max(...productos.map((p) => p.cantidad), 1);

  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-header bg-white py-3">
        <h2 className="h5 fw-bold mb-0">Top 5 productos</h2>
      </div>
      <div className="card-body">
        {productos.length > 0 ? (
          <ol className="list-unstyled mb-0 d-grid gap-3">
            {productos.map((producto, i) => (
              <li key={producto.id}>
                <div className="d-flex justify-content-between small mb-1 gap-2">
                  <span className="fw-semibold text-truncate">{i + 1}. {producto.nombre}</span>
                  <span className="text-nowrap">
                    <strong>{producto.cantidad} u.</strong>
                    <span className="text-secondary"> · {formatearPrecio(producto.ventas)}</span>
                  </span>
                </div>
                <div
                  className="progress"
                  style={{ height: 8 }}
                  role="progressbar"
                  aria-label={`${producto.nombre}: ${producto.cantidad} unidades`}
                  aria-valuenow={producto.cantidad}
                  aria-valuemin={0}
                  aria-valuemax={maximo}
                >
                  <div
                    className="progress-bar rounded"
                    style={{ width: `${(producto.cantidad / maximo) * 100}%`, backgroundColor: '#2a78d6' }}
                  />
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-center text-muted py-5">Todavía no se vendieron productos en este período.</div>
        )}
      </div>
    </div>
  );
}

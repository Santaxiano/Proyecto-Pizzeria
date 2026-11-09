import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatearPrecio } from '../../../shared/utils/formato';

// Cada tipo tiene siempre el mismo color (no depende del orden ni de cuántos haya)
const TIPOS = {
  delivery: { nombre: 'Delivery', color: '#2a78d6', icono: '🛵' },
  retiro: { nombre: 'Retiro en local', color: '#eb6834', icono: '🏪' },
  mesa: { nombre: 'Mesa', color: '#1baf7a', icono: '🍽️' },
};

function TooltipTipo({ active, payload }) {
  if (!active || !payload?.length) return null;
  const dato = payload[0].payload;
  return (
    <div className="bg-white border rounded shadow-sm px-3 py-2 small">
      <div className="fw-bold">{TIPOS[dato.tipo].nombre}</div>
      <div>{dato.cantidad} {dato.cantidad === 1 ? 'pedido' : 'pedidos'}</div>
      <div className="text-secondary">{formatearPrecio(dato.ventas)}</div>
    </div>
  );
}

export default function GraficoTiposPedido({ porTipo }) {
  const total = porTipo.reduce((suma, t) => suma + t.cantidad, 0);
  const conPedidos = porTipo.filter((t) => t.cantidad > 0);

  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-header bg-white py-3">
        <h2 className="h5 fw-bold mb-0">Pedidos por tipo</h2>
      </div>
      <div className="card-body">
        {total > 0 ? (
          <>
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={conPedidos}
                    dataKey="cantidad"
                    nameKey="tipo"
                    innerRadius="60%"
                    outerRadius="95%"
                    stroke="#ffffff"
                    strokeWidth={2}
                    isAnimationActive={false}
                  >
                    {conPedidos.map((t) => <Cell key={t.tipo} fill={TIPOS[t.tipo].color} />)}
                  </Pie>
                  <Tooltip content={<TooltipTipo />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Leyenda con valores: el color nunca es la única pista */}
            <ul className="list-unstyled mb-0 mt-3">
              {porTipo.map((t) => (
                <li key={t.tipo} className="d-flex align-items-center gap-2 py-1 small">
                  <span
                    aria-hidden="true"
                    className="rounded-circle flex-shrink-0"
                    style={{ width: 10, height: 10, backgroundColor: TIPOS[t.tipo].color }}
                  />
                  <span className="flex-grow-1">{TIPOS[t.tipo].icono} {TIPOS[t.tipo].nombre}</span>
                  <strong>{t.cantidad}</strong>
                  <span className="text-secondary" style={{ minWidth: '3rem', textAlign: 'right' }}>
                    {Math.round((t.cantidad / total) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="text-center text-muted py-5">Sin pedidos en este período.</div>
        )}
      </div>
    </div>
  );
}

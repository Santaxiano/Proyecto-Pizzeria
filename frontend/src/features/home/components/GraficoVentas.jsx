import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatearPrecio } from '../../../shared/utils/formato';

const COLOR_BARRA = '#2a78d6';
const COLOR_EJES = '#52514e';
const COLOR_GRILLA = '#e6e5e0';

const formatoCompacto = new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 });

// "2026-11-08" -> "08/11"
const etiquetaDia = (texto) => `${texto.slice(8, 10)}/${texto.slice(5, 7)}`;

function TooltipVentas({ active, payload, agrupadoPor }) {
  if (!active || !payload?.length) return null;
  const punto = payload[0].payload;
  const titulo = agrupadoPor === 'hora' ? `${punto.etiqueta} hs` : etiquetaDia(punto.etiqueta);

  return (
    <div className="bg-white border rounded shadow-sm px-3 py-2 small">
      <div className="fw-bold mb-1">{titulo}</div>
      <div>Ventas: <strong>{formatearPrecio(punto.ventas)}</strong></div>
      <div className="text-secondary">{punto.pedidos} {punto.pedidos === 1 ? 'pedido' : 'pedidos'}</div>
    </div>
  );
}

export default function GraficoVentas({ serie, agrupadoPor }) {
  const hayVentas = serie.some((punto) => punto.ventas > 0);
  const titulo = agrupadoPor === 'hora' ? 'Ventas por hora' : 'Ventas por día';

  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-header bg-white py-3">
        <h2 className="h5 fw-bold mb-0">{titulo}</h2>
      </div>
      <div className="card-body">
        {hayVentas ? (
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={serie} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap={2}>
                <CartesianGrid vertical={false} stroke={COLOR_GRILLA} />
                <XAxis
                  dataKey="etiqueta"
                  tickFormatter={agrupadoPor === 'hora' ? (h) => h.slice(0, 2) : etiquetaDia}
                  tick={{ fill: COLOR_EJES, fontSize: 12 }}
                  axisLine={{ stroke: COLOR_GRILLA }}
                  tickLine={false}
                  minTickGap={12}
                />
                <YAxis
                  tickFormatter={(v) => `$${formatoCompacto.format(v)}`}
                  tick={{ fill: COLOR_EJES, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip content={<TooltipVentas agrupadoPor={agrupadoPor} />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <Bar dataKey="ventas" name="Ventas" fill={COLOR_BARRA} radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-muted py-5">No hubo ventas en este período.</div>
        )}
      </div>
    </div>
  );
}

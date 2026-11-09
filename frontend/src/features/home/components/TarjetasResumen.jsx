import { formatearPrecio } from '../../../shared/utils/formato';

export default function TarjetasResumen({ estadisticas }) {
  const { pedidos, reservas } = estadisticas;

  const tarjetas = [
    {
      titulo: 'Ventas',
      valor: formatearPrecio(pedidos.ventas),
      detalle: 'Total facturado en el período.',
      color: 'success',
      icono: '💰',
    },
    {
      titulo: 'Pedidos',
      valor: pedidos.cantidad,
      detalle: 'Pedidos registrados en el período.',
      color: 'danger',
      icono: '📋',
    },
    {
      titulo: 'Ticket promedio',
      valor: formatearPrecio(pedidos.ticketPromedio),
      detalle: 'Lo que gasta en promedio cada pedido.',
      color: 'dark',
      icono: '🎟️',
    },
    {
      titulo: 'Reservas',
      valor: reservas.cantidad,
      detalle: `${reservas.comensales} comensales en total.`,
      color: 'primary',
      icono: '📅',
    },
  ];

  return (
    <section aria-label="Resumen del período" className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">
      {tarjetas.map((tarjeta) => (
        <div className="col" key={tarjeta.titulo}>
          <article className={`card h-100 border-0 border-start border-4 border-${tarjeta.color} shadow-sm`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <span className="text-muted small fw-bold text-uppercase">{tarjeta.titulo}</span>
                <span aria-hidden="true" className="fs-4">{tarjeta.icono}</span>
              </div>
              <p className="h2 fw-bold my-3" style={{ color: 'var(--color-negro)' }}>{tarjeta.valor}</p>
              <p className="text-secondary small mb-0">{tarjeta.detalle}</p>
            </div>
          </article>
        </div>
      ))}
    </section>
  );
}

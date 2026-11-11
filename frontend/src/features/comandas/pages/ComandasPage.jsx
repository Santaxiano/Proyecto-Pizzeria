import { useMemo, useState } from 'react';
import { useComandas } from '../hooks/useComandas';
import FormularioComanda from '../components/FormularioComanda';
import TarjetaComanda from '../components/TarjetaComanda';
import ModalConfirmacion from '../components/ModalConfirmacion';
import { fechaLocalHoy, fechaLocalISO } from '../../../shared/utils/fecha';

const formatoFechaFiltro = new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' });

export default function ComandasPage() {
  const { comandas, cargando, error, agregarComanda, eliminarComanda, cambiarEstado } = useComandas();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [alertaEliminar, setAlertaEliminar] = useState(null); // Estado para controlar el modal de borrado
  const [fechaFiltro, setFechaFiltro] = useState(fechaLocalHoy());

  // Filtra por el día LOCAL de creado_en (la base lo guarda en UTC) y deja las
  // finalizadas al fondo. Dentro de cada grupo, la comanda más nueva va primero.
  const comandasDelDia = useMemo(() => {
    const filtradas = fechaFiltro
      ? comandas.filter((comanda) => fechaLocalISO(comanda.creado_en) === fechaFiltro)
      : comandas;

    return [...filtradas].sort((a, b) => {
      const finalizadaA = a.estado === 'Finalizada' ? 1 : 0;
      const finalizadaB = b.estado === 'Finalizada' ? 1 : 0;
      if (finalizadaA !== finalizadaB) return finalizadaA - finalizadaB;
      return b.id - a.id;
    });
  }, [comandas, fechaFiltro]);

  const fechaLegible = fechaFiltro
    ? formatoFechaFiltro.format(new Date(`${fechaFiltro}T00:00:00`))
    : null;

  // El backend no permite editar un pedido completo (solo su estado), por eso el formulario solo crea.
  // Si falla (ej. un producto sin disponibilidad) el formulario queda abierto para corregirlo.
  const handleGuardar = async (datosFormulario) => {
    const guardado = await agregarComanda(datosFormulario);
    if (guardado) setMostrarFormulario(false);
  };

  const confirmarPorWpp = (comanda) => {
    const numeroLimpio = (comanda.telefono || '').replace(/\D/g, '');
    if (!numeroLimpio) return; // sin teléfono no se puede avisar por WhatsApp

    const mensaje = `¡Hola ${comanda.cliente}! Confirmamos tu pedido en +PIZZA 🍕.\n\n*Detalle:* ${comanda.detalle}\n*Total:* $${comanda.total}\n\nYa lo estamos preparando. ¡Gracias por elegirnos!`;
    const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  if (cargando) return <div className="text-center py-5"><div className="spinner-border text-danger" /></div>;
  if (error) return <div className="alert alert-danger text-center m-4">{error.message}</div>;

  return (
    <div className="container py-4">
      <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 border-bottom pb-3">
        <div>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--color-negro)' }}>Gestión de Pedidos</h1>
          <p className="text-muted mb-0">Administrá comandas de delivery, retiro y mesas.</p>
        </div>

        <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-end gap-2 mt-3 mt-md-0">
          <div>
            <label htmlFor="fechaFiltroComandas" className="form-label small fw-semibold text-muted mb-1">
              Fecha de creación
            </label>
            <input
              id="fechaFiltroComandas"
              type="date"
              className="form-control"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary fw-semibold"
            onClick={() => setFechaFiltro(fechaLocalHoy())}
          >
            Hoy
          </button>
          {!mostrarFormulario && (
            <button className="btn btn-dark fw-bold" onClick={() => setMostrarFormulario(true)}>
              + Nuevo Pedido
            </button>
          )}
        </div>
      </header>

      {mostrarFormulario && (
        <FormularioComanda
          onGuardar={handleGuardar}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR COMANDA */}
      {alertaEliminar && (
        <ModalConfirmacion 
          titulo={alertaEliminar.titulo}
          mensaje={alertaEliminar.mensaje}
          onCancelar={() => setAlertaEliminar(null)}
          onConfirmar={() => {
            eliminarComanda(alertaEliminar.id);
            setAlertaEliminar(null);
          }}
        />
      )}

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
        <p className="text-muted small mb-0">
          {fechaLegible
            ? `${comandasDelDia.length} comanda${comandasDelDia.length === 1 ? '' : 's'} del ${fechaLegible}`
            : `${comandasDelDia.length} comanda${comandasDelDia.length === 1 ? '' : 's'} de todas las fechas`}
        </p>
        {fechaFiltro && (
          <button
            type="button"
            className="btn btn-link btn-sm text-decoration-none p-0"
            onClick={() => setFechaFiltro('')}
          >
            Ver todas las fechas
          </button>
        )}
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
        {comandasDelDia.map((comanda) => (
          <TarjetaComanda 
            key={comanda.id} 
            comanda={comanda}
            onEliminar={() => setAlertaEliminar({
              id: comanda.id,
              titulo: `¿Eliminar pedido de ${comanda.cliente}?`,
              mensaje: 'Esta acción borrará la comanda de forma permanente y no se podrá recuperar.'
            })}
            onConfirmarWpp={() => confirmarPorWpp(comanda)}
            onCambiarEstado={(nuevoEstado) => cambiarEstado(comanda.id, nuevoEstado)}
          />
        ))}
        {comandasDelDia.length === 0 && !mostrarFormulario && (
          <div className="col-12 text-center text-muted mt-5">
            {fechaLegible
              ? `No hay pedidos creados el ${fechaLegible}.`
              : 'No hay pedidos registrados.'}
          </div>
        )}
      </div>
    </div>
  );
}

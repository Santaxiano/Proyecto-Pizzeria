import { useState } from 'react';
import { useComandas } from '../hooks/useComandas';
import FormularioComanda from '../components/FormularioComanda';
import TarjetaComanda from '../components/TarjetaComanda'; 
import ModalConfirmacion from '../components/ModalConfirmacion'; // 👈 Importamos el modal

export default function ComandasPage() {
  const { comandas, cargando, error, agregarComanda, modificarComanda, eliminarComanda, cambiarEstado } = useComandas();
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [comandaEnEdicion, setComandaEnEdicion] = useState(null);
  const [alertaEliminar, setAlertaEliminar] = useState(null); // Estado para controlar el modal de borrado

  const handleGuardar = (datosFormulario) => {
    if (comandaEnEdicion) {
      modificarComanda(comandaEnEdicion.id, datosFormulario);
    } else {
      agregarComanda(datosFormulario);
    }
    setMostrarFormulario(false);
    setComandaEnEdicion(null);
  };

  const confirmarPorWpp = (comanda) => {
    const numeroLimpio = comanda.telefono.replace(/\D/g, ''); 
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
        {!mostrarFormulario && (
          <button className="btn btn-dark fw-bold mt-3 mt-md-0" onClick={() => setMostrarFormulario(true)}>
            + Nuevo Pedido
          </button>
        )}
      </header>

      {mostrarFormulario && (
        <FormularioComanda 
          comandaAEditar={comandaEnEdicion} 
          onGuardar={handleGuardar} 
          onCancelar={() => {
            setMostrarFormulario(false);
            setComandaEnEdicion(null);
          }} 
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

      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
        {comandas.map((comanda) => (
          <TarjetaComanda 
            key={comanda.id} 
            comanda={comanda} 
            onEditar={() => {
              setComandaEnEdicion(comanda);
              setMostrarFormulario(true);
            }}
            onEliminar={() => setAlertaEliminar({
              id: comanda.id,
              titulo: `¿Eliminar pedido de ${comanda.cliente}?`,
              mensaje: 'Esta acción borrará la comanda de forma permanente y no se podrá recuperar.'
            })}
            onConfirmarWpp={() => confirmarPorWpp(comanda)}
            onCambiarEstado={(nuevoEstado) => cambiarEstado(comanda.id, nuevoEstado)}
          />
        ))}
        {comandas.length === 0 && !mostrarFormulario && (
          <div className="col-12 text-center text-muted mt-5">No hay pedidos registrados.</div>
        )}
      </div>
    </div>
  );
}
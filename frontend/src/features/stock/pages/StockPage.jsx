import { useState } from 'react';
import { useStock } from '../hooks/useStock';
import TablaProductos from '../components/TablaProductos';
import TablaMateriaPrima from '../components/TablaMateriaPrima';
import ModalFormularioStock from '../components/ModalFormularioStock';
import ModalConfirmacion from '../components/ModalConfirmacion';

export default function StockPage() {
  const { 
    ingredientes, productos,
    toggleIngrediente, toggleProducto,
    guardarProducto, eliminarProducto,
    guardarIngrediente, eliminarIngrediente,
    productosAfectados,
    cargando, error
  } = useStock();

  const [tabActiva, setTabActiva] = useState('productos');
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [tipoForm, setTipoForm] = useState('producto'); // 'producto' o 'ingrediente'
  const [itemAEditar, setItemAEditar] = useState(null);
  // Acción pendiente de confirmar: eliminar producto/ingrediente o dejar un ingrediente sin stock
  const [alertaConfirmacion, setAlertaConfirmacion] = useState(null);

  if (cargando) return <div className="text-center py-5"><div className="spinner-border text-danger" /></div>;
  if (error) return <div className="alert alert-danger m-4 text-center">{error.message}</div>;

  const abrirCreacion = (tipo) => {
    setTipoForm(tipo);
    // Si es producto, le inyectamos los ingredientes seleccionados actuales si editamos
    if (tipo === 'producto') {
      setItemAEditar({ nombre: '', descripcion: '', precio: '', categoria: 'pizzas', ingredientesIds: [] });
    } else {
      setItemAEditar({ nombre: '' });
    }
    setModalFormAbierto(true);
  };

  const abrirEdicionProducto = (prod) => {
    setTipoForm('producto');
    const ingAsociados = (prod.ingredientes || []).map(i => i.id);
    setItemAEditar({ ...prod, ingredientesIds: ingAsociados });
    setModalFormAbierto(true);
  };

  const abrirEdicionIngrediente = (ing) => {
    setTipoForm('ingrediente');
    setItemAEditar(ing);
    setModalFormAbierto(true);
  };

  // Efecto dominó: antes de dejar un ingrediente sin stock, avisamos qué productos se pausan.
  // Reponerlo no necesita confirmación.
  const pedirToggleIngrediente = async (id) => {
    const ing = ingredientes.find(i => i.id === id);
    if (!ing) return;
    if (!ing.activo) return toggleIngrediente(id);

    const afectados = await productosAfectados(id);
    if (afectados === null) return;
    if (afectados.length === 0) return toggleIngrediente(id);

    setAlertaConfirmacion({
      tipo: 'toggleIngrediente',
      id,
      titulo: `¿Dejar sin stock "${ing.nombre}"?`,
      mensaje: `Estos productos van a quedar pausados: ${afectados.map(p => p.nombre).join(', ')}.`
    });
  };

  return (
    <div className="container py-4">
      <header className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <div>
          <h1 className="h3 fw-bold text-dark">Control de Menú e Insumos</h1>
          <p className="text-muted mb-0">Administrá productos, materia prima y el efecto dominó en cadena.</p>
        </div>
        <div>
          <button className="btn btn-dark fw-bold" onClick={() => abrirCreacion(tabActiva === 'productos' ? 'producto' : 'ingrediente')}>
            {tabActiva === 'productos' ? '+ Nuevo Producto' : '+ Nuevo Ingrediente'}
          </button>
        </div>
      </header>

      {/* MODAL FORMULARIO */}
      {modalFormAbierto && (
        <ModalFormularioStock 
          tipo={tipoForm}
          itemAEditar={itemAEditar}
          listaIngredientesDisponibles={ingredientes}
          onGuardar={(valores) => {
            if (tipoForm === 'producto') {
              // El formulario solo trae algunos campos: el resto (imagen, stock, destacado...)
              // se toma del producto original para no pisarlo al editar.
              guardarProducto({ ...itemAEditar, ...valores }, itemAEditar?.id);
            } else {
              guardarIngrediente(valores, itemAEditar?.id);
            }
            setModalFormAbierto(false);
          }}
          onCancelar={() => setModalFormAbierto(false)}
        />
      )}

      {/* MODAL CONFIRMACIÓN (eliminar / dejar ingrediente sin stock) */}
      {alertaConfirmacion && (
        <ModalConfirmacion
          titulo={alertaConfirmacion.titulo}
          mensaje={alertaConfirmacion.mensaje}
          onCancelar={() => setAlertaConfirmacion(null)}
          onConfirmar={() => {
            if (alertaConfirmacion.tipo === 'producto') eliminarProducto(alertaConfirmacion.id);
            if (alertaConfirmacion.tipo === 'ingrediente') eliminarIngrediente(alertaConfirmacion.id);
            if (alertaConfirmacion.tipo === 'toggleIngrediente') toggleIngrediente(alertaConfirmacion.id);
            setAlertaConfirmacion(null);
          }}
        />
      )}

      {/* PESTAÑAS */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${tabActiva === 'productos' ? 'active fw-bold text-danger' : 'text-dark'}`} onClick={() => setTabActiva('productos')}>
            🍕 Menú Final y Bebidas
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tabActiva === 'ingredientes' ? 'active fw-bold text-danger' : 'text-dark'}`} onClick={() => setTabActiva('ingredientes')}>
            🍅 Materia Prima
          </button>
        </li>
      </ul>

      {/* TABLAS */}
      {tabActiva === 'productos' ? (
        <TablaProductos 
          productos={productos} 
          onToggle={toggleProducto}
          onEditar={abrirEdicionProducto}
          onEliminar={(id) => setAlertaConfirmacion({
            tipo: 'producto',
            id,
            titulo: '¿Eliminar producto?',
            mensaje: 'Se borrará este ítem del menú de forma permanente.'
          })}
        />
      ) : (
        <TablaMateriaPrima 
          ingredientes={ingredientes} 
          onToggle={pedirToggleIngrediente}
          onEditar={abrirEdicionIngrediente}
          onEliminar={(id) => setAlertaConfirmacion({
            tipo: 'ingrediente',
            id,
            titulo: '¿Eliminar ingrediente?',
            mensaje: 'Se borrará este insumo de forma permanente. Si algún producto lo usa no se podrá eliminar; en ese caso desactivalo.'
          })}
        />
      )}
    </div>
  );
}
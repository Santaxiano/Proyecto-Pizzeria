import { useState } from 'react';
import { useStock } from '../hooks/useStock';
import TablaProductos from '../components/TablaProductos';
import TablaMateriaPrima from '../components/TablaMateriaPrima';
import ModalFormularioStock from '../components/ModalFormularioStock';
import ModalConfirmacion from '../components/ModalConfirmacion';

export default function StockPage() {
  const { 
    ingredientes, productos, relaciones, 
    toggleIngrediente, toggleProducto, 
    guardarProducto, eliminarProducto, 
    guardarIngrediente, eliminarIngrediente, 
    cargando, error 
  } = useStock();
  
  const [tabActiva, setTabActiva] = useState('productos');
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [tipoForm, setTipoForm] = useState('producto'); // 'producto' o 'ingrediente'
  const [itemAEditar, setItemAEditar] = useState(null);
  const [alertaEliminar, setAlertaEliminar] = useState(null);

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
    const ingAsociados = relaciones.filter(r => r.producto_id === prod.id).map(r => r.ingrediente_id);
    setItemAEditar({ ...prod, ingredientesIds: ingAsociados });
    setModalFormAbierto(true);
  };

  const abrirEdicionIngrediente = (ing) => {
    setTipoForm('ingrediente');
    setItemAEditar(ing);
    setModalFormAbierto(true);
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
              guardarProducto(valores, itemAEditar?.id);
            } else {
              guardarIngrediente(valores, itemAEditar?.id);
            }
            setModalFormAbierto(false);
          }}
          onCancelar={() => setModalFormAbierto(false)}
        />
      )}

      {/* MODAL CONFIRMACIÓN ELIMINAR */}
      {alertaEliminar && (
        <ModalConfirmacion 
          titulo={alertaEliminar.titulo}
          mensaje={alertaEliminar.mensaje}
          onCancelar={() => setAlertaEliminar(null)}
          onConfirmar={() => {
            if (alertaEliminar.tipo === 'producto') eliminarProducto(alertaEliminar.id);
            if (alertaEliminar.tipo === 'ingrediente') eliminarIngrediente(alertaEliminar.id);
            setAlertaEliminar(null);
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
          onEliminar={(id) => setAlertaEliminar({
            tipo: 'producto',
            id,
            titulo: '¿Eliminar producto?',
            mensaje: 'Se borrará este ítem del menú de forma permanente.'
          })}
        />
      ) : (
        <TablaMateriaPrima 
          ingredientes={ingredientes} 
          onToggle={toggleIngrediente}
          onEditar={abrirEdicionIngrediente}
          onEliminar={(id) => setAlertaEliminar({
            tipo: 'ingrediente',
            id,
            titulo: '¿Eliminar ingrediente?',
            mensaje: 'Se borrará este insumo y se desvinculará de las recetas afectadas.'
          })}
        />
      )}
    </div>
  );
}
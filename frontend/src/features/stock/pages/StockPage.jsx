import { useState, useMemo } from 'react';
import { useStock } from '../hooks/useStock';
import TablaProductos from '../components/TablaProductos';
import TablaMateriaPrima from '../components/TablaMateriaPrima';
import ModalFormularioStock from '../components/ModalFormularioStock';
import ModalConfirmacion from '../components/ModalConfirmacion';

const normalizarTexto = (texto) => {
  if (!texto) return '';
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

// Genera un token estricto (sin NINGÚN espacio)
const crearTokenEstricto = (texto) => {
  return normalizarTexto(texto).replace(/\s+/g, "");
};

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
  const [tipoForm, setTipoForm] = useState('producto'); 
  const [itemAEditar, setItemAEditar] = useState(null);
  const [alertaConfirmacion, setAlertaConfirmacion] = useState(null);
  const [busquedaTabla, setBusquedaTabla] = useState('');

  const abrirCreacion = (tipo) => {
    setTipoForm(tipo);
    if (tipo === 'producto') {
      setItemAEditar({ nombre: '', descripcion: '', categoria: 'pizzas', imagen: '', ingredientesIds: [], variantes: [{ nombre: '', precio: '' }] });
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

  const productosFiltrados = useMemo(() => {
    // Al buscar usamos normalizarTexto (que mantiene espacios simples) para que puedan buscar "Pizza de jamon"
    const busquedaNormalizada = normalizarTexto(busquedaTabla);
    return productos.filter(p => normalizarTexto(p.nombre).includes(busquedaNormalizada));
  }, [productos, busquedaTabla]);

  const ingredientesFiltrados = useMemo(() => {
    const busquedaNormalizada = normalizarTexto(busquedaTabla);
    return ingredientes.filter(i => normalizarTexto(i.nombre).includes(busquedaNormalizada));
  }, [ingredientes, busquedaTabla]);

  // Lista de tokens estrictos (sin NINGÚN espacio) para evitar duplicados en el Modal
  const listaActualTokens = tipoForm === 'producto'
    ? productos.map(p => crearTokenEstricto(p.nombre))
    : ingredientes.map(i => crearTokenEstricto(i.nombre));

  if (cargando) return <div className="text-center py-5"><div className="spinner-border text-danger" /></div>;
  if (error) return <div className="alert alert-danger m-4 text-center">{error.message}</div>;

  return (
    <div className="container py-4">
      <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 border-bottom pb-3">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">Control de Menú e Insumos</h1>
          <p className="text-muted mb-0">Administrá productos, materia prima y el efecto dominó en cadena.</p>
        </div>
        <div className="mt-3 mt-md-0 d-flex gap-2">
          <div className="input-group">
            <span className="input-group-text bg-white">🔍</span>
            <input 
              type="text" 
              className="form-control" 
              placeholder={`Buscar ${tabActiva}...`} 
              value={busquedaTabla}
              onChange={(e) => setBusquedaTabla(e.target.value)}
            />
          </div>
          <button className="btn btn-dark fw-bold text-nowrap" onClick={() => abrirCreacion(tabActiva === 'productos' ? 'producto' : 'ingrediente')}>
            {tabActiva === 'productos' ? '+ Nuevo Producto' : '+ Nuevo Ingrediente'}
          </button>
        </div>
      </header>

      {modalFormAbierto && (
        <ModalFormularioStock 
          key={itemAEditar?.id ?? `nuevo-${tipoForm}`}
          tipo={tipoForm}
          itemAEditar={itemAEditar}
          listaIngredientesDisponibles={ingredientes}
          listaActualNombres={listaActualTokens} // Pasamos la lista estricta
          onGuardar={(valores) => {
            if (tipoForm === 'producto') {
              guardarProducto({ ...itemAEditar, ...valores }, itemAEditar?.id);
            } else {
              guardarIngrediente(valores, itemAEditar?.id);
            }
            setModalFormAbierto(false);
          }}
          onCancelar={() => setModalFormAbierto(false)}
        />
      )}

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

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${tabActiva === 'productos' ? 'active fw-bold text-danger' : 'text-dark'}`} onClick={() => { setTabActiva('productos'); setBusquedaTabla(''); }}>
            🍕 Menú Final y Bebidas
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tabActiva === 'ingredientes' ? 'active fw-bold text-danger' : 'text-dark'}`} onClick={() => { setTabActiva('ingredientes'); setBusquedaTabla(''); }}>
            🍅 Materia Prima
          </button>
        </li>
      </ul>

      {tabActiva === 'productos' ? (
        <TablaProductos 
          productos={productosFiltrados} 
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
          ingredientes={ingredientesFiltrados} 
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
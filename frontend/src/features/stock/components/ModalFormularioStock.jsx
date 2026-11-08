import { useState, useEffect, useMemo } from 'react';
import SelectorImagen from './SelectorImagen';

// Quita acentos, minúsculas y elimina espacios extras en los extremos
const normalizarTexto = (texto) => {
  if (!texto) return '';
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

// Genera un token estricto (sin NINGÚN espacio) para evitar que "Pizza de Jamón" y "Pizza  de jamón  " pasen como distintas
const crearTokenEstricto = (texto) => {
  return normalizarTexto(texto).replace(/\s+/g, "");
};

export default function ModalFormularioStock({ 
  tipo, 
  itemAEditar, 
  listaIngredientesDisponibles, 
  listaActualNombres, // Esta lista ahora debe contener los tokens estrictos
  onGuardar, 
  onCancelar 
}) {
  const [valores, setValores] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: 'pizzas',
    imagen: '', 
    ingredientesIds: []
  });

  const [archivoImagen, setArchivoImagen] = useState(null);
  const [busquedaIngrediente, setBusquedaIngrediente] = useState('');
  const [errorNombre, setErrorNombre] = useState('');

  useEffect(() => {
    if (itemAEditar) {
      setValores({
        nombre: itemAEditar.nombre || '',
        descripcion: itemAEditar.descripcion || '',
        precio: itemAEditar.precio || '',
        categoria: itemAEditar.categoria || 'pizzas',
        imagen: itemAEditar.imagen || '',
        ingredientesIds: itemAEditar.ingredientesIds || []
      });
    }
  }, [itemAEditar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Forzamos a que no puedan empezar el nombre con un espacio
    const valorLimpio = name === 'nombre' && value.startsWith(' ') ? value.trimStart() : value;
    
    setValores({ ...valores, [name]: valorLimpio });
    
    // Validación estricta en tiempo real (sin acentos, sin mayúsculas, sin espacios extra)
    if (name === 'nombre') {
      const tokenIngresado = crearTokenEstricto(valorLimpio);
      const esMismoItem = itemAEditar && crearTokenEstricto(itemAEditar.nombre) === tokenIngresado;
      
      // Chequeamos contra la lista estricta
      if (!esMismoItem && listaActualNombres.includes(tokenIngresado)) {
        setErrorNombre(`Ya existe un ${tipo} con este nombre.`);
      } else {
        setErrorNombre('');
      }
    }
  };

  const handleCheckboxIngrediente = (ingId) => {
    const actuales = valores.ingredientesIds;
    if (actuales.includes(ingId)) {
      setValores({ ...valores, ingredientesIds: actuales.filter(id => id !== ingId) });
    } else {
      setValores({ ...valores, ingredientesIds: [...actuales, ingId] });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (errorNombre || valores.nombre.trim() === '') {
      alert("Por favor ingresá un nombre válido y sin duplicados.");
      return;
    }
    
    const valoresFinales = { 
      ...valores,
      nombre: valores.nombre.trim().replace(/\s+/g, ' ') // Guarda el nombre limpio (1 solo espacio entre palabras)
    };

    if (tipo === 'producto') {
      if (archivoImagen) {
        valoresFinales.archivoImagen = archivoImagen;
      } else if (!valoresFinales.imagen || valoresFinales.imagen.trim() === '') {
        valoresFinales.imagen = '/noimagen.jpg';
      }
      
      if (valoresFinales.categoria === 'bebidas') {
        valoresFinales.ingredientesIds = [];
      }
    }

    onGuardar(valoresFinales);
  };

  const ingredientesFiltrados = useMemo(() => {
    const busquedaNormalizada = normalizarTexto(busquedaIngrediente);
    return listaIngredientesDisponibles.filter(ing => 
      normalizarTexto(ing.nombre).includes(busquedaNormalizada)
    );
  }, [listaIngredientesDisponibles, busquedaIngrediente]);

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title fw-bold">
              {itemAEditar ? `Editar ${tipo === 'producto' ? 'Producto' : 'Ingrediente'}` : `Nuevo ${tipo === 'producto' ? 'Producto' : 'Ingrediente'}`}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onCancelar}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body py-4">
              <div className="row g-3">
                
                <div className="col-12">
                  <label className="form-label fw-bold small">Nombre *</label>
                  <input 
                    type="text" 
                    className={`form-control ${errorNombre ? 'is-invalid' : ''}`} 
                    name="nombre" 
                    value={valores.nombre} 
                    onChange={handleChange} 
                    required 
                  />
                  {errorNombre && <div className="invalid-feedback">{errorNombre}</div>}
                </div>

                {tipo === 'producto' && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">Precio ($) *</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="precio" 
                        value={valores.precio} 
                        onChange={handleChange} 
                        required 
                        min="0"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small">Categoría *</label>
                      <select className="form-select" name="categoria" value={valores.categoria} onChange={handleChange}>
                        <option value="pizzas">Pizzas</option>
                        <option value="comidas">Comidas / Minutas</option>
                        <option value="bebidas">Bebidas</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-bold small">Imagen (opcional)</label>
                      <SelectorImagen
                        imagenActual={valores.imagen}
                        archivo={archivoImagen}
                        onCambiarArchivo={setArchivoImagen}
                        onQuitarImagenActual={() => setValores({ ...valores, imagen: '' })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-bold small">Descripción</label>
                      <textarea 
                        className="form-control" 
                        name="descripcion" 
                        rows="2" 
                        value={valores.descripcion} 
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    {valores.categoria !== 'bebidas' && (
                      <div className="col-12 mt-4">
                        <label className="form-label fw-bold small text-danger">Ingredientes que componen este producto (Efecto Dominó):</label>
                        
                        <div className="input-group input-group-sm mb-2">
                          <span className="input-group-text bg-white">🔍</span>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Buscar ingrediente..." 
                            value={busquedaIngrediente}
                            onChange={(e) => setBusquedaIngrediente(e.target.value)}
                          />
                        </div>

                        <div className="border p-3 rounded bg-light" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          <div className="row row-cols-2 row-cols-md-3 g-2">
                            {ingredientesFiltrados.length > 0 ? (
                              ingredientesFiltrados.map((ing) => (
                                <div className="col" key={ing.id}>
                                  <div className="form-check">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox" 
                                      id={`ing-check-${ing.id}`}
                                      checked={valores.ingredientesIds.includes(ing.id)}
                                      onChange={() => handleCheckboxIngrediente(ing.id)}
                                    />
                                    <label className="form-check-label small" htmlFor={`ing-check-${ing.id}`}>
                                      {ing.nombre}
                                    </label>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-12 text-muted small">No se encontraron ingredientes.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

              </div>
            </div>
            
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-outline-secondary fw-bold" onClick={onCancelar}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-success fw-bold" disabled={!!errorNombre}>
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';

export default function ModalFormularioStock({ tipo, itemAEditar, listaIngredientesDisponibles, onGuardar, onCancelar }) {
  const [valores, setValores] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: 'pizzas',
    ingredientesIds: []
  });

  useEffect(() => {
    if (itemAEditar) {
      setValores({
        nombre: itemAEditar.nombre || '',
        descripcion: itemAEditar.descripcion || '',
        precio: itemAEditar.precio || '',
        categoria: itemAEditar.categoria || 'pizzas',
        ingredientesIds: itemAEditar.ingredientesIds || []
      });
    }
  }, [itemAEditar]);

  const handleChange = (e) => {
    setValores({ ...valores, [e.target.name]: e.target.value });
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
    onGuardar(valores);
  };

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
                    className="form-control" 
                    name="nombre" 
                    value={valores.nombre} 
                    onChange={handleChange} 
                    required 
                  />
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
                      <label className="form-label fw-bold small">Descripción</label>
                      <textarea 
                        className="form-control" 
                        name="descripcion" 
                        rows="2" 
                        value={valores.descripcion} 
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    {/* Selector de ingredientes para el efecto dominó */}
                    <div className="col-12">
                      <label className="form-label fw-bold small text-danger">Ingredientes que componen este producto (Efecto Dominó):</label>
                      <div className="border p-3 rounded bg-light" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        <div className="row row-cols-2 row-cols-md-3 g-2">
                          {listaIngredientesDisponibles.map((ing) => (
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
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>
            
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-outline-secondary fw-bold" onClick={onCancelar}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-success fw-bold">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
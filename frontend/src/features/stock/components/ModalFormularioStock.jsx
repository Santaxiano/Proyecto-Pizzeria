import { useState, useMemo } from 'react';
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

const varianteVacia = () => ({ nombre: '', precio: '' });
const toppingVacio = () => ({ nombre: '', precio: '' });

const variantesParaFormulario = (variantes) => {
  if (!Array.isArray(variantes) || variantes.length === 0) {
    return [varianteVacia()];
  }

  return variantes.map((variante) => ({
    nombre: variante?.nombre ?? '',
    precio: variante?.precio !== undefined && variante?.precio !== null
      ? String(variante.precio)
      : '',
  }));
};

const toppingsParaFormulario = (toppings) => (
  Array.isArray(toppings)
    ? toppings.map((topping) => ({
        nombre: topping?.nombre ?? '',
        precio: topping?.precio !== undefined && topping?.precio !== null
          ? String(topping.precio)
          : '',
      }))
    : []
);

const valoresIniciales = (item) => ({
  nombre: item?.nombre || '',
  descripcion: item?.descripcion || '',
  categoria: item?.categoria || 'pizzas',
  imagen: item?.imagen || '',
  ingredientesIds: item?.ingredientesIds || [],
  toppings: toppingsParaFormulario(item?.toppings),
  variantes: variantesParaFormulario(item?.variantes),
});

export default function ModalFormularioStock({
  tipo,
  itemAEditar,
  listaIngredientesDisponibles,
  listaActualNombres, // Esta lista ahora debe contener los tokens estrictos
  onGuardar,
  onCancelar
}) {
  // El modal se monta de nuevo cada vez que se abre, así que alcanza con leer
  // el item a editar en el estado inicial (sin un efecto que copie props).
  const [valores, setValores] = useState(() => valoresIniciales(itemAEditar));
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [busquedaIngrediente, setBusquedaIngrediente] = useState('');
  const [errorNombre, setErrorNombre] = useState('');
  const [errorVariantes, setErrorVariantes] = useState('');
  const [errorToppings, setErrorToppings] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Forzamos a que no puedan empezar el nombre con un espacio
    const valorLimpio = name === 'nombre' && value.startsWith(' ') ? value.trimStart() : value;

    setValores((prev) => ({ ...prev, [name]: valorLimpio }));

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

  const handleVarianteChange = (index, campo, valor) => {
    const valorLimpio = campo === 'nombre' && valor.startsWith(' ') ? valor.trimStart() : valor;

    setValores((prev) => ({
      ...prev,
      variantes: prev.variantes.map((variante, i) => (
        i === index ? { ...variante, [campo]: valorLimpio } : variante
      )),
    }));

    if (errorVariantes) setErrorVariantes('');
  };

  const agregarVariante = () => {
    setValores((prev) => ({
      ...prev,
      variantes: [...prev.variantes, varianteVacia()],
    }));
    setErrorVariantes('');
  };

  const eliminarVariante = (index) => {
    setValores((prev) => ({
      ...prev,
      variantes: prev.variantes.filter((_, i) => i !== index),
    }));
    setErrorVariantes('');
  };

  const handleToppingChange = (index, campo, valor) => {
    const valorLimpio = campo === 'nombre' && valor.startsWith(' ') ? valor.trimStart() : valor;

    setValores((prev) => ({
      ...prev,
      toppings: prev.toppings.map((topping, i) => (
        i === index ? { ...topping, [campo]: valorLimpio } : topping
      )),
    }));

    if (errorToppings) setErrorToppings('');
  };

  const agregarTopping = () => {
    setValores((prev) => ({
      ...prev,
      toppings: [...prev.toppings, toppingVacio()],
    }));
    setErrorToppings('');
  };

  const eliminarTopping = (index) => {
    setValores((prev) => ({
      ...prev,
      toppings: prev.toppings.filter((_, i) => i !== index),
    }));
    setErrorToppings('');
  };

  const handleCheckboxIngrediente = (ingId) => {
    setValores((prev) => {
      const actuales = prev.ingredientesIds;
      const ingredientesIds = actuales.includes(ingId)
        ? actuales.filter((id) => id !== ingId)
        : [...actuales, ingId];

      return { ...prev, ingredientesIds };
    });
  };

  const validarVariantes = () => {
    if (valores.variantes.length === 0) {
      return 'Agregá al menos una variante.';
    }

    const tokens = new Set();

    for (const variante of valores.variantes) {
      const nombre = variante.nombre.trim();
      const precio = Number(variante.precio);

      if (!nombre) {
        return 'Completá el nombre de todas las variantes.';
      }

      if (variante.precio === '' || !Number.isInteger(precio) || precio < 0) {
        return 'Ingresá un precio entero mayor o igual a 0 en todas las variantes.';
      }

      const token = crearTokenEstricto(nombre);
      if (tokens.has(token)) {
        return `La variante "${nombre}" está repetida.`;
      }
      tokens.add(token);
    }

    return '';
  };

  const validarToppings = () => {
    if (valores.toppings.length > 20) {
      return 'Podés cargar hasta 20 toppings por producto.';
    }

    const tokens = new Set();

    for (const topping of valores.toppings) {
      const nombre = topping.nombre.trim();
      const precio = Number(topping.precio);

      if (!nombre) {
        return 'Completá el nombre de todos los toppings.';
      }

      if (nombre.length > 100) {
        return 'Cada topping puede tener hasta 100 caracteres.';
      }

      if (topping.precio === '' || !Number.isInteger(precio) || precio < 0) {
        return 'Ingresá un precio entero mayor o igual a 0 en todos los toppings.';
      }

      const token = crearTokenEstricto(nombre);
      if (tokens.has(token)) {
        return `El topping "${nombre}" está repetido.`;
      }
      tokens.add(token);
    }

    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (tipo === 'producto') {
      const error = validarVariantes();
      if (error) {
        setErrorVariantes(error);
        return;
      }

      if (valores.categoria === 'comidas') {
        const errorTops = validarToppings();
        if (errorTops) {
          setErrorToppings(errorTops);
          return;
        }
      }
    }

    if (errorNombre || valores.nombre.trim() === '') {
      alert("Por favor ingresá un nombre válido y sin duplicados.");
      return;
    }

    const valoresFinales = {
      ...valores,
      nombre: valores.nombre.trim().replace(/\s+/g, ' '), // Guarda el nombre limpio (1 solo espacio entre palabras)
      variantes: valores.variantes.map((variante) => ({
        nombre: variante.nombre.trim().replace(/\s+/g, ' '),
        precio: Number(variante.precio),
      })),
      // Los toppings son exclusivos de comidas; en el resto se guarda [].
      toppings: valores.categoria === 'comidas'
        ? valores.toppings.map((topping) => ({
            nombre: topping.nombre.trim().replace(/\s+/g, ' '),
            precio: Number(topping.precio),
          }))
        : [],
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
    } else {
      // Los ingredientes no tienen variantes ni precio.
      delete valoresFinales.variantes;
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
                      <label className="form-label fw-bold small">Categoría *</label>
                      <select className="form-select" name="categoria" value={valores.categoria} onChange={handleChange}>
                        <option value="pizzas">Pizzas</option>
                        <option value="comidas">Comidas / Minutas</option>
                        <option value="bebidas">Bebidas</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-2">
                        <div>
                          <label className="form-label fw-bold small mb-0">Tamaños / Variantes *</label>
                          <small className="text-muted d-block">
                            Cada variante tiene su propio precio. Ej: 4 porciones $9.000, 8 porciones $15.000.
                          </small>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger fw-bold text-nowrap"
                          onClick={agregarVariante}
                        >
                          + Agregar tamaño/variante
                        </button>
                      </div>

                      {valores.variantes.map((variante, index) => (
                        <div className="row g-2 align-items-center mb-2" key={index}>
                          <div className="col-12 col-md-6">
                            <input
                              type="text"
                              className={`form-control ${errorVariantes ? 'is-invalid' : ''}`}
                              placeholder="Nombre de la variante (ej: 4 porciones)"
                              aria-label={`Nombre de la variante ${index + 1}`}
                              value={variante.nombre}
                              onChange={(e) => handleVarianteChange(index, 'nombre', e.target.value)}
                              required
                            />
                          </div>

                          <div className="col-7 col-md-4">
                            <div className="input-group">
                              <span className="input-group-text bg-white">$</span>
                              <input
                                type="number"
                                className={`form-control ${errorVariantes ? 'is-invalid' : ''}`}
                                placeholder="Precio"
                                aria-label={`Precio de la variante ${index + 1}`}
                                min="0"
                                step="1"
                                value={variante.precio}
                                onChange={(e) => handleVarianteChange(index, 'precio', e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="col-5 col-md-2">
                            <button
                              type="button"
                              className="btn btn-outline-danger w-100"
                              onClick={() => eliminarVariante(index)}
                              disabled={valores.variantes.length === 1}
                              title={valores.variantes.length === 1 ? 'Debe quedar al menos una variante' : 'Eliminar variante'}
                              aria-label={`Eliminar variante ${index + 1}`}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}

                      {errorVariantes && <div className="text-danger small mt-1">{errorVariantes}</div>}
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-bold small">Imagen (opcional)</label>
                      <SelectorImagen
                        imagenActual={valores.imagen}
                        archivo={archivoImagen}
                        onCambiarArchivo={setArchivoImagen}
                        onQuitarImagenActual={() => setValores((prev) => ({ ...prev, imagen: '' }))}
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

                    {valores.categoria === 'comidas' && (
                      <div className="col-12 mt-4">
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-2">
                          <div>
                            <label className="form-label fw-bold small mb-0 text-danger">
                              Toppings / Extras (opcional)
                            </label>
                            <small className="text-muted d-block">
                              Se muestran solo en la carta de comidas. Cada topping suma su precio al de la variante.
                            </small>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger fw-bold text-nowrap"
                            onClick={agregarTopping}
                          >
                            + Agregar topping
                          </button>
                        </div>

                        {valores.toppings.length === 0 ? (
                          <div className="border p-3 rounded bg-light text-muted small">
                            Sin toppings cargados. Podés agregar extras como cheddar, bacon o papas.
                          </div>
                        ) : (
                          valores.toppings.map((topping, index) => (
                            <div className="row g-2 align-items-center mb-2" key={index}>
                              <div className="col-12 col-md-6">
                                <input
                                  type="text"
                                  className={`form-control ${errorToppings ? 'is-invalid' : ''}`}
                                  placeholder="Nombre del topping (ej: Cheddar extra)"
                                  aria-label={`Nombre del topping ${index + 1}`}
                                  maxLength={100}
                                  value={topping.nombre}
                                  onChange={(e) => handleToppingChange(index, 'nombre', e.target.value)}
                                  required
                                />
                              </div>

                              <div className="col-7 col-md-4">
                                <div className="input-group">
                                  <span className="input-group-text bg-white">$</span>
                                  <input
                                    type="number"
                                    className={`form-control ${errorToppings ? 'is-invalid' : ''}`}
                                    placeholder="Precio adicional"
                                    aria-label={`Precio del topping ${index + 1}`}
                                    min="0"
                                    step="1"
                                    value={topping.precio}
                                    onChange={(e) => handleToppingChange(index, 'precio', e.target.value)}
                                    required
                                  />
                                </div>
                              </div>

                              <div className="col-5 col-md-2">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger w-100"
                                  onClick={() => eliminarTopping(index)}
                                  aria-label={`Eliminar topping ${index + 1}`}
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          ))
                        )}

                        {errorToppings && <div className="text-danger small mt-1">{errorToppings}</div>}
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

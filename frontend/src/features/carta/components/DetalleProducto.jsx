import { useState } from 'react';
import { Link } from 'react-router';

const TAMANO_MITAD_Y_MITAD = '8 porciones';
const VARIANTE_MITAD = '4 porciones';

const obtenerVariantes = (producto) => (
  Array.isArray(producto?.variantes) ? producto.variantes : []
);

const obtenerToppings = (producto) => (
  Array.isArray(producto?.toppings)
    ? producto.toppings.filter((topping) => topping?.nombre)
    : []
);

const buscarVariante = (producto, nombre) => (
  obtenerVariantes(producto).find((variante) => variante.nombre === nombre) ?? null
);

// Cada mitad se cobra con el precio de la variante "4 porciones". Si esa
// variante no existe, se usa como fallback la mitad de la variante elegida.
const precioUnaMitad = (producto, varianteSeleccionada) => {
  const varianteCuatro = buscarVariante(producto, VARIANTE_MITAD);
  if (varianteCuatro) return Number(varianteCuatro.precio);

  return Math.round(Number(varianteSeleccionada?.precio ?? 0) / 2);
};

const obtenerPrecioMinimo = (variantes) => {
  const precios = variantes
    .map((variante) => Number(variante.precio))
    .filter((precio) => Number.isFinite(precio) && precio >= 0);

  return precios.length > 0 ? Math.min(...precios) : null;
};

function DetalleProducto({ producto, todasLasPizzas = [], onAgregar }) {
  const [tamano, setTamano] = useState(null);
  const [esMitad, setEsMitad] = useState(false);
  const [segundoSabor, setSegundoSabor] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [toppingsSeleccionados, setToppingsSeleccionados] = useState([]);
  const [agregado, setAgregado] = useState(false);

  const variantes = obtenerVariantes(producto);
  const varianteSeleccionada = tamano ? buscarVariante(producto, tamano) : null;
  const precioMinimo = obtenerPrecioMinimo(variantes);

  const sinStock = !(producto.disponible ?? producto.stock > 0);
  const esPizza = producto.categoria === 'pizzas';
  const esComida = producto.categoria === 'comidas';
  const permiteMitad = producto.permitemitad ?? producto.permiteMitad;
  const puedeMitad = esPizza && permiteMitad && tamano === TAMANO_MITAD_Y_MITAD;

  // Los toppings solo existen para comidas. El precio se recalcula con los
  // valores guardados en el producto, nunca con datos del carrito.
  const toppingsDisponibles = esComida ? obtenerToppings(producto) : [];
  const toppingsElegidos = toppingsDisponibles.filter((topping) => (
    toppingsSeleccionados.includes(topping.nombre)
  ));
  const totalToppings = toppingsElegidos.reduce(
    (acc, topping) => acc + Number(topping.precio || 0),
    0
  );

  // Mitad y mitad: se usa la misma variante (mismo tamaño) en la segunda pizza.
  const pizzaSegundaMitad = esMitad && segundoSabor
    ? todasLasPizzas.find((p) => p.id === Number(segundoSabor))
    : null;
  const varianteSegundaMitad = pizzaSegundaMitad
    ? buscarVariante(pizzaSegundaMitad, tamano)
    : null;

  // La mitad y mitad suma el precio de la variante "4 porciones" de cada pizza.
  const precioMitadPrimera = varianteSeleccionada
    ? precioUnaMitad(producto, varianteSeleccionada)
    : 0;
  const precioMitadSegunda = pizzaSegundaMitad && varianteSegundaMitad
    ? precioUnaMitad(pizzaSegundaMitad, varianteSegundaMitad)
    : 0;

  // Antes de elegir mostramos el mínimo como referencia. Con mitad y mitad,
  // el total es la suma exacta de las dos mitades. Los toppings se suman
  // después del precio base.
  const precioBase = varianteSeleccionada
    ? (esMitad && pizzaSegundaMitad && varianteSegundaMitad
        ? precioMitadPrimera + precioMitadSegunda
        : Number(varianteSeleccionada.precio))
    : precioMinimo ?? 0;
  const precioFinal = precioBase + totalToppings;
  const precioDesde = precioMinimo === null ? null : precioMinimo + totalToppings;

  const botonDeshabilitado =
    sinStock ||
    !varianteSeleccionada ||
    (esMitad && (!segundoSabor || !varianteSegundaMitad));

  let textoBoton = 'Agregar al Pedido';
  if (sinStock) {
    textoBoton = 'Sin Stock';
  } else if (variantes.length === 0) {
    textoBoton = 'Sin variantes configuradas';
  } else if (!varianteSeleccionada) {
    textoBoton = esPizza ? 'Elegí el tamaño de la pizza' : 'Elegí una opción';
  } else if (esMitad && !segundoSabor) {
    textoBoton = 'Seleccioná la 2da mitad';
  }

  // Fallback seguro de la imagen
  const imagenSegura = (producto.imagen && producto.imagen.trim() !== '')
    ? producto.imagen
    : '/noimagen.jpg';

  function alternarTopping(nombre) {
    setToppingsSeleccionados((prev) => (
      prev.includes(nombre)
        ? prev.filter((topping) => topping !== nombre)
        : [...prev, nombre]
    ));
    setAgregado(false);
  }

  function handleAgregar() {
    if (botonDeshabilitado || !varianteSeleccionada) return;

    const pizzaSegundoSabor = pizzaSegundaMitad;

    const itemCarrito = {
      ...producto,
      tamanoElegido: tamano,
      variante: {
        nombre: varianteSeleccionada.nombre,
        precio: Number(varianteSeleccionada.precio),
      },
      esMitadYMitad: esMitad,
      segundoSabor: pizzaSegundoSabor ? pizzaSegundoSabor.nombre : null,
      segundoSaborId: pizzaSegundoSabor ? pizzaSegundoSabor.id : null,
      // Snapshot de los extras elegidos: nombre y precio para mostrarlos en el
      // carrito. El backend vuelve a validar y sumar con los precios de la base.
      toppings: esComida
        ? toppingsElegidos.map((topping) => ({
            nombre: topping.nombre,
            precio: Number(topping.precio),
          }))
        : [],
      precioUnitario: precioFinal,
      cantidad
    };

    if (onAgregar) {
      onAgregar(itemCarrito);
    }
    setAgregado(true);
  }

  return (
    <div className="row g-4 g-lg-5 align-items-center">
      <div className="col-md-6">
        <img
          src={imagenSegura}
          alt={producto.nombre}
          className="img-fluid rounded-4 shadow-sm w-100"
          style={{ maxHeight: '450px', objectFit: 'cover' }}
        />
      </div>

      <div className="col-md-6">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/menu">Menú</Link></li>
            <li className="breadcrumb-item active">{producto.nombre}</li>
          </ol>
        </nav>

        <h1 className="display-6 fw-bold mb-2">{producto.nombre}</h1>
        <p className="fs-3 fw-bold text-danger mb-3">
          {varianteSeleccionada
            ? `$${precioFinal.toLocaleString('es-AR')}`
            : (precioDesde !== null
                ? `Desde $${precioDesde.toLocaleString('es-AR')}`
                : 'Sin precio')}
          {!varianteSeleccionada && variantes.length > 0 && (
            <span className="small text-secondary fw-normal fs-6 ms-2">
              (Elegí una opción)
            </span>
          )}
        </p>
        {pizzaSegundaMitad && varianteSeleccionada && varianteSegundaMitad && (
          <p className="small text-secondary mt-n2 mb-3">
            ½ {producto.nombre} ${precioMitadPrimera.toLocaleString('es-AR')} + ½ {pizzaSegundaMitad.nombre} ${precioMitadSegunda.toLocaleString('es-AR')}
          </p>
        )}
        {totalToppings > 0 && (
          <p className="small text-secondary mt-n2 mb-3">
            Toppings: +${totalToppings.toLocaleString('es-AR')}
            {!varianteSeleccionada && ' (elegí una presentación para confirmar el precio).'}
          </p>
        )}
        <p className="text-secondary">{producto.descripcion}</p>

        <h6 className="fw-bold mt-4">
          {esPizza ? 'Tamaño (Porciones):' : 'Presentación:'}
        </h6>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {variantes.length > 0 ? (
            variantes.map((variante) => {
              const seleccionado = tamano === variante.nombre;
              return (
                <button
                  key={`${variante.nombre}-${variante.precio}`}
                  type="button"
                  className={`btn ${seleccionado ? 'btn-danger' : 'btn-outline-secondary'}`}
                  aria-pressed={seleccionado}
                  onClick={() => {
                    setTamano(variante.nombre);
                    setAgregado(false);
                    if (variante.nombre !== TAMANO_MITAD_Y_MITAD) {
                      setEsMitad(false);
                      setSegundoSabor('');
                    }
                  }}
                >
                  <span className="d-block">{variante.nombre}</span>
                  <span className="d-block small fw-normal">
                    ${Number(variante.precio).toLocaleString('es-AR')}
                  </span>
                </button>
              );
            })
          ) : (
            <span className="text-danger small">Este producto no tiene variantes configuradas.</span>
          )}
        </div>

        {esComida && toppingsDisponibles.length > 0 && (
          <div className="mb-4">
            <h6 className="fw-bold">Toppings opcionales:</h6>
            <div className="border rounded-3 bg-light p-3">
              {toppingsDisponibles.map((topping, index) => {
                const idTopping = `topping-${producto.id}-${index}`;
                const seleccionado = toppingsSeleccionados.includes(topping.nombre);

                return (
                  <div
                    className="d-flex justify-content-between align-items-center py-1"
                    key={`${topping.nombre}-${index}`}
                  >
                    <div className="form-check mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={idTopping}
                        checked={seleccionado}
                        onChange={() => alternarTopping(topping.nombre)}
                      />
                      <label className="form-check-label" htmlFor={idTopping}>
                        {topping.nombre}
                      </label>
                    </div>
                    <span className="small fw-semibold text-danger">
                      +${Number(topping.precio).toLocaleString('es-AR')}
                    </span>
                  </div>
                );
              })}

              {totalToppings > 0 && (
                <div className="border-top mt-2 pt-2 text-end small fw-bold">
                  Toppings: +${totalToppings.toLocaleString('es-AR')}
                </div>
              )}
            </div>
          </div>
        )}

        {puedeMitad && (
          <div className="p-3 bg-light rounded-3 border mb-4">
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="checkMitad"
                checked={esMitad}
                onChange={(e) => {
                  setEsMitad(e.target.checked);
                  setAgregado(false);
                  if (!e.target.checked) setSegundoSabor('');
                }}
              />
              <label className="form-check-label fw-bold" htmlFor="checkMitad">
                ¿Querés pedirla Mitad y Mitad?
              </label>
            </div>

            {esMitad && (
              <div>
                <label className="form-label small text-secondary">
                  Elegí el sabor de la 2da mitad:
                </label>
                <select
                  className="form-select"
                  value={segundoSabor}
                  onChange={(e) => {
                    setSegundoSabor(e.target.value);
                    setAgregado(false);
                  }}
                >
                  <option value="">-- Seleccionar otro sabor --</option>
                  {todasLasPizzas
                    .filter((p) => (
                      p.id !== producto.id &&
                      (p.permitemitad ?? p.permiteMitad) &&
                      p.disponible !== false &&
                      buscarVariante(p, tamano)
                    ))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        Mitad: {p.nombre}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="input-group" style={{ width: '130px' }}>
            <button
              className="btn btn-outline-secondary"
              type="button"
              disabled={sinStock || cantidad === 1}
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            >
              -
            </button>
            <span className="input-group-text bg-white flex-grow-1 justify-content-center">
              {cantidad}
            </span>
            <button
              className="btn btn-outline-secondary"
              type="button"
              disabled={sinStock || cantidad >= (producto.stock ?? Infinity)}
              onClick={() => setCantidad((c) => c + 1)}
            >
              +
            </button>
          </div>

          <button
            className="btn btn-danger flex-grow-1 py-2 fw-bold"
            disabled={botonDeshabilitado}
            onClick={handleAgregar}
          >
            {textoBoton}
          </button>
        </div>

        {agregado && (
          <div className="alert alert-success d-flex justify-content-between align-items-center">
            <span>¡Agregado al pedido con éxito!</span>
            <Link to="/menu" className="btn btn-sm btn-success">
              Seguir Pidiendo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetalleProducto;

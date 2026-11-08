import { useState } from 'react';
import { Link } from 'react-router';

function DetalleProducto({ producto, todasLasPizzas = [], onAgregar }) {
  // 1. Arranca en null para que ninguna opción aparezca marcada por defecto
  const [tamano, setTamano] = useState(null);
  const [esMitad, setEsMitad] = useState(false);
  const [segundoSabor, setSegundoSabor] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  // "disponible" lo calcula el backend: hay stock Y ningún ingrediente desactivado (efecto dominó).
  // Si no viniera, se usa el stock como antes.
  const sinStock = !(producto.disponible ?? producto.stock > 0);
  const esPizza = producto.categoria === 'pizzas';
  // Solo permite mitad y mitad si eligió 8 porciones y la pizza lo habilita
  // El backend devuelve la columna en minúscula ("permitemitad")
  const permiteMitad = producto.permitemitad ?? producto.permiteMitad;
  const puedeMitad = esPizza && permiteMitad && tamano === '8 porciones';

  // 2. Validación para habilitar el botón
  // No hay stock, o no eligió tamaño, o pidió mitad/mitad y todavía no eligió el segundo sabor
  const botonDeshabilitado = 
    sinStock || 
    !tamano || 
    (esMitad && !segundoSabor);

  // 3. Texto dinámico para guiar a la persona usuaria
  let textoBoton = 'Agregar al Pedido';
  if (sinStock) {
    textoBoton = 'Sin Stock';
  } else if (!tamano) {
    textoBoton = esPizza ? 'Elegí el tamaño de la pizza' : 'Elegí una opción';
  } else if (esMitad && !segundoSabor) {
    textoBoton = 'Seleccioná la 2da mitad';
  }

  // 4. Cálculo dinámico del precio según tamaño (si aún no eligió, muestra el precio base)
  const multiplicadorPrecio = tamano === '4 porciones' ? 0.6 : 1;
  const precioFinal = producto.precio * multiplicadorPrecio;

  function handleAgregar() {
    if (botonDeshabilitado) return;

    // El select guarda el id de la 2da mitad (el backend lo necesita); el nombre se usa para mostrarla.
    const pizzaSegundoSabor = esMitad ? todasLasPizzas.find((p) => p.id === Number(segundoSabor)) : null;

    const itemCarrito = {
      ...producto,
      tamanoElegido: tamano,
      esMitadYMitad: esMitad,
      segundoSabor: pizzaSegundoSabor ? pizzaSegundoSabor.nombre : null,
      segundoSaborId: pizzaSegundoSabor ? pizzaSegundoSabor.id : null,
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
          src={producto.imagen} 
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
          ${precioFinal.toLocaleString('es-AR')}
          {!tamano && esPizza && (
            <span className="small text-secondary fw-normal fs-6 ms-2">
              (Precio base - 8 porciones)
            </span>
          )}
        </p>
        <p className="text-secondary">{producto.descripcion}</p>

        {/* Selector de Tamaño */}
        <h6 className="fw-bold mt-4">
          {esPizza ? 'Tamaño (Porciones):' : 'Presentación:'}
        </h6>
        <div className="d-flex gap-2 mb-3">
          {producto.tamanos.map((t) => {
            const seleccionado = tamano === t;
            return (
              <button
                key={t}
                type="button"
                className={`btn ${seleccionado ? 'btn-danger' : 'btn-outline-secondary'}`}
                aria-pressed={seleccionado}
                onClick={() => {
                  setTamano(t);
                  setAgregado(false);
                  if (t !== '8 porciones') {
                    setEsMitad(false);
                    setSegundoSabor('');
                  }
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Panel de Mitad y Mitad (solo si eligió 8 porciones) */}
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
                  onChange={(e) => setSegundoSabor(e.target.value)}
                >
                  <option value="">-- Seleccionar otro sabor --</option>
                  {todasLasPizzas
                    // Solo pizzas que permiten mitad y están disponibles (el backend rechaza el resto)
                    .filter((p) => p.id !== producto.id && (p.permitemitad ?? p.permiteMitad) && p.disponible !== false)
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

        {/* Cantidad y Botón de Pedido */}
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
              disabled={sinStock || cantidad === producto.stock}
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
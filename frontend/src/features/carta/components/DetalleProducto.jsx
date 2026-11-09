import { useState } from 'react';
import { Link } from 'react-router';

function DetalleProducto({ producto, todasLasPizzas = [], onAgregar }) {
  const [tamano, setTamano] = useState(null);
  const [esMitad, setEsMitad] = useState(false);
  const [segundoSabor, setSegundoSabor] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  const sinStock = !(producto.disponible ?? producto.stock > 0);
  const esPizza = producto.categoria === 'pizzas';
  const permiteMitad = producto.permitemitad ?? producto.permiteMitad;
  const puedeMitad = esPizza && permiteMitad && tamano === '8 porciones';

  const botonDeshabilitado = 
    sinStock || 
    !tamano || 
    (esMitad && !segundoSabor);

  let textoBoton = 'Agregar al Pedido';
  if (sinStock) {
    textoBoton = 'Sin Stock';
  } else if (!tamano) {
    textoBoton = esPizza ? 'Elegí el tamaño de la pizza' : 'Elegí una opción';
  } else if (esMitad && !segundoSabor) {
    textoBoton = 'Seleccioná la 2da mitad';
  }

  const multiplicadorPrecio = tamano === '4 porciones' ? 0.6 : 1;
  // Mitad y mitad: la mitad de cada pizza sumadas (misma regla que el backend, pedidos.controller.js)
  const pizzaSegundaMitad = esMitad && segundoSabor
    ? todasLasPizzas.find((p) => p.id === Number(segundoSabor))
    : null;
  const precioMitadPrimera = Math.round((producto.precio * multiplicadorPrecio) / 2);
  const precioMitadSegunda = pizzaSegundaMitad ? Math.round((pizzaSegundaMitad.precio * multiplicadorPrecio) / 2) : 0;
  const precioFinal = pizzaSegundaMitad
    ? Math.round((producto.precio * multiplicadorPrecio) / 2 + (pizzaSegundaMitad.precio * multiplicadorPrecio) / 2)
    : Math.round(producto.precio * multiplicadorPrecio);

  // Fallback seguro de la imagen
  const imagenSegura = (producto.imagen && producto.imagen.trim() !== '') 
    ? producto.imagen 
    : '/noimagen.jpg';

  function handleAgregar() {
    if (botonDeshabilitado) return;

    const pizzaSegundoSabor = pizzaSegundaMitad;

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
          ${precioFinal.toLocaleString('es-AR')}
          {!tamano && esPizza && (
            <span className="small text-secondary fw-normal fs-6 ms-2">
              (Precio base - 8 porciones)
            </span>
          )}
        </p>
        {pizzaSegundaMitad && (
          <p className="small text-secondary mt-n2 mb-3">
            ½ {producto.nombre} ${precioMitadPrimera.toLocaleString('es-AR')} + ½ {pizzaSegundaMitad.nombre} ${precioMitadSegunda.toLocaleString('es-AR')}
          </p>
        )}
        <p className="text-secondary">{producto.descripcion}</p>

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
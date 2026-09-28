import { useRef, useState } from 'react'

const TELEFONO_PIZZERIA = '5492664545759'

const VALORES_INICIALES = {
  nombre: '',
  telefono: '',
  asunto: 'consulta',
  mensaje: '',
}

const ASUNTOS = [
  { valor: 'consulta', texto: 'Consulta general' },
  { valor: 'reserva', texto: 'Consulta sobre Reservas' },
  { valor: 'demora', texto: 'Estado de pedido / Demora' },
  { valor: 'evento', texto: 'Eventos y cumpleaños' },
]

const MAXIMO_MENSAJE = 500

// Validación directa con JS común: sin importar nada externo
function validar(valores) {
  const errores = {}
  
  if (!valores.nombre.trim()) {
    errores.nombre = 'Ingresá tu nombre completo.'
  }

  if (!valores.telefono.trim()) {
    errores.telefono = 'Ingresá tu número de teléfono / WhatsApp.'
  } else if (valores.telefono.trim().length < 8) {
    errores.telefono = 'El teléfono debe tener al menos 8 dígitos.'
  }

  if (!valores.mensaje.trim()) {
    errores.mensaje = 'El mensaje no puede estar vacío.'
  } else if (valores.mensaje.trim().length < 10) {
    errores.mensaje = 'El mensaje debe tener al menos 10 caracteres.'
  }

  return errores
}

function FormularioContacto() {
  const [valores, setValores] = useState(VALORES_INICIALES)
  const [errores, setErrores] = useState({})
  const [estado, setEstado] = useState('escribiendo')
  const formularioRef = useRef(null)

  function handleChange(e) {
    const { name, value } = e.target
    setValores({ ...valores, [name]: value })
    if (errores[name]) setErrores({ ...errores, [name]: undefined })
  }

  function handleSubmit(e) {
    e.preventDefault()

    const nuevosErrores = validar(valores)
    setErrores(nuevosErrores)

    const primerCampoConError = Object.keys(nuevosErrores)[0]
    if (primerCampoConError) {
      formularioRef.current.elements[primerCampoConError].focus()
      return
    }

    setEstado('enviando')

    const asuntoSeleccionado = ASUNTOS.find((a) => a.valor === valores.asunto)?.texto || valores.asunto
    const mensajeWhatsApp = `*Consulta desde la Web +PIZZA*
*Nombre:* ${valores.nombre}
*Teléfono:* ${valores.telefono}
*Motivo:* ${asuntoSeleccionado}
-------------------------
*Mensaje:*
${valores.mensaje}`

    const url = `https://wa.me/${TELEFONO_PIZZERIA}?text=${encodeURIComponent(mensajeWhatsApp)}`
    window.open(url, '_blank')

    setEstado('enviado')
  }

  function handleNuevoMensaje() {
    setValores(VALORES_INICIALES)
    setEstado('escribiendo')
  }

  if (estado === 'enviado') {
    return (
      <div className="alert alert-success mb-0" role="status">
        <h2 className="h5 fw-bold">¡Mensaje preparado, {valores.nombre}!</h2>
        <p className="mb-3">
          Se abrió la ventana de WhatsApp para enviar tu consulta directamente a +PIZZA.
        </p>
        <button 
          type="button" 
          className="btn btn-success" 
          onClick={handleNuevoMensaje}
        >
          Enviar otra consulta
        </button>
      </div>
    )
  }

  const enviando = estado === 'enviando'

  return (
    <form ref={formularioRef} onSubmit={handleSubmit} noValidate>
      <div className="mb-3">
        <label htmlFor="nombre" className="form-label fw-semibold">
          Nombre y Apellido
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          placeholder="Tu nombre completo"
          className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
          value={valores.nombre}
          onChange={handleChange}
          disabled={enviando}
        />
        {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="telefono" className="form-label fw-semibold">
          Teléfono / WhatsApp
        </label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          placeholder="Ej: 2664123456"
          className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
          value={valores.telefono}
          onChange={handleChange}
          disabled={enviando}
        />
        {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="asunto" className="form-label fw-semibold">
          Motivo
        </label>
        <select
          id="asunto"
          name="asunto"
          className="form-select"
          value={valores.asunto}
          onChange={handleChange}
          disabled={enviando}
        >
          {ASUNTOS.map((asunto) => (
            <option key={asunto.valor} value={asunto.valor}>
              {asunto.texto}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="mensaje" className="form-label fw-semibold">
          Consulta
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows="4"
          maxLength={MAXIMO_MENSAJE}
          placeholder="Escribí acá tu consulta..."
          className={`form-control ${errores.mensaje ? 'is-invalid' : ''}`}
          value={valores.mensaje}
          onChange={handleChange}
          disabled={enviando}
        ></textarea>
        {errores.mensaje && <div className="invalid-feedback">{errores.mensaje}</div>}
        <div className="form-text text-end text-muted small">
          {valores.mensaje.length}/{MAXIMO_MENSAJE}
        </div>
      </div>

      <button 
        type="submit" 
        className="btn btn-success w-100 fw-bold py-2 shadow-sm" 
        disabled={enviando}
      >
        Enviar por WhatsApp
      </button>
    </form>
  )
}

export default FormularioContacto
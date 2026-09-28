import FormularioContacto from '../components/FormularioContacto'

const DATOS_CONTACTO = [
  { id: 1, titulo: 'Dirección', texto: '📍 Pringles 1091, San Luis Capital' },
  { id: 2, titulo: 'Horarios de Atención', texto: 'Lunes a Sábado: 12:00 - 15:30 | 19:00 - 00:30 hs\nDomingo: 19:00 - 01:00 hs' },
  { id: 3, titulo: 'WhatsApp Directo', texto: '📞 +54 266 454-5759' },
  { id: 4, titulo: 'Instagram', texto: '@maspizza.sl' },
]

function ContactoPage() {
  return (
    <div className="container py-5">
      <div className="row g-4 g-lg-5">
        <div className="col-lg-5">
          <h1 className="h2 titulo-tag fw-bold mb-3" style={{ color: 'var(--color-rojo-tomate)' }}>
            Contacto
          </h1>
          <p className="text-body-secondary mb-4">
            ¿Dudas sobre pedidos, reservas o eventos? Escribinos por WhatsApp.
          </p>

          <ul className="list-unstyled d-flex flex-column gap-3">
            {DATOS_CONTACTO.map((dato) => (
              <li key={dato.id} className="p-3 bg-light rounded-3 border">
                <strong className="d-block text-dark mb-1">{dato.titulo}</strong>
                <span className="text-body-secondary" style={{ whiteSpace: 'pre-line' }}>
                  {dato.texto}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm border p-4">
            <h3 className="h5 fw-bold mb-3">Envianos tu consulta</h3>
            <FormularioContacto />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactoPage
function SeccionMapa() {
  return (
    <section id="ubicacion" className="py-5 bg-light border-top">
      <div className="container">
        <div className="text-center mb-4">
          <h2 className="fw-bold">¿Dónde Encontrarnos?</h2>
          <p className="text-secondary">📍 Pringles 1091, San Luis Capital</p>
        </div>
        
        <div className="ratio ratio-21x9 shadow-sm rounded-4 overflow-hidden border">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3334.6063688195847!2d-66.3353594!3d-33.3023035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d43922f7a1f3ab%3A0x21ccb338553cc5fe!2s%2BPIZZA!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar" 
            title="Ubicación +Pizza"
            style={{ border: 0 }}
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          >
          </iframe>
        </div>
      </div>
    </section>
  );
}

export default SeccionMapa;
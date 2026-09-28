function SeccionNosotros() {
  return (
    <section id="nosotros" className="py-5 bg-white">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-12 col-lg-6">
            <span className="badge insignia-nosotros mb-2 px-3 py-2">
              Nuestra Pasión
            </span>
            <h2 className="display-6 fw-bold mb-3">Mucho más que pizza libre</h2>
            <p className="lead text-secondary mb-3">
              En <strong>+PIZZA</strong> sabemos que una buena experiencia empieza desde el momento en que entrás por la puerta de Pringles 1091.
            </p>
            <p className="text-body-secondary">
              Nuestro horno napolitano de alta temperatura fusiona tradición, fuego y materias primas de primera calidad para lograr una cocción crocante y perfecta en segundos.
            </p>

            <div className="row g-3 text-center pt-3 border-top mt-4">
              <div className="col-6">
                <span className="display-5 numero-estadistica d-block">+45</span>
                <span className="text-secondary small text-uppercase fw-semibold">Variedades</span>
              </div>
              <div className="col-6 border-start">
                <span className="display-5 numero-estadistica d-block">450°C</span>
                <span className="text-secondary small text-uppercase fw-semibold">Horno Napolitano</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="position-relative">
              <img 
                src="/IMG_5205.jpeg" 
                className="img-fluid rounded-4 shadow-lg w-100" 
                alt="Nuestra pizzería"
                style={{ maxHeight: '460px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SeccionNosotros;
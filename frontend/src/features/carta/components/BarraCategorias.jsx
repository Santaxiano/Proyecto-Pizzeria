function BarraCategorias({ categorias, seleccionada, onSeleccionar }) {
  const nombresAmigables = {
    todas: 'Todo el Menú',
    pizzas: '🍕 Pizzas',
    comidas: '🍔 Comidas',
    bebidas: '🥤 Bebidas'
  };

  function manejarClick(cat) {
    onSeleccionar(cat);
    // Si la categoría tiene un id en el DOM, scrollea suavemente
    const elemento = document.getElementById(`seccion-${cat}`);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <nav className="sticky-top bg-white py-2 shadow-sm border-bottom mb-4" style={{ top: 'var(--alto-navbar, 70px)', zIndex: 10 }}>
      <div className="container d-flex gap-2 overflow-x-auto pb-1">
        {['todas', ...categorias].map((cat) => {
          const activo = seleccionada === cat;
          return (
            <button
              key={cat}
              type="button"
              className={`btn btn-sm rounded-pill px-3 fw-bold text-nowrap ${
                activo ? 'btn-danger' : 'btn-outline-secondary'
              }`}
              onClick={() => manejarClick(cat)}
            >
              {nombresAmigables[cat] || cat.toUpperCase()}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BarraCategorias;
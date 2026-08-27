document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-producto');
  const formProducto = document.getElementById('form-producto');
  const btnCancelar = document.getElementById('btn-cancelar-modal');
  const inputTipoTabla = document.getElementById('input-tipo-tabla');
  const inputNombre = document.getElementById('input-nombre-prod');
  const inputPrecio = document.getElementById('input-precio-prod');
  const modalTitulo = document.getElementById('modal-titulo');

  // 1. Abrir Modal al presionar "+ Agregar Producto"
  document.querySelectorAll('.btn-agregar').forEach(boton => {
    boton.addEventListener('click', () => {
      const tipo = boton.dataset.tipo; // 'comidas' o 'bebidas'
      inputTipoTabla.value = tipo;
      modalTitulo.textContent = tipo === 'comidas' ? 'Agregar Comida' : 'Agregar Bebida';
      formProducto.reset();
      modal.classList.remove('oculto');
      inputNombre.focus();
    });
  });

  // 2. Cerrar Modal
  const cerrarModal = () => {
    modal.classList.add('oculto');
    formProducto.reset();
  };

  btnCancelar.addEventListener('click', cerrarModal);

  // Cerrar haciendo clic fuera de la tarjeta modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
  });

  // 3. Procesar el formulario e insertar la fila en la tabla
  formProducto.addEventListener('submit', (e) => {
    e.preventDefault();

    const tipo = inputTipoTabla.value;
    const nombre = inputNombre.value.trim();
    const precio = parseFloat(inputPrecio.value);

    if (!nombre || isNaN(precio) || precio <= 0) {
      alert('Por favor ingrese un nombre válido y un precio mayor a 0.');
      return;
    }

    // Formatear precio (ej: 13500 -> $13.500)
    const precioFormateado = `$${precio.toLocaleString('es-AR')}`;

    // Obtener el tbody correspondiente
    const tablaId = tipo === 'comidas' ? 'tabla-comidas' : 'tabla-bebidas';
    const tbody = document.querySelector(`#${tablaId} tbody`);

    // Crear la nueva fila
    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
      <td>${nombre}</td>
      <td>${precioFormateado}</td>
      <td class="col-acciones">
        <div class="acciones-tabla">
          <button type="button" class="btn-sm btn-warning">Modificar</button>
          <button type="button" class="btn-sm btn-danger">Eliminar</button>
        </div>
      </td>
    `;

    // Asignar evento de eliminar al botón recién creado
    nuevaFila.querySelector('.btn-danger').addEventListener('click', () => {
      if (confirm(`¿Seguro que querés eliminar "${nombre}"?`)) {
        nuevaFila.remove();
      }
    });

    tbody.appendChild(nuevaFila);
    cerrarModal();
  });

  // 4. Delegación de eventos para eliminar filas existentes por defecto
  document.querySelectorAll('.btn-danger').forEach(boton => {
    boton.addEventListener('click', (e) => {
      const fila = e.target.closest('tr');
      const nombreItem = fila.querySelector('td').textContent;
      if (confirm(`¿Seguro que querés eliminar "${nombreItem}"?`)) {
        fila.remove();
      }
    });
  });
});
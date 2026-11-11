import { useEffect, useState } from 'react'

const CLAVE_STORAGE = 'maspizza:carrito'

function leerCarritoGuardado() {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE)
    return guardado ? JSON.parse(guardado) : []
  } catch {
    return []
  }
}

// Los toppings forman parte de la identidad del ítem: una hamburguesa con
// cheddar y otra sin cheddar no deben fusionarse en el carrito.
function claveToppings(toppings) {
  if (!Array.isArray(toppings)) return ''

  const nombres = toppings
    .map((topping) => (typeof topping === 'string' ? topping : topping?.nombre ?? ''))
    .map((nombre) => String(nombre).trim().toLowerCase())
    .filter(Boolean)
    .sort()

  // JSON.stringify evita colisiones si un topping tuviera un separador.
  return nombres.length > 0 ? JSON.stringify(nombres) : ''
}

export function useCarrito() {
  const [items, setItems] = useState(leerCarritoGuardado)

  useEffect(() => {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items))
  }, [items])

  function agregarProducto(productoNuevo) {
    setItems((prev) => {
      // Creamos un ID único combinando id original + tamaño + segundo sabor + toppings.
      // Así el carrito diferencia una grande de una chica, una mitad de otra y
      // una comida con extras de la misma sin extras.
      const saborSecundario = productoNuevo.esMitadYMitad ? productoNuevo.segundoSabor : 'entera';
      const extras = claveToppings(productoNuevo.toppings);
      const idVariante = `${productoNuevo.id}-${productoNuevo.tamanoElegido || 'unica'}-${saborSecundario}-${extras || 'sin-toppings'}`;

      const existente = prev.find((item) => item.idVariante === idVariante)

      if (existente) {
        return prev.map((item) =>
          item.idVariante === idVariante
            ? { ...item, cantidad: item.cantidad + productoNuevo.cantidad }
            : item
        )
      }

      // Si es nuevo, lo agregamos con el precio exacto de la variante elegida y su idVariante
      return [
        ...prev,
        {
          ...productoNuevo,
          idVariante,
          precio: productoNuevo.precioUnitario ?? 0
        },
      ]
    })
  }

  function cambiarCantidad(idVariante, cantidad) {
    if (cantidad < 1) {
      quitarProducto(idVariante)
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.idVariante === idVariante ? { ...item, cantidad } : item))
    )
  }

  function quitarProducto(idVariante) {
    setItems((prev) => prev.filter((item) => item.idVariante !== idVariante))
  }

  function vaciarCarrito() {
    setItems([])
  }

  const cantidadTotal = items.reduce((acc, item) => acc + item.cantidad, 0)
  const subtotal = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

  return { items, cantidadTotal, subtotal, agregarProducto, cambiarCantidad, quitarProducto, vaciarCarrito }
}
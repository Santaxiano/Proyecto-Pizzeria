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

export function useCarrito() {
  const [items, setItems] = useState(leerCarritoGuardado)

  useEffect(() => {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items))
  }, [items])

  function agregarProducto(productoNuevo) {
    setItems((prev) => {
      // Creamos un ID único combinando id original + tamaño + segundo sabor
      // Así el carrito sabe diferenciar una grande de una chica, o una mitad de otra.
      const saborSecundario = productoNuevo.esMitadYMitad ? productoNuevo.segundoSabor : 'entera';
      const idVariante = `${productoNuevo.id}-${productoNuevo.tamanoElegido || 'unica'}-${saborSecundario}`;

      const existente = prev.find((item) => item.idVariante === idVariante)

      if (existente) {
        return prev.map((item) =>
          item.idVariante === idVariante
            ? { ...item, cantidad: item.cantidad + productoNuevo.cantidad }
            : item
        )
      }

      // Si es nuevo, lo agregamos con su precio calculado y su idVariante
      return [
        ...prev,
        {
          ...productoNuevo,
          idVariante,
          precio: productoNuevo.precioUnitario || productoNuevo.precio // Lee el precio con descuento
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
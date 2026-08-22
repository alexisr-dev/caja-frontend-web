import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { desglosarTotales } from '../utils/calculos'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const agregarItem = useCallback((producto) => {
    setItems(prev => {
      const yaEsta = prev.some(i => i.sku === producto.sku)
      if (yaEsta) {
        return prev.map(i =>
          i.sku === producto.sku ? { ...i, cantidad: i.cantidad + 1 } : i,
        )
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }, [])

  const quitarItem = useCallback((sku) => {
    setItems(prev => prev.filter(i => i.sku !== sku))
  }, [])

  const actualizarCantidad = useCallback((sku, cantidad) => {
    if (cantidad <= 0) {
      setItems(prev => prev.filter(i => i.sku !== sku))
      return
    }
    setItems(prev => prev.map(i => (i.sku === sku ? { ...i, cantidad } : i)))
  }, [])

  const vaciar = useCallback(() => setItems([]), [])

  const totales = useMemo(() => desglosarTotales(items), [items])

  const valor = useMemo(() => ({
    items,
    agregarItem,
    quitarItem,
    actualizarCantidad,
    vaciar,
    ...totales,
  }), [items, agregarItem, quitarItem, actualizarCantidad, vaciar, totales])

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)

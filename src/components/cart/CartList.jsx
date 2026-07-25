import { useCart } from '../../context/CartContext'
import CartItem from './CartItem'
import { ShoppingCart } from 'lucide-react'

export default function CartList({ bloqueado = false }) {
  const { items } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300">
          <ShoppingCart size={30} strokeWidth={1.5} />
        </div>
        <p className="mt-4 text-sm font-medium text-gray-500">Carrito vacío</p>
        <p className="text-xs text-gray-400 mt-0.5">Escanea un producto para agregarlo</p>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5">
      {items.map(item => <CartItem key={item.sku} item={item} bloqueado={bloqueado} />)}
    </div>
  )
}

import { useCart } from '../../context/CartContext'
import CartItem from './CartItem'
import { ShoppingCart } from 'lucide-react'

export default function CartList({ bloqueado = false }) {
  const { items } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="tag-price tag-price-muted w-[132px] h-16 flex items-center justify-center pl-5">
          <ShoppingCart size={28} strokeWidth={1.75} />
        </div>
        <p className="mt-5 text-base font-extrabold text-gray-900">Carrito vacío</p>
        <p className="text-sm text-gray-500 mt-1">Escanea un producto para agregarlo</p>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5">
      {items.map(item => <CartItem key={item.sku} item={item} bloqueado={bloqueado} />)}
    </div>
  )
}

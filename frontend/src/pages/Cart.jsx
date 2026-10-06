import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';

export function Cart() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!user) {
      navigate('/login');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const payload = { items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) };
      const res = await api.post('/orders', payload);
      clearCart();
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo confirmar el pedido');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <h1>Carrito</h1>
        <p>Tu carrito está vacío. <Link to="/">Ver catálogo</Link></p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Carrito</h1>

      <table className="cart-table">
        <thead>
          <tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.productId}>
              <td>{i.name}</td>
              <td>${i.price.toFixed(2)}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  value={i.quantity}
                  onChange={(e) => updateQuantity(i.productId, Math.max(1, Number(e.target.value)))}
                />
              </td>
              <td>${(i.price * i.quantity).toFixed(2)}</td>
              <td><button onClick={() => removeItem(i.productId)}>Quitar</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="cart-total">Total: ${total.toFixed(2)}</p>
      {error && <p className="error">{error}</p>}

      <button onClick={handleCheckout} disabled={loading}>
        {loading ? 'Confirmando...' : 'Confirmar pedido'}
      </button>
    </div>
  );
}

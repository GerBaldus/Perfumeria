import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const STATUSES = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];

export function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isStaff = user?.role === 'vendedor' || user?.role === 'admin';
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  function load() {
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch(() => setError('No se pudo cargar el pedido'));
  }

  useEffect(load, [id]);

  async function handleStatusChange(e) {
    const status = e.target.value;
    setUpdating(true);
    try {
      await api.patch(`/orders/${id}/status`, { status });
      load();
    } catch {
      setError('No se pudo actualizar el estado');
    } finally {
      setUpdating(false);
    }
  }

  if (error) return <p className="error">{error}</p>;
  if (!order) return <p className="loading">Cargando...</p>;

  return (
    <div className="page">
      <h1>Pedido #{order.id}</h1>
      <p>Fecha: {new Date(order.createdAt).toLocaleString()}</p>
      {isStaff && order.User && <p>Cliente: {order.User.name} ({order.User.email})</p>}
      {isStaff && order.seller && <p>Vendedor: {order.seller.name}</p>}

      <p>
        Estado:{' '}
        {isStaff ? (
          <select value={order.status} onChange={handleStatusChange} disabled={updating}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        ) : (
          <span className={`status-badge ${order.status}`}>{order.status}</span>
        )}
      </p>

      <table className="cart-table">
        <thead>
          <tr><th>Producto</th><th>Precio unitario</th><th>Cantidad</th><th>Subtotal</th></tr>
        </thead>
        <tbody>
          {order.OrderItems?.map((item) => (
            <tr key={item.id}>
              <td>{item.Product?.name}</td>
              <td>${Number(item.unitPrice).toFixed(2)}</td>
              <td>{item.quantity}</td>
              <td>${(Number(item.unitPrice) * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="cart-total">Total: ${Number(order.total).toFixed(2)}</p>
    </div>
  );
}

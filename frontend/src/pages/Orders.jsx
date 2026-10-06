import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export function Orders() {
  const { user } = useAuth();
  const isStaff = user?.role === 'vendedor' || user?.role === 'admin';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/orders')
      .then((res) => setOrders(res.data))
      .catch(() => setError('No se pudieron cargar los pedidos'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading">Cargando pedidos...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="page">
      <h1>{isStaff ? 'Pedidos' : 'Mis pedidos'}</h1>

      {orders.length === 0 && <p>No hay pedidos todavía.</p>}

      <table className="orders-table">
        <thead>
          <tr>
            <th>#</th>
            {isStaff && <th>Cliente</th>}
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              {isStaff && <td>{o.User?.name}</td>}
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td>${Number(o.total).toFixed(2)}</td>
              <td><span className={`status-badge ${o.status}`}>{STATUS_LABELS[o.status]}</span></td>
              <td><Link to={`/orders/${o.id}`}>Ver</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

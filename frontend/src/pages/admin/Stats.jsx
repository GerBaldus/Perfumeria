import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';

const PERIODS = [
  { value: 'day', label: 'Diarias', hint: 'Últimos 30 días' },
  { value: 'week', label: 'Semanales', hint: 'Últimas 12 semanas' },
  { value: 'month', label: 'Mensuales', hint: 'Últimos 12 meses' },
];

const STATUS_LABELS = {
  confirmado: 'Confirmado',
  enviado: 'Enviado',
  entregado: 'Entregado',
};

// El backend manda el inicio del periodo como YYYY-MM-DD; lo armamos a mano para no correrlo de dia por la zona horaria
function formatPeriod(value, period) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (period === 'month') return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  if (period === 'week') return `Semana del ${date.toLocaleDateString()}`;
  return date.toLocaleDateString();
}

export function AdminStats() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [period, setPeriod] = useState('day');
  const [sellerId, setSellerId] = useState('');
  const [sellers, setSellers] = useState([]);
  const [rows, setRows] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    api.get('/stats/sellers')
      .then((res) => setSellers(res.data))
      .catch(() => setError('No se pudieron cargar los vendedores'));
  }, [isAdmin]);

  useEffect(() => {
    let cancelled = false;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const params = { period, tz, ...(sellerId && { sellerId }) };

    Promise.all([
      api.get('/stats/sales', { params }),
      // El detalle de pedidos solo se pide cuando el admin eligio un vendedor
      sellerId ? api.get('/stats/orders', { params }) : Promise.resolve({ data: [] }),
    ])
      .then(([salesRes, ordersRes]) => {
        if (cancelled) return;
        setRows(salesRes.data);
        setOrders(ordersRes.data);
        setError('');
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar las estadísticas');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [period, sellerId]);

  function handlePeriodChange(value) {
    if (value === period) return;
    setLoading(true);
    setPeriod(value);
  }

  function handleSellerChange(e) {
    setLoading(true);
    setSellerId(e.target.value);
  }

  const totalOrders = rows.reduce((sum, r) => sum + r.orders, 0);
  const totalAmount = rows.reduce((sum, r) => sum + r.total, 0);
  const current = PERIODS.find((p) => p.value === period);
  const selectedSeller = sellers.find((s) => String(s.id) === sellerId);
  // Con un vendedor elegido la columna seria siempre el mismo nombre
  const showSellerColumn = isAdmin && !sellerId;

  return (
    <div className="page">
      <h1>{isAdmin ? 'Estadísticas de ventas' : 'Mis ventas'}</h1>

      <div className="stats-tabs">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            className={p.value === period ? 'active' : ''}
            onClick={() => handlePeriodChange(p.value)}
          >
            {p.label}
          </button>
        ))}
        <span className="stats-hint">{current.hint}</span>

        {isAdmin && (
          <select className="stats-seller" value={sellerId} onChange={handleSellerChange}>
            <option value="">Todos los vendedores</option>
            {sellers.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
          </select>
        )}
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Cargando estadísticas...</p>}

      {!loading && !error && rows.length === 0 && <p>No hay ventas en este período.</p>}

      {!loading && !error && rows.length > 0 && (
        <>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Período</th>
                {showSellerColumn && <th>Vendedor</th>}
                <th>Pedidos</th>
                <th>Total vendido</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.period}-${r.sellerId}`}>
                  <td>{formatPeriod(r.period, period)}</td>
                  {showSellerColumn && <td>{r.sellerName}</td>}
                  <td>{r.orders}</td>
                  <td>${r.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="cart-total">
            {totalOrders} pedidos · Total: ${totalAmount.toFixed(2)}
          </p>
        </>
      )}

      {!loading && !error && sellerId && orders.length > 0 && (
        <>
          <h2>Pedidos confirmados por {selectedSeller?.name}</h2>
          <table className="orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Confirmado</th>
                <th>Total</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.User?.name}</td>
                  <td>{new Date(o.confirmedAt).toLocaleString()}</td>
                  <td>${Number(o.total).toFixed(2)}</td>
                  <td><span className={`status-badge ${o.status}`}>{STATUS_LABELS[o.status]}</span></td>
                  <td><Link to={`/orders/${o.id}`}>Ver</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

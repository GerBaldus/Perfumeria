import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">Perfumería</Link>

      <nav className="nav-links">
        <Link to="/">Catálogo</Link>

        {user?.role === 'cliente' && (
          <>
            <Link to="/cart">Carrito ({cartCount})</Link>
            <Link to="/orders">Mis pedidos</Link>
          </>
        )}

        {(user?.role === 'vendedor' || user?.role === 'admin') && (
          <>
            <Link to="/orders">Pedidos</Link>
            <Link to="/admin/products">Productos</Link>
            <Link to="/admin/categories">Categorías</Link>
          </>
        )}

        {user?.role === 'admin' && <Link to="/admin/users">Usuarios</Link>}
      </nav>

      <div className="nav-auth">
        {user ? (
          <>
            <span className="user-chip">{user.name} ({user.role})</span>
            <button onClick={handleLogout}>Salir</button>
          </>
        ) : (
          <>
            <Link to="/login">Ingresar</Link>
            <Link to="/register">Crear cuenta</Link>
          </>
        )}
      </div>
    </header>
  );
}

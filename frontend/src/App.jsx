import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Home } from './pages/Home.jsx';
import { ProductDetail } from './pages/ProductDetail.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Cart } from './pages/Cart.jsx';
import { Orders } from './pages/Orders.jsx';
import { OrderDetail } from './pages/OrderDetail.jsx';
import { Profile } from './pages/Profile.jsx';
import { AdminProducts } from './pages/admin/Products.jsx';
import { AdminCategories } from './pages/admin/Categories.jsx';
import { AdminUsers } from './pages/admin/Users.jsx';
import { AdminStats } from './pages/admin/Stats.jsx';

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/cart" element={
            <ProtectedRoute roles={['cliente']}><Cart /></ProtectedRoute>
          } />

          <Route path="/orders" element={
            <ProtectedRoute roles={['cliente', 'vendedor', 'admin']}><Orders /></ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute roles={['cliente', 'vendedor', 'admin']}><OrderDetail /></ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          <Route path="/admin/products" element={
            <ProtectedRoute roles={['vendedor', 'admin']}><AdminProducts /></ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute roles={['vendedor', 'admin']}><AdminCategories /></ProtectedRoute>
          } />
          <Route path="/admin/stats" element={
            <ProtectedRoute roles={['vendedor', 'admin']}><AdminStats /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>
          } />

          <Route path="*" element={<p className="page">Página no encontrada</p>} />
        </Routes>
      </main>
    </>
  );
}

export default App;

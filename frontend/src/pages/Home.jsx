import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { ProductCard } from '../components/ProductCard.jsx';

export function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;

    api.get('/products', { params })
      .then((res) => setProducts(res.data))
      .catch(() => setError('No se pudieron cargar los productos'))
      .finally(() => setLoading(false));
  }, [search, categoryId]);

  return (
    <div className="page">
      <h1>Catálogo</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar perfume..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading && <p className="loading">Cargando productos...</p>}
      {error && <p className="error">{error}</p>}

      <div className="product-grid">
        {!loading && products.length === 0 && <p>No hay productos para mostrar.</p>}
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

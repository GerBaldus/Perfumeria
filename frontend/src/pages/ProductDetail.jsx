import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError('Producto no encontrado'));
  }, [id]);

  function handleAddToCart() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (error) return <p className="error">{error}</p>;
  if (!product) return <p className="loading">Cargando...</p>;

  return (
    <div className="page product-detail">
      <button className="back-link" onClick={() => navigate(-1)}>&larr; Volver</button>

      <div className="product-detail-grid">
        <div className="product-detail-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <div className="product-card-placeholder large">{product.name[0]}</div>
          )}
        </div>

        <div className="product-detail-info">
          <h1>{product.name}</h1>
          {product.brand && <p className="product-card-brand">{product.brand}</p>}
          {product.Category && <p className="category-tag">{product.Category.name}</p>}
          <p className="product-card-price large">${Number(product.price).toFixed(2)}</p>
          <p>{product.description}</p>
          <p className={`product-card-stock ${product.stock === 0 ? 'out' : ''}`}>
            {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
          </p>

          {(!user || user.role === 'cliente') && product.stock > 0 && (
            <div className="add-to-cart">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
              />
              <button onClick={handleAddToCart}>Agregar al carrito</button>
              {added && <span className="success-text">¡Agregado!</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

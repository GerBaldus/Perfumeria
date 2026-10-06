import { Link } from 'react-router-dom';

export function ProductCard({ product }) {
  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="product-card-placeholder">{product.name[0]}</div>
        )}
      </Link>
      <div className="product-card-body">
        <Link to={`/product/${product.id}`} className="product-card-name">{product.name}</Link>
        {product.brand && <p className="product-card-brand">{product.brand}</p>}
        <p className="product-card-price">${Number(product.price).toFixed(2)}</p>
        <p className={`product-card-stock ${product.stock === 0 ? 'out' : ''}`}>
          {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
        </p>
      </div>
    </div>
  );
}

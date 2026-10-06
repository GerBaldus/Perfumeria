import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const emptyForm = { name: '', brand: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '' };

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  function loadProducts() {
    api.get('/products').then((res) => setProducts(res.data));
  }

  useEffect(() => {
    loadProducts();
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      brand: product.brand || '',
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl || '',
      categoryId: product.categoryId || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      categoryId: form.categoryId || null,
    };

    try {
      if (editingId) {
        await api.patch(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      cancelEdit();
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el producto');
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    await api.delete(`/products/${id}`);
    loadProducts();
  }

  return (
    <div className="page">
      <h1>Productos</h1>

      <form onSubmit={handleSubmit} className="admin-form">
        <h2>{editingId ? 'Editar producto' : 'Nuevo producto'}</h2>
        <div className="form-grid">
          <label>Nombre<input name="name" value={form.name} onChange={handleChange} required /></label>
          <label>Marca<input name="brand" value={form.brand} onChange={handleChange} /></label>
          <label>Precio<input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required /></label>
          <label>Stock<input name="stock" type="number" value={form.stock} onChange={handleChange} /></label>
          <label>Imagen (URL)<input name="imageUrl" value={form.imageUrl} onChange={handleChange} /></label>
          <label>
            Categoría
            <select name="categoryId" value={form.categoryId} onChange={handleChange}>
              <option value="">Sin categoría</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>
        <label>Descripción<textarea name="description" value={form.description} onChange={handleChange} /></label>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="submit">{editingId ? 'Guardar cambios' : 'Crear producto'}</button>
          {editingId && <button type="button" onClick={cancelEdit}>Cancelar</button>}
        </div>
      </form>

      <table className="orders-table">
        <thead>
          <tr><th>Nombre</th><th>Marca</th><th>Precio</th><th>Stock</th><th></th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.brand}</td>
              <td>${Number(p.price).toFixed(2)}</td>
              <td>{p.stock}</td>
              <td>
                <button onClick={() => startEdit(p)}>Editar</button>
                <button onClick={() => handleDelete(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api/client.js';

export function AdminCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  function load() {
    api.get('/categories').then((res) => setCategories(res.data));
  }

  useEffect(load, []);

  function startEdit(category) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || '');
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setDescription('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.patch(`/categories/${editingId}`, { name, description });
      } else {
        await api.post('/categories', { name, description });
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar la categoría');
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta categoría?')) return;
    await api.delete(`/categories/${id}`);
    load();
  }

  return (
    <div className="page">
      <h1>Categorías</h1>

      <form onSubmit={handleSubmit} className="admin-form">
        <h2>{editingId ? 'Editar categoría' : 'Nueva categoría'}</h2>
        <label>Nombre<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Descripción<textarea value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button type="submit">{editingId ? 'Guardar cambios' : 'Crear categoría'}</button>
          {editingId && <button type="button" onClick={resetForm}>Cancelar</button>}
        </div>
      </form>

      <table className="orders-table">
        <thead><tr><th>Nombre</th><th>Descripción</th><th></th></tr></thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.description}</td>
              <td>
                <button onClick={() => startEdit(c)}>Editar</button>
                {user.role === 'admin' && <button onClick={() => handleDelete(c.id)}>Eliminar</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

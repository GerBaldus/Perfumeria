import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const ROLES = ['cliente', 'vendedor', 'admin'];
const emptyForm = { name: '', email: '', password: '', role: 'cliente' };

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  function load() {
    api.get('/users').then((res) => setUsers(res.data));
  }

  useEffect(load, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users', form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo crear el usuario');
    }
  }

  async function handleRoleChange(id, role) {
    await api.patch(`/users/${id}/role`, { role });
    load();
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este usuario?')) return;
    await api.delete(`/users/${id}`);
    load();
  }

  return (
    <div className="page">
      <h1>Usuarios</h1>

      <form onSubmit={handleCreate} className="admin-form">
        <h2>Nuevo usuario</h2>
        <div className="form-grid">
          <label>Nombre<input name="name" value={form.name} onChange={handleChange} required /></label>
          <label>Email<input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
          <label>Contraseña<input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} /></label>
          <label>
            Rol
            <select name="role" value={form.role} onChange={handleChange}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Crear usuario</button>
      </form>

      <table className="orders-table">
        <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th></th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </td>
              <td><button onClick={() => handleDelete(u.id)}>Eliminar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

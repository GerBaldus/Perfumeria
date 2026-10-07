import { useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const emptyPasswords = { currentPassword: '', newPassword: '', confirmPassword: '' };

export function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [profileError, setProfileError] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState(emptyPasswords);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setProfileSaved(false);
  }

  function handlePasswordChange(e) {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setPasswordSaved(false);
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError('');
    setProfileSaved(false);
    setSavingProfile(true);
    try {
      await updateProfile(form.name, form.email);
      setProfileSaved(true);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'No se pudo actualizar el perfil');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSaved(false);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/auth/me/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords(emptyPasswords);
      setPasswordSaved(true);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'No se pudo cambiar la contraseña');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="page profile-page">
      <h1>Mi perfil</h1>

      <section className="admin-form">
        <h2>Mis datos</h2>
        <dl className="profile-data">
          <dt>Nombre</dt><dd>{user.name}</dd>
          <dt>Email</dt><dd>{user.email}</dd>
          <dt>Rol</dt><dd>{user.role}</dd>
          {user.createdAt && (
            <>
              <dt>Miembro desde</dt><dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
            </>
          )}
        </dl>
      </section>

      <form onSubmit={handleProfileSubmit} className="admin-form">
        <h2>Modificar perfil</h2>
        <div className="form-grid">
          <label>Nombre<input name="name" value={form.name} onChange={handleChange} required /></label>
          <label>Email<input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
        </div>
        {profileError && <p className="error">{profileError}</p>}
        <div className="form-actions">
          <button type="submit" disabled={savingProfile}>{savingProfile ? 'Guardando...' : 'Guardar cambios'}</button>
          {profileSaved && <span className="success-text">Perfil actualizado</span>}
        </div>
      </form>

      <form onSubmit={handlePasswordSubmit} className="admin-form">
        <h2>Cambiar contraseña</h2>
        <div className="form-grid">
          <label>
            Contraseña actual
            <input name="currentPassword" type="password" value={passwords.currentPassword} onChange={handlePasswordChange} required />
          </label>
          <label>
            Nueva contraseña
            <input name="newPassword" type="password" value={passwords.newPassword} onChange={handlePasswordChange} required minLength={6} />
          </label>
          <label>
            Repetir nueva contraseña
            <input name="confirmPassword" type="password" value={passwords.confirmPassword} onChange={handlePasswordChange} required minLength={6} />
          </label>
        </div>
        {passwordError && <p className="error">{passwordError}</p>}
        <div className="form-actions">
          <button type="submit" disabled={savingPassword}>{savingPassword ? 'Guardando...' : 'Cambiar contraseña'}</button>
          {passwordSaved && <span className="success-text">Contraseña actualizada</span>}
        </div>
      </form>
    </div>
  );
}

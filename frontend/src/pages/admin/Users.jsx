import { useEffect, useState } from 'react';
import { usersApi } from '../../services/api/usersApi';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { Button } from '../../components/ui/Button';
import { useUiStore } from '../../store/uiStore';

const ROLE_TONE = { admin: 'good', manager: 'warn', user: 'default' };
const emptyForm = { email: '', password: '', displayName: '', role: 'user' };

export function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const showToast = useUiStore((s) => s.showToast);

  async function load() {
    setUsers(await usersApi.list());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await usersApi.create(form);
      setForm(emptyForm);
      await load();
      showToast('Utilisateur créé');
    } catch (err) {
      showToast(err.message || 'Échec de la création', true);
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(id, role) {
    try {
      await usersApi.updateRole(id, role);
      await load();
      showToast('Rôle mis à jour');
    } catch (err) {
      showToast(err.message || 'Échec de la mise à jour', true);
    }
  }

  async function handleToggleActive(u) {
    try {
      await usersApi.update(u.id, { isActive: !u.isActive });
      await load();
    } catch (err) {
      showToast(err.message || 'Échec de la mise à jour', true);
    }
  }

  async function handleDelete(id) {
    try {
      await usersApi.remove(id);
      await load();
      showToast('Utilisateur supprimé');
    } catch (err) {
      showToast(err.message || 'Échec de la suppression', true);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Utilisateurs</h1>

      <Card style={{ marginBottom: 20 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: '1px solid var(--b)', background: 'var(--s2)', color: 'var(--t)' }} />
          <input placeholder="Mot de passe" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: '1px solid var(--b)', background: 'var(--s2)', color: 'var(--t)' }} />
          <input placeholder="Nom affiché" required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: '1px solid var(--b)', background: 'var(--s2)', color: 'var(--t)' }} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: '1px solid var(--b)', background: 'var(--s2)', color: 'var(--t)' }}>
            <option value="user">Utilisateur</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <Button type="submit" disabled={saving}>Créer</Button>
        </form>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {users.map((u) => (
          <Card key={u.id} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{u.displayName}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>{u.email}</div>
            </div>
            <select
              value={u.role}
              disabled={u.id === currentUser?.id}
              onChange={(e) => handleRoleChange(u.id, e.target.value)}
              style={{ padding: 6, borderRadius: 6, border: '1px solid var(--b)', background: 'var(--s2)', color: 'var(--t)' }}
            >
              <option value="user">Utilisateur</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <Chip tone={ROLE_TONE[u.role]}>{u.role}</Chip>
            <Chip tone={u.isActive ? 'good' : 'bad'}>{u.isActive ? 'Actif' : 'Désactivé'}</Chip>
            <Button variant="ghost" onClick={() => handleToggleActive(u)} disabled={u.id === currentUser?.id}>
              {u.isActive ? 'Désactiver' : 'Activer'}
            </Button>
            <Button variant="danger" onClick={() => handleDelete(u.id)} disabled={u.id === currentUser?.id}>
              Supprimer
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

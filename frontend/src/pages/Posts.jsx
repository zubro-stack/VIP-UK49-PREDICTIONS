import { useEffect, useState } from 'react';
import { postsApi } from '../services/api/postsApi';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { NumberBall } from '../components/ui/NumberBall';
import { useUiStore } from '../store/uiStore';

const emptyForm = { title: '', target: '', numbers: '', notes: '' };

export function Posts() {
  const { user } = useAuth();
  const canPublish = useRole('manager');
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const showToast = useUiStore((s) => s.showToast);

  async function load() {
    setPosts(await postsApi.list());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.numbers) {
      showToast('Titre et numéros requis', true);
      return;
    }
    setSaving(true);
    try {
      await postsApi.create(form);
      setForm(emptyForm);
      await load();
      showToast('Publié');
    } catch (err) {
      showToast(err.message || 'Échec de la publication', true);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await postsApi.remove(id);
      await load();
      showToast('Supprimé');
    } catch (err) {
      showToast(err.message || 'Échec de la suppression', true);
    }
  }

  function parseNumbers(numbers) {
    return numbers.split(',').map((n) => parseInt(n.trim(), 10)).filter((n) => !isNaN(n) && n >= 1 && n <= 49);
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Publications</h1>
      <p style={{ color: 'var(--t2)', marginBottom: 16 }}>{posts.length} publiée(s)</p>

      {canPublish ? (
        <Card style={{ marginBottom: 20 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={{ padding: 8, borderRadius: 6, border: '1px solid var(--b)', background: 'var(--s2)', color: 'var(--t)' }} />
              <input placeholder="Tirage cible (ex: Tea de demain)" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}
                style={{ padding: 8, borderRadius: 6, border: '1px solid var(--b)', background: 'var(--s2)', color: 'var(--t)' }} />
            </div>
            <input placeholder="Numéros séparés par des virgules" value={form.numbers} onChange={(e) => setForm({ ...form, numbers: e.target.value })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid var(--b)', background: 'var(--s2)', color: 'var(--t)' }} />
            <textarea placeholder="Notes d'analyse" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid var(--b)', background: 'var(--s2)', color: 'var(--t)', minHeight: 60, resize: 'vertical' }} />
            <Button type="submit" disabled={saving} style={{ alignSelf: 'flex-start' }}>Publier</Button>
          </form>
        </Card>
      ) : (
        <Card style={{ marginBottom: 20, fontSize: 12, color: 'var(--t3)' }}>
          Connectez-vous en tant que manager pour publier.
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {posts.map((p) => (
          <Card key={p.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{p.title}</div>
                {p.target && <div style={{ fontSize: 11, color: 'var(--t3)' }}>→ {p.target}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, color: 'var(--t3)' }}>{new Date(p.createdAt).toLocaleDateString('fr-FR')} · {p.author?.displayName}</span>
                {(canPublish && (p.authorId === user?.id || user?.role === 'admin')) && (
                  <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer' }}>×</button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: p.notes ? 8 : 0 }}>
              {parseNumbers(p.numbers).map((n, i) => <NumberBall key={i} value={n} size={26} tone="v1" />)}
            </div>
            {p.notes && <div style={{ borderTop: '1px solid var(--b)', paddingTop: 8, fontSize: 12, color: 'var(--t2)' }}>{p.notes}</div>}
          </Card>
        ))}
        {posts.length === 0 && <p style={{ color: 'var(--t3)' }}>Aucune publication pour le moment.</p>}
      </div>
    </div>
  );
}

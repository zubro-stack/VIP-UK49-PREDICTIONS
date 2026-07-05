import { useEffect, useState } from 'react';
import { useDrawsStore } from '../store/drawsStore';
import { useUiStore } from '../store/uiStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const emptyForm = { drawDate: '', drawType: 'lunch', numbers: '', bonus: '' };

export function Draws() {
  const { draws, load, add } = useDrawsStore();
  const showToast = useUiStore((s) => s.showToast);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const numbers = form.numbers.split(',').map((n) => Number(n.trim()));
      await add({ drawDate: form.drawDate, drawType: form.drawType, numbers, bonus: Number(form.bonus) });
      setForm(emptyForm);
      showToast('Tirage ajouté');
    } catch (err) {
      showToast(err.message || "Impossible d'ajouter le tirage", true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Tirages</h1>

      <Card style={{ marginBottom: 20 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="date" required value={form.drawDate} onChange={(e) => setForm({ ...form, drawDate: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: '1px solid var(--b)', background: 'var(--s2)', color: 'var(--t)' }} />
          <select value={form.drawType} onChange={(e) => setForm({ ...form, drawType: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: '1px solid var(--b)', background: 'var(--s2)', color: 'var(--t)' }}>
            <option value="lunch">Lunch</option>
            <option value="tea">Tea</option>
          </select>
          <input placeholder="6 numéros séparés par des virgules" required value={form.numbers}
            onChange={(e) => setForm({ ...form, numbers: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: '1px solid var(--b)', background: 'var(--s2)', color: 'var(--t)', width: 220 }} />
          <input placeholder="Bonus" type="number" required value={form.bonus}
            onChange={(e) => setForm({ ...form, bonus: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: '1px solid var(--b)', background: 'var(--s2)', color: 'var(--t)', width: 80 }} />
          <Button type="submit" disabled={saving}>Ajouter</Button>
        </form>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {draws.slice().reverse().map((d) => (
          <Card key={d.id} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--t3)', width: 100 }}>{d.drawDate.slice(0, 10)}</span>
            <span style={{ fontSize: 12, width: 60 }}>{d.drawType === 'lunch' ? 'Lunch' : 'Tea'}</span>
            <span>{d.numbers.join(' - ')}</span>
            <span style={{ color: 'var(--v2)', fontWeight: 700 }}>{d.bonus}</span>
          </Card>
        ))}
        {draws.length === 0 && <p style={{ color: 'var(--t3)' }}>Aucun tirage enregistré.</p>}
      </div>
    </div>
  );
}

import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';

const POSITIONS = [
  ['POS1–POS6', 'Les 6 numéros principaux tirés, dans l\'ordre'],
  ['Bonus', 'Le 7e numéro (boule bonus)'],
  ['Lunch', 'Tirage de midi · 12h49 (heure UK)'],
  ['Tea', 'Tirage du soir · 17h49 (heure UK)'],
];

const PATTERN_LABELS = [
  ['Lunch POS1 ± POS2', 'V1 Sequential', 'Paires de positions au sein d\'un même tirage dont la somme ou la différence apparaît régulièrement le lendemain.'],
  ['Lunch(Récent) POS3 ± Précédent POS5', 'V1 Family', 'Même position comparée entre le tirage actuel et le précédent du même type (Lunch↔Lunch, Tea↔Tea).'],
  ['Lunch POS1 ± Tea POS4', 'V2 Cross-Pattern', 'Positions des tirages Lunch et Tea du même jour. Leur somme ou différence prédit le lendemain.'],
];

const STATUS = [
  ['ACTIF', 'good', 'Le pattern est valide et actif'],
  ['EN ATTENTE', 'warn', '1 échec consécutif'],
  ['RETIRÉ', 'bad', '2 échecs consécutifs'],
];

const ENGINES = [
  ['V1 Sequential', 'Paires de positions au sein d\'un même tirage dont la somme ou la différence apparaît régulièrement le lendemain.'],
  ['V1 Family', 'Compare des positions entre deux tirages consécutifs du même type. Lunch↔Lunch ou Tea↔Tea.'],
  ['Lunchtime to Teatime', 'Utilise des paires de positions du Lunch pour prédire des numéros du Tea du même jour.'],
  ['V3 Zubro Tracker', '50 groupes de charte prédéfinis. Quand 2+ membres apparaissent dans les tirages récents, les membres restants sont signalés.'],
  ['Best Pairs Engine', 'À partir de vos numéros, trouve les combinaisons qui partagent une ligne de la charte Zubro.'],
];

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 10 }}>{title}</h3>
      {children}
    </div>
  );
}

export function FAQ() {
  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>FAQ &amp; Référence</h1>
      <p style={{ color: 'var(--t2)', marginBottom: 20 }}>Vocabulaire, abréviations et fonctionnement de chaque moteur.</p>

      <Section title="Positions">
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {POSITIONS.map(([label, desc]) => (
              <div key={label}>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>{desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Libellés des patterns">
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PATTERN_LABELS.map(([code, name, desc]) => (
            <div key={code}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, background: 'var(--s2)', padding: '2px 8px', borderRadius: 6 }}>{code}</span>
                <Chip>{name}</Chip>
              </div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>{desc}</div>
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Statut &amp; métriques">
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {STATUS.map(([label, tone, desc]) => (
              <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Chip tone={tone}>{label}</Chip>
                <span style={{ fontSize: 12, color: 'var(--t2)' }}>{desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Opérations">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Card style={{ background: 'var(--gnl)' }}>
            <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--gnd)', marginBottom: 4 }}>ADD</div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--t2)', marginBottom: 6 }}>POS A + POS B</div>
            <div style={{ fontSize: 11, color: 'var(--t3)' }}>Somme de deux positions. Le résultat doit être entre 1 et 49.</div>
          </Card>
          <Card style={{ background: 'var(--aml)' }}>
            <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--am)', marginBottom: 4 }}>SUB</div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--t2)', marginBottom: 6 }}>|POS A − POS B|</div>
            <div style={{ fontSize: 11, color: 'var(--t3)' }}>Différence absolue. Le résultat doit être entre 1 et 49.</div>
          </Card>
        </div>
      </Section>

      <Section title="Moteurs d'analyse">
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ENGINES.map(([name, desc]) => (
            <div key={name} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--s2)', border: '1px solid var(--b)' }}>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>{desc}</div>
            </div>
          ))}
        </Card>
      </Section>
    </div>
  );
}

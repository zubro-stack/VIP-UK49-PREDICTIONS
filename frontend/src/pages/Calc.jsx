import { useEffect, useMemo, useState } from 'react';
import { calcApi } from '../services/api/calcApi';
import { drawsApi } from '../services/api/drawsApi';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { NumberBall } from '../components/ui/NumberBall';

const HIT_TONE = { same: 'good', other: 'warn', miss: 'default', none: 'default' };
const STRAT_LABEL = { s1: 'S1 · Multiplier & décalage', s2: 'S2 · Moins 5', s3: 'S3 · Chaîne bonus +8' };
const TABS = [
  { key: 'calc', label: 'Calculateur' },
  { key: 'tracker', label: 'Historique' },
];

function PredictionRow({ label, predictions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', width: 24 }}>{label}</span>
      {predictions.map((p, i) => (
        <NumberBall
          key={i}
          value={p.value ?? 'N'}
          size={28}
          tone={HIT_TONE[p.hit] === 'good' ? 'v1' : HIT_TONE[p.hit] === 'warn' ? 'v2' : 'default'}
        />
      ))}
    </div>
  );
}

function DrawColumn({ title, result }) {
  if (!result) return null;
  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 10 }}>{result.draw.drawDate?.slice(0, 10)}</div>
      <PredictionRow label="S1" predictions={result.s1} />
      <PredictionRow label="S2" predictions={result.s2} />
      <PredictionRow label="S3" predictions={result.s3} />
    </Card>
  );
}

export function Calc() {
  const [tab, setTab] = useState('calc');
  const [draws, setDraws] = useState([]);
  const [lunchDrawId, setLunchDrawId] = useState(null);
  const [teaDrawId, setTeaDrawId] = useState(null);
  const [result, setResult] = useState(null);
  const [tracker, setTracker] = useState(null);

  useEffect(() => {
    drawsApi.list().then(setDraws);
    calcApi.getTracker().then(setTracker);
  }, []);

  useEffect(() => {
    calcApi.getResult({ lunchDrawId, teaDrawId }).then(setResult);
  }, [lunchDrawId, teaDrawId]);

  const dates = useMemo(() => {
    const seen = new Map();
    draws.slice().reverse().forEach((d) => {
      const day = d.drawDate.slice(0, 10);
      if (!seen.has(day)) seen.set(day, { date: day, lunch: null, tea: null });
      seen.get(day)[d.drawType] = d;
    });
    return [...seen.values()];
  }, [draws]);

  function pickDate(day) {
    setLunchDrawId(day.lunch?.id ?? null);
    setTeaDrawId(day.tea?.id ?? null);
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Calculateur</h1>
      <p style={{ color: 'var(--t2)', marginBottom: 16 }}>
        Applique 3 stratégies de transformation à un tirage source et vérifie les prédictions contre les tirages suivants.
      </p>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--b)' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 14px', fontSize: 12, fontWeight: 700, background: 'none', border: 'none',
              borderBottom: tab === t.key ? '2px solid var(--v1)' : '2px solid transparent',
              color: tab === t.key ? 'var(--v1)' : 'var(--t3)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'calc' && (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
          <Card style={{ padding: 0, maxHeight: 360, overflowY: 'auto' }}>
            {dates.map((d) => (
              <div
                key={d.date}
                onClick={() => pickDate(d)}
                style={{
                  padding: '10px 12px', cursor: 'pointer', fontSize: 11,
                  background: d.lunch?.id === lunchDrawId || d.tea?.id === teaDrawId ? 'var(--s2)' : 'transparent',
                  borderBottom: '1px solid var(--b)',
                }}
              >
                {d.date}
              </div>
            ))}
            {dates.length === 0 && <div style={{ padding: 12, fontSize: 11, color: 'var(--t3)' }}>Aucun tirage.</div>}
          </Card>

          <div>
            {result ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <DrawColumn title="☀ Lunch" result={result.lunch} />
                  <DrawColumn title="☾ Tea" result={result.tea} />
                </div>
                <Card style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                    <Chip tone={result.verified ? 'good' : 'default'}>
                      {result.verified ? 'Vérifié' : 'En attente'}
                    </Chip>
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>Cible : {result.nextDate}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--t3)' }}>
                    <span><Chip tone="good">■</Chip> même type de tirage</span>
                    <span><Chip tone="warn">■</Chip> autre type de tirage</span>
                  </div>
                </Card>
                {result.lunch && (
                  <Card>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>☀ → ☾ Même jour (Lunch → Tea)</div>
                    <PredictionRow label="S1" predictions={result.lunch.sameDay.s1} />
                    <PredictionRow label="S2" predictions={result.lunch.sameDay.s2} />
                    <PredictionRow label="S3" predictions={result.lunch.sameDay.s3} />
                  </Card>
                )}
              </>
            ) : (
              <p style={{ color: 'var(--t3)' }}>Sélectionnez une date pour calculer.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'tracker' && (
        <div>
          {!tracker && <p style={{ color: 'var(--t3)' }}>Pas assez de tirages pour établir un historique.</p>}
          {tracker && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {['s1l', 's1t', 's2l', 's2t', 's3l', 's3t'].map((key) => {
                const stat = tracker[key];
                const label = `${STRAT_LABEL[key.slice(0, 2)]} · ${key.endsWith('l') ? 'Lunch' : 'Tea'}`;
                return (
                  <Card key={key}>
                    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>{stat.analyzed} tirages analysés</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Chip tone="good">{stat.multi2} avec 2+ hits</Chip>
                      <Chip>{stat.totalHits} hits au total</Chip>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

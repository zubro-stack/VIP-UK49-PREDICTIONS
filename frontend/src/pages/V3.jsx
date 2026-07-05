import { useEffect, useState } from 'react';
import { v3Api } from '../services/api/v3Api';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { NumberBall } from '../components/ui/NumberBall';
import { Button } from '../components/ui/Button';
import { StatTile } from '../components/ui/StatTile';
import { PerformanceHistoryRow } from '../components/engine/PerformanceHistoryRow';

const TIER_TONE = { 1: 'good', 2: 'warn', 3: 'default' };
const TIER_LABEL = { 1: '3+ HITS', 2: '2 HITS', 3: '1 HIT' };
function PerformanceSummaryLine({ row }) {
  return (
    <div style={{ fontSize: 11, color: row.hits.length ? 'var(--gnd)' : 'var(--t3)' }}>
      {row.drawDate?.slice(0, 10)} · {row.drawType} — {row.hits.length}/{row.total} hits
    </div>
  );
}

const TABS = [
  { key: 'hot', label: 'Numéros chauds' },
  { key: 'zones', label: 'Analyse de zone' },
  { key: 'pairs', label: 'Pairs & Triplets' },
];

export function V3() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('hot');
  const [showHotHistory, setShowHotHistory] = useState(false);
  const [showPairsHistory, setShowPairsHistory] = useState(false);

  useEffect(() => {
    v3Api.getAnalysis().then(setData);
  }, []);

  if (!data) return <p style={{ color: 'var(--t3)' }}>Chargement…</p>;

  const { zoneAnalysis, remainders, pairsTripletsPerformance, hotNumbers, hotNumbersPerformance, chartPredictions, commonNumbers, stats } = data;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22 }}>V3 — Zubro Tracker</h1>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <StatTile value={`${stats.window}`} label="Fenêtre" />
        <StatTile value={`${stats.activeLines}/${stats.totalLines}`} label="Lignes actives" />
        <StatTile value={hotNumbers.length} label="Chauds confirmés" />
        <StatTile value={commonNumbers.length} label="Communs V1∩V2" />
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--b)' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: tab === t.key ? '2px solid var(--v3)' : '2px solid transparent',
              color: tab === t.key ? 'var(--v3)' : 'var(--t3)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'hot' && (
        <div>
          {chartPredictions.length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13 }}>Groupes surchauffés (2+ numéros chauds)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {chartPredictions.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    {m.group.map((n) => (
                      <NumberBall key={n} value={n} size={26} tone={m.hotInGroup.includes(n) ? 'v3' : 'default'} />
                    ))}
                    <Chip tone="good">{m.count} chauds</Chip>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {commonNumbers.length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13 }}>Communs V1 ∩ V2</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {commonNumbers.map((c) => (
                  <div key={c.num} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <NumberBall value={c.num} size={28} tone="v1" />
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>{c.v1Sources.join(' + ')}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Historique de performance</div>
              <Button variant="ghost" onClick={() => setShowHotHistory((v) => !v)}>
                {showHotHistory ? `${hotNumbersPerformance.length} lignes ▾` : `▸ Voir ${hotNumbersPerformance.length} lignes`}
              </Button>
            </div>
            {showHotHistory && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                {hotNumbersPerformance.map((r, i) => (
                  <PerformanceHistoryRow
                    key={i}
                    date={r.drawDate}
                    type={r.drawType}
                    totalLabel={`${r.totalHot} chauds`}
                    hits={r.hits}
                    ballTone="v3"
                  />
                ))}
              </div>
            )}
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {hotNumbers.map((h) => (
              <Card key={h.num} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <NumberBall value={h.num} size={36} tone="v3" />
                <div>
                  <Chip tone={h.zonePriority === 1 ? 'good' : 'warn'}>{h.zonePriority === 1 ? 'ZONE HAUTE' : 'ZONE MOYENNE'}</Chip>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>{h.sources.join(' · ')}</div>
                </div>
              </Card>
            ))}
            {hotNumbers.length === 0 && <p style={{ color: 'var(--t3)' }}>Aucun numéro chaud confirmé actuellement.</p>}
          </div>
        </div>
      )}

      {tab === 'zones' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {zoneAnalysis.predictions.map((p) => (
            <Card key={p.num}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <NumberBall value={p.num} size={32} tone="v2" />
                <Chip tone={TIER_TONE[p.bestPriority]}>{TIER_LABEL[p.bestPriority]}</Chip>
              </div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>{p.groups.length} ligne(s) · score {p.score}</div>
            </Card>
          ))}
          {zoneAnalysis.predictions.length === 0 && <p style={{ color: 'var(--t3)' }}>Aucune ligne partiellement complète sur la fenêtre actuelle.</p>}
        </div>
      )}

      {tab === 'pairs' && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Performance (pairs &amp; triplets verrouillés)</div>
              <Button variant="ghost" onClick={() => setShowPairsHistory((v) => !v)}>
                {showPairsHistory ? 'Masquer' : 'Voir historique'}
              </Button>
            </div>
            {showPairsHistory && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>Paires ({pairsTripletsPerformance.pairRows.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                  {pairsTripletsPerformance.pairRows.map((r, i) => <PerformanceSummaryLine key={i} row={r} />)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>Triplets ({pairsTripletsPerformance.tripletRows.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {pairsTripletsPerformance.tripletRows.map((r, i) => <PerformanceSummaryLine key={i} row={r} />)}
                </div>
              </div>
            )}
          </Card>

          <h3 style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 8 }}>Paires (2 numéros restants)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
            {remainders.pairs.map((p, i) => (
              <Card key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {p.remaining.map((n) => <NumberBall key={n} value={n} size={26} tone="v1" />)}
                <Chip>{p.backingCount} ligne(s)</Chip>
              </Card>
            ))}
            {remainders.pairs.length === 0 && <p style={{ color: 'var(--t3)' }}>Aucune paire qualifiante.</p>}
          </div>

          <h3 style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 8 }}>Triplets (3 numéros restants)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {remainders.triplets.map((p, i) => (
              <Card key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {p.remaining.map((n) => <NumberBall key={n} value={n} size={26} tone="v3" />)}
                <Chip>{p.backingCount} ligne(s)</Chip>
              </Card>
            ))}
            {remainders.triplets.length === 0 && <p style={{ color: 'var(--t3)' }}>Aucun triplet qualifiant.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

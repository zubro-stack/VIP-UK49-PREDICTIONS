const { pairwiseEngines } = require('./pairwise');

/**
 * Central registry of every analysis engine exposed through
 * /api/engines/:code. Adding a future engine (e.g. a "V4") means adding one
 * entry here — the routes/controllers/services are engine-agnostic.
 *
 * V3, Repeats and Best-Pairs are cataloged as metadata already (so the
 * frontend can list them) but their compute engines are not implemented
 * yet in this phase of the migration — see the migration plan, phase 6.
 */
const ENGINE_CATALOG = {
  'v1-seq': { label: 'V1 Sequential', category: 'pairwise', engine: pairwiseEngines['v1-seq'] },
  'v1-fam': { label: 'V1 Family', category: 'pairwise', engine: pairwiseEngines['v1-fam'] },
  v2: { label: 'V2 Cross-Draw', category: 'pairwise', engine: pairwiseEngines.v2 },
  'same-day': { label: 'Same Day', category: 'pairwise', engine: pairwiseEngines['same-day'] },
  'bonus-seq': { label: 'Bonus Sequential', category: 'pairwise', engine: pairwiseEngines['bonus-seq'] },
  'bonus-fam': { label: 'Bonus Family', category: 'pairwise', engine: pairwiseEngines['bonus-fam'] },
  'bonus-v2': { label: 'Bonus V2', category: 'pairwise', engine: pairwiseEngines['bonus-v2'] },
  v3: { label: 'V3 Locked Sets', category: 'triplet', engine: null },
  repeats: { label: 'Repeats Tracker', category: 'tool', engine: null },
};

module.exports = { ENGINE_CATALOG };

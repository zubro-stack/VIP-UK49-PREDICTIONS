const { pairwiseEngines } = require('../pairwise');

/**
 * Recomputes what V1 Sequential, V1 Family and V2 are currently predicting,
 * straight from the draw list (not from persisted patterns) - V3 cross-
 * references these live, matching the legacy engine's own behaviour of
 * always recomputing rather than depending on another engine having been
 * "run" and saved first.
 */
function collectCrossEnginePredictions(draws) {
  const result = { seq: [], fam: [], v2: [], combined: new Set() };
  const push = (bucket, n) => {
    if (n != null && n >= 1 && n <= 49) {
      bucket.push(n);
      result.combined.add(n);
    }
  };
  const collect = (code, bucket) => {
    try {
      const engine = pairwiseEngines[code];
      const cards = engine.buildCards(draws, engine.discover(draws));
      cards.forEach((c) => {
        c.addPreds.forEach((n) => push(bucket, n));
        c.subPreds.forEach((n) => push(bucket, n));
      });
    } catch {
      // A malformed draw window shouldn't take down V3's cross-reference.
    }
  };
  collect('v1-seq', result.seq);
  collect('v1-fam', result.fam);
  collect('v2', result.v2);
  return result;
}

module.exports = { collectCrossEnginePredictions };

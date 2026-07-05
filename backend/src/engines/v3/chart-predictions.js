const { NUMBER_GROUPS } = require('./chart');

/** Chart lines where 2+ hot numbers already overlap - the strongest visual "almost there" groups. */
function computeChartPredictions(hotNumbers, limit = 3) {
  if (!hotNumbers.length) return [];
  const hotSet = new Set(hotNumbers.map((x) => x.num));
  const matches = [];
  NUMBER_GROUPS.forEach((group) => {
    const overlap = group.filter((n) => hotSet.has(n));
    if (overlap.length >= 2) {
      const missing = group.filter((n) => !hotSet.has(n));
      matches.push({ group, hotInGroup: overlap, missing, count: overlap.length });
    }
  });
  matches.sort((a, b) => b.count - a.count || a.missing.length - b.missing.length);
  return matches.slice(0, limit);
}

module.exports = { computeChartPredictions };

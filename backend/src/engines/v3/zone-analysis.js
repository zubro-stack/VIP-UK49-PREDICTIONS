const { NUMBER_GROUPS, ZONE_WINDOW } = require('./chart');
const { sortDraws } = require('../core/draw-utils');
const { drawValues } = require('../core/lottery-math');

/**
 * A chart line "qualifies" when some but not all of its numbers appeared
 * in the active window (some hit, some missing) - a partially-drawn line.
 * Missing numbers are scored by the square of how many drawn numbers their
 * line(s) already have (a line with more confirmed hits weighs its missing
 * numbers more heavily), summed across every qualifying line that shares
 * that missing number, then tiered by the best (lowest) priority reached:
 * tier 1 = some qualifying line had 3+ hits, tier 2 = 2 hits, tier 3 = 1 hit.
 */
function analyzeZones(draws, window = ZONE_WINDOW) {
  if (!draws.length) return { targetLines: [], predictions: [], tiers: { 1: [], 2: [], 3: [] } };

  const recent = sortDraws(draws).slice(-window);
  const active = new Set();
  recent.forEach((d) => drawValues(d).forEach((n) => active.add(n)));

  const targetLines = [];
  NUMBER_GROUPS.forEach((group, groupIndex) => {
    const hit = group.filter((n) => active.has(n));
    const missing = group.filter((n) => !active.has(n));
    if (hit.length > 0 && missing.length > 0) {
      targetLines.push({
        groupIndex,
        group,
        hit,
        missing,
        hitCount: hit.length,
        ratio: hit.length / group.length,
        priority: hit.length >= 3 ? 1 : hit.length === 2 ? 2 : 3,
      });
    }
  });
  targetLines.sort((a, b) => a.priority - b.priority || b.ratio - a.ratio);

  const byNumber = {};
  targetLines.forEach((line) => {
    const weight = line.hitCount * line.hitCount;
    line.missing.forEach((n) => {
      if (!byNumber[n]) byNumber[n] = { score: 0, groups: [], details: [], bestPriority: 9 };
      byNumber[n].score += weight;
      byNumber[n].groups.push(line.group);
      byNumber[n].details.push({ group: line.group, hitCount: line.hitCount, priority: line.priority });
      if (line.priority < byNumber[n].bestPriority) byNumber[n].bestPriority = line.priority;
    });
  });

  const predictions = Object.keys(byNumber)
    .map((n) => ({ num: parseInt(n, 10), ...byNumber[n] }))
    .sort((a, b) => a.bestPriority - b.bestPriority || b.score - a.score);

  const tiers = { 1: [], 2: [], 3: [] };
  predictions.forEach((p) => tiers[p.bestPriority].push(p));

  return { targetLines, predictions, tiers };
}

module.exports = { analyzeZones };

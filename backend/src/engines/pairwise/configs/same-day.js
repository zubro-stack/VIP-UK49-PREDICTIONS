const { latestOfType } = require('../../core/draw-utils');
const { ALL_PAIRS_UNORDERED } = require('./position-spaces');

/**
 * Same Day: any two positions within today's Lunch -> does the resulting
 * sum/diff show up in today's Tea (same date, no next-day wait)?
 */
const sameDayConfig = {
  code: 'same-day',
  label: 'Same Day',
  trackDirectHits: false,

  buildUnits(sorted) {
    const byDate = new Map();
    for (const draw of sorted) {
      if (!byDate.has(draw.drawDate)) byDate.set(draw.drawDate, {});
      byDate.get(draw.drawDate)[draw.drawType] = draw;
    }
    const units = [];
    for (const [, pair] of byDate) {
      if (!pair.lunch || !pair.tea) continue;
      units.push({ sourceA: pair.lunch, sourceB: pair.lunch, targets: [pair.tea], drawType: null });
    }
    return units;
  },

  positionPairs: () => ALL_PAIRS_UNORDERED,

  keyFn: (unit, i, j) => `sd|${i}|${j}`,

  currentSources(sorted) {
    const latestLunch = latestOfType(sorted, 'lunch');
    return latestLunch ? { sourceA: latestLunch, sourceB: latestLunch } : null;
  },
};

module.exports = { sameDayConfig };

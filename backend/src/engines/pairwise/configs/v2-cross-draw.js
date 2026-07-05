const { byType, findNextDayTargets } = require('../../core/draw-utils');
const { ALL_PAIRS } = require('./position-spaces');

/**
 * V2: any position of today's Lunch vs any position of today's Tea ->
 * does it predict tomorrow (either draw type)?
 */
const v2CrossDrawConfig = {
  code: 'v2',
  label: 'V2 Cross-Draw',
  trackDirectHits: true,

  buildUnits(sorted) {
    const units = [];
    for (const lunch of byType(sorted, 'lunch')) {
      const tea = sorted.find((d) => d.drawType === 'tea' && d.drawDate === lunch.drawDate);
      if (!tea) continue;
      const targets = findNextDayTargets(sorted, lunch);
      if (targets.length === 0) continue;
      units.push({ sourceA: lunch, sourceB: tea, targets, drawType: null });
    }
    return units;
  },

  positionPairs: () => ALL_PAIRS,

  keyFn: (unit, i, j) => `${i}|${j}`,

  currentSources(sorted) {
    const rev = sorted.slice().reverse();
    const lunch = rev.find((d) => d.drawType === 'lunch');
    const tea = rev.find((d) => d.drawType === 'tea');
    if (!lunch || !tea) return null;
    return { sourceA: lunch, sourceB: tea };
  },
};

module.exports = { v2CrossDrawConfig };

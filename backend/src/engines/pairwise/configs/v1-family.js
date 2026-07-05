const { byType, findNextDayTargets, latestTwoOfType } = require('../../core/draw-utils');
const { ALL_PAIRS } = require('./position-spaces');

/**
 * V1 Family: any position of the most recent draw of a type vs any position
 * of the previous draw of the same type -> does it predict the next day?
 */
const v1FamilyConfig = {
  code: 'v1-fam',
  label: 'V1 Family',
  trackDirectHits: true,

  buildUnits(sorted) {
    const units = [];
    for (const drawType of ['lunch', 'tea']) {
      const typed = byType(sorted, drawType);
      for (let k = 1; k < typed.length; k++) {
        const recent = typed[k];
        const prev = typed[k - 1];
        const targets = findNextDayTargets(sorted, recent);
        if (targets.length === 0) continue;
        units.push({ sourceA: recent, sourceB: prev, targets, drawType });
      }
    }
    return units;
  },

  positionPairs: () => ALL_PAIRS,

  keyFn: (unit, i, j) => `fam|${unit.drawType}|${i}|${j}`,

  currentSources(sorted, pattern) {
    const pair = latestTwoOfType(sorted, pattern.drawType);
    return pair ? { sourceA: pair[0], sourceB: pair[1] } : null;
  },
};

module.exports = { v1FamilyConfig };

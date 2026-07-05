const { findNextDayTargets } = require('../../core/draw-utils');
const { SEQUENTIAL_PAIRS } = require('./position-spaces');

/**
 * V1 Sequential: within a single draw, do neighbouring positions
 * (P1-P2, P2-P3, ... P6-Bonus) sum/diff into a number that shows up the
 * next day (either draw type)?
 */
const v1SequentialConfig = {
  code: 'v1-seq',
  label: 'V1 Sequential',
  trackDirectHits: true,

  buildUnits(sorted) {
    const units = [];
    for (const draw of sorted) {
      const targets = findNextDayTargets(sorted, draw);
      if (targets.length === 0) continue;
      units.push({ sourceA: draw, sourceB: draw, targets, drawType: draw.drawType });
    }
    return units;
  },

  positionPairs: () => SEQUENTIAL_PAIRS,

  keyFn: (unit, i, j) => `${unit.drawType}|${i}|${j}`,

  currentSources(sorted, pattern) {
    const latest = sorted.slice().reverse().find((d) => d.drawType === pattern.drawType);
    return latest ? { sourceA: latest, sourceB: latest } : null;
  },
};

module.exports = { v1SequentialConfig };

const { findNextDayTargets } = require('../../core/draw-utils');
const { isEquivalent, bonusDigitShiftTransform } = require('../../core/lottery-math');
const { SEQUENTIAL_PAIRS } = require('./position-spaces');

/**
 * Bonus Sequential: same shape as V1 Sequential, but the prediction only
 * has to land on the *bonus ball* of the target draw (not anywhere in it),
 * and overflowing sums (> 49) are digit-shifted back into range instead of
 * discarded. Because bonus hits are rarer, one hit is enough to keep a
 * pattern alive (minHits: 1) instead of two.
 */
const bonusSequentialConfig = {
  code: 'bonus-seq',
  label: 'Bonus Sequential',
  trackDirectHits: false,
  minHits: 1,
  sumTransform: bonusDigitShiftTransform,

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

  matchTarget: (prediction, target) => isEquivalent(prediction, target.bonus),

  keyFn: (unit, i, j) => `${unit.drawType}|bseq|${i}|${j}`,

  currentSources(sorted, pattern) {
    const latest = sorted.slice().reverse().find((d) => d.drawType === pattern.drawType);
    return latest ? { sourceA: latest, sourceB: latest } : null;
  },
};

module.exports = { bonusSequentialConfig };

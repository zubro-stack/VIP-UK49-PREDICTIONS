const { findNextDayTargets, latestOfType } = require('../../core/draw-utils');
const { isEquivalent, bonusDigitShiftTransform } = require('../../core/lottery-math');
const { ALL_PAIRS_UNORDERED } = require('./position-spaces');

/**
 * Bonus Sequential: same source-unit shape as V1 Sequential (single draw,
 * next-day target), but the prediction only has to land on the *bonus
 * ball* of the target draw (not anywhere in it), and overflowing sums
 * (> 49) are digit-shifted back into range instead of discarded. Because
 * bonus hits are rarer, one hit is enough to keep a pattern alive
 * (minHits: 1) instead of two.
 *
 * Unlike V1 Sequential, this checks all 21 unordered position pairs
 * (ALL_PAIRS_UNORDERED) rather than just the 6 sequential neighbour pairs -
 * a combination like POS1+Bonus is a legitimate pair to test here even
 * though it isn't "sequential", since any two positions can sum/diff into
 * a bonus-ball prediction.
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

  positionPairs: () => ALL_PAIRS_UNORDERED,

  matchTarget: (prediction, target) => isEquivalent(prediction, target.bonus),

  keyFn: (unit, i, j) => `${unit.drawType}|bseq|${i}|${j}`,

  currentSources(sorted, pattern) {
    const latest = latestOfType(sorted, pattern.drawType);
    return latest ? { sourceA: latest, sourceB: latest } : null;
  },
};

module.exports = { bonusSequentialConfig };

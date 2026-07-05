const { byType, latestTwoOfType } = require('../../core/draw-utils');
const { isEquivalent, bonusDigitShiftTransform } = require('../../core/lottery-math');
const { ALL_PAIRS } = require('./position-spaces');

/**
 * Bonus Family: like V1 Family, but the target is specifically "the next
 * draw of the same type" (e.g. the following Lunch), not "any draw on the
 * next calendar day" — this mirrors the legacy engine's own behaviour,
 * which intentionally chains within a single draw type for the bonus
 * heuristic. Prediction only needs to match the target's bonus ball.
 */
const bonusFamilyConfig = {
  code: 'bonus-fam',
  label: 'Bonus Family',
  trackDirectHits: false,
  minHits: 1,
  sumTransform: bonusDigitShiftTransform,

  buildUnits(sorted) {
    const units = [];
    for (const drawType of ['lunch', 'tea']) {
      const typed = byType(sorted, drawType);
      for (let k = 1; k < typed.length; k++) {
        const recent = typed[k];
        const prev = typed[k - 1];
        const next = typed[k + 1];
        if (!next) continue;
        units.push({ sourceA: recent, sourceB: prev, targets: [next], drawType });
      }
    }
    return units;
  },

  positionPairs: () => ALL_PAIRS,

  matchTarget: (prediction, target) => isEquivalent(prediction, target.bonus),

  keyFn: (unit, i, j) => `bfam|${unit.drawType}|${i}|${j}`,

  currentSources(sorted, pattern) {
    const pair = latestTwoOfType(sorted, pattern.drawType);
    return pair ? { sourceA: pair[0], sourceB: pair[1] } : null;
  },
};

module.exports = { bonusFamilyConfig };

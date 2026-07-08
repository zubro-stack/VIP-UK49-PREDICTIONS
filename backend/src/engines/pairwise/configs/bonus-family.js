const { byType, findNextDayTargets, latestTwoOfType } = require('../../core/draw-utils');
const { isEquivalent, bonusDigitShiftTransform } = require('../../core/lottery-math');
const { ALL_PAIRS } = require('./position-spaces');

/**
 * Bonus Family: like V1 Family (most recent draw of a type vs the previous
 * draw of the same type -> does it predict the next day?), but the
 * prediction only needs to match the target's bonus ball. The target is
 * any draw on the next calendar day, regardless of type - same rule as
 * every other pattern engine here (V1 Family, Bonus Sequential, Bonus V2).
 * An earlier version of this engine restricted the target to "the next
 * draw of the same type" only, which meant a real hit landing on the
 * next day's *other* draw type went completely undetected.
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
        const targets = findNextDayTargets(sorted, recent);
        if (targets.length === 0) continue;
        units.push({ sourceA: recent, sourceB: prev, targets, drawType });
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

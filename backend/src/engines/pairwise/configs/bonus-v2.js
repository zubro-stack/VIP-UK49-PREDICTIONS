const { byType, findNextDayTargets, findSameDayTarget, latestLunchTeaPair } = require('../../core/draw-utils');
const { isEquivalent, bonusDigitShiftTransform } = require('../../core/lottery-math');
const { ALL_PAIRS } = require('./position-spaces');

/**
 * Bonus V2: like V2 Cross-Draw, restricted to matching the target's bonus
 * ball, with the digit-shift transform and a 1-hit survival threshold.
 */
const bonusV2Config = {
  code: 'bonus-v2',
  label: 'Bonus V2',
  trackDirectHits: false,
  minHits: 1,
  sumTransform: bonusDigitShiftTransform,

  buildUnits(sorted) {
    const units = [];
    for (const lunch of byType(sorted, 'lunch')) {
      const tea = findSameDayTarget(sorted, lunch, 'tea');
      if (!tea) continue;
      const targets = findNextDayTargets(sorted, lunch);
      if (targets.length === 0) continue;
      units.push({ sourceA: lunch, sourceB: tea, targets, drawType: null });
    }
    return units;
  },

  positionPairs: () => ALL_PAIRS,

  matchTarget: (prediction, target) => isEquivalent(prediction, target.bonus),

  keyFn: (unit, i, j) => `bv2|${i}|${j}`,

  currentSources(sorted) {
    const pair = latestLunchTeaPair(sorted);
    return pair ? { sourceA: pair.lunch, sourceB: pair.tea } : null;
  },
};

module.exports = { bonusV2Config };

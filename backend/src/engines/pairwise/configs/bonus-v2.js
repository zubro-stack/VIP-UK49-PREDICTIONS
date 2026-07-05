const { byType, findNextDayTargets } = require('../../core/draw-utils');
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
      const tea = sorted.find((d) => d.drawType === 'tea' && d.drawDate === lunch.drawDate);
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
    const rev = sorted.slice().reverse();
    const lunch = rev.find((d) => d.drawType === 'lunch');
    const tea = rev.find((d) => d.drawType === 'tea');
    if (!lunch || !tea) return null;
    return { sourceA: lunch, sourceB: tea };
  },
};

module.exports = { bonusV2Config };

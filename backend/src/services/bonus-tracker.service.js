const enginesService = require('./engines.service');
const { sortCards } = require('../engines/pairwise/pairwise-engine');

/**
 * The Bonus Tracker is one user-facing engine backed by three independent
 * discover/buildCards passes (Sequential, Family, V2 - same shape as their
 * non-bonus counterparts, just targeting the bonus ball). Each sub-engine
 * keeps its own stored pattern set and its own qualification threshold, but
 * the user sees and runs this as a single feature: one "Run Analysis"
 * action, one merged prediction feed - not three separate pages.
 */
const SUB_ENGINES = [
  { code: 'bonus-seq', label: 'Sequential' },
  { code: 'bonus-fam', label: 'Family' },
  { code: 'bonus-v2', label: 'V2' },
];

function mergedPredictedNumbers(cards) {
  const set = new Set();
  cards.forEach((c) => {
    c.addPreds.forEach((n) => set.add(n));
    c.subPreds.forEach((n) => set.add(n));
  });
  return [...set].sort((a, b) => a - b);
}

async function getPage() {
  const perSubEngine = await Promise.all(
    SUB_ENGINES.map(async (sub) => {
      const cards = await enginesService.listCards(sub.code);
      return cards.map((card) => ({ ...card, engineCode: sub.code, subEngine: sub.label }));
    })
  );
  const cards = sortCards(perSubEngine.flat());
  return {
    cards,
    predictedNumbers: mergedPredictedNumbers(cards),
    activeCount: cards.length,
  };
}

async function runAll() {
  await Promise.all(SUB_ENGINES.map((sub) => enginesService.run(sub.code)));
  return getPage();
}

module.exports = { getPage, runAll, SUB_ENGINES };

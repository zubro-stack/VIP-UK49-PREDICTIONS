const { createPairwiseEngine } = require('./pairwise-engine');
const { v1SequentialConfig } = require('./configs/v1-sequential');
const { v1FamilyConfig } = require('./configs/v1-family');
const { v2CrossDrawConfig } = require('./configs/v2-cross-draw');
const { sameDayConfig } = require('./configs/same-day');
const { bonusSequentialConfig } = require('./configs/bonus-sequential');
const { bonusFamilyConfig } = require('./configs/bonus-family');
const { bonusV2Config } = require('./configs/bonus-v2');

const pairwiseConfigs = {
  'v1-seq': v1SequentialConfig,
  'v1-fam': v1FamilyConfig,
  v2: v2CrossDrawConfig,
  'same-day': sameDayConfig,
  'bonus-seq': bonusSequentialConfig,
  'bonus-fam': bonusFamilyConfig,
  'bonus-v2': bonusV2Config,
};

const pairwiseEngines = Object.fromEntries(
  Object.entries(pairwiseConfigs).map(([code, config]) => [code, createPairwiseEngine(config)])
);

module.exports = { pairwiseEngines, pairwiseConfigs };

const { createPairwiseEngine } = require('./pairwise-engine');
const { v1SequentialConfig } = require('./configs/v1-sequential');
const { v1FamilyConfig } = require('./configs/v1-family');
const { v2CrossDrawConfig } = require('./configs/v2-cross-draw');
const { sameDayConfig } = require('./configs/same-day');
const { bonusSequentialConfig } = require('./configs/bonus-sequential');
const { bonusFamilyConfig } = require('./configs/bonus-family');
const { bonusV2Config } = require('./configs/bonus-v2');

const pairwiseEngines = {
  'v1-seq': createPairwiseEngine(v1SequentialConfig),
  'v1-fam': createPairwiseEngine(v1FamilyConfig),
  v2: createPairwiseEngine(v2CrossDrawConfig),
  'same-day': createPairwiseEngine(sameDayConfig),
  'bonus-seq': createPairwiseEngine(bonusSequentialConfig),
  'bonus-fam': createPairwiseEngine(bonusFamilyConfig),
  'bonus-v2': createPairwiseEngine(bonusV2Config),
};

module.exports = { pairwiseEngines };

const { z } = require('zod');
const { MAX_SELECTED_NUMBERS } = require('../engines/best-pairs/best-pairs-engine');

const analyzeSchema = {
  body: z.object({
    numbers: z.array(z.number().int().min(1).max(49)).min(1).max(MAX_SELECTED_NUMBERS),
    size: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  }),
};

module.exports = { analyzeSchema };

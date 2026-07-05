const { z } = require('zod');

const getResultSchema = {
  query: z.object({
    lunchDrawId: z.string().uuid().optional(),
    teaDrawId: z.string().uuid().optional(),
  }),
};

module.exports = { getResultSchema };

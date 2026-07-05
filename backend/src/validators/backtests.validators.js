const { z } = require('zod');

const createBacktestSchema = {
  body: z.object({ engineCode: z.string() }),
};

const idParamSchema = {
  params: z.object({ id: z.string().uuid() }),
};

module.exports = { createBacktestSchema, idParamSchema };

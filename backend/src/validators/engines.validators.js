const { z } = require('zod');

const engineCodeParamSchema = {
  params: z.object({ code: z.string() }),
};

const patternIdParamSchema = {
  params: z.object({ code: z.string(), id: z.string().uuid() }),
};

module.exports = { engineCodeParamSchema, patternIdParamSchema };

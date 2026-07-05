const { z } = require('zod');

const drawTypeEnum = z.enum(['lunch', 'tea']);
const numbersSchema = z.array(z.number().int().min(1).max(49)).length(6);

const listDrawsSchema = {
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    type: drawTypeEnum.optional(),
  }),
};

const createDrawSchema = {
  body: z.object({
    drawDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD'),
    drawType: drawTypeEnum,
    numbers: numbersSchema,
    bonus: z.number().int().min(1).max(49),
  }),
};

const updateDrawSchema = {
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    numbers: numbersSchema.optional(),
    bonus: z.number().int().min(1).max(49).optional(),
  }),
};

const importDrawsSchema = {
  body: z.object({ draws: z.array(createDrawSchema.body) }),
};

const idParamSchema = {
  params: z.object({ id: z.string().uuid() }),
};

module.exports = { listDrawsSchema, createDrawSchema, updateDrawSchema, importDrawsSchema, idParamSchema };

const { z } = require('zod');

const createPostSchema = {
  body: z.object({
    title: z.string().min(1),
    target: z.string().optional().default(''),
    numbers: z.string().min(1),
    notes: z.string().optional(),
  }),
};

const idParamSchema = {
  params: z.object({ id: z.string().uuid() }),
};

module.exports = { createPostSchema, idParamSchema };

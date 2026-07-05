const { z } = require('zod');

const roleEnum = z.enum(['admin', 'manager', 'user']);

const createUserSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    displayName: z.string().min(1),
    role: roleEnum.default('user'),
  }),
};

const updateUserSchema = {
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    displayName: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
  }),
};

const updateRoleSchema = {
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ role: roleEnum }),
};

const idParamSchema = {
  params: z.object({ id: z.string().uuid() }),
};

module.exports = { createUserSchema, updateUserSchema, updateRoleSchema, idParamSchema };

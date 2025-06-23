import { z } from 'zod';

export const createBotSchema = z.object({
  name: z
    .string()
    .min(1, 'Bot name is required')
    .min(3, 'Bot name must be at least 3 characters')
    .max(50, 'Bot name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s-_]+$/, 'Bot name can only contain letters, numbers, spaces, hyphens, and underscores'),
  token: z
    .string()
    .min(1, 'Bot token is required')
    .regex(/^\d+:[A-Za-z0-9_-]{35}$/, 'Invalid bot token format. Should be like: 123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional()
});

export type CreateBotFormData = z.infer<typeof createBotSchema>;

import { z } from 'zod';

export const sendFriendRequestSchema = z.object({
  username: z.string().min(3).max(30),
});

export const respondFriendRequestSchema = z.object({
  accept: z.boolean(),
});

export const friendshipIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

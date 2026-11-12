import { z } from 'zod';
import { WORD_LENGTH } from '../utils/constants.js';

export const challengeDuelSchema = z.object({
  username: z.string().min(3).max(30),
});

export const respondDuelSchema = z.object({
  accept: z.boolean(),
});

export const duelGuessSchema = z.object({
  guess: z.string().length(WORD_LENGTH),
});

export const duelIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

import { z } from 'zod';
import { WORD_LENGTH } from '../utils/constants.js';

export const guessSchema = z.object({
  guess: z.string().length(WORD_LENGTH),
});

export type GuessInput = z.infer<typeof guessSchema>;

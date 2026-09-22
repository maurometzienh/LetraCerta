export type LetterStatus = 'correct' | 'present' | 'absent';

/**
 * Algoritmo clássico do Wordle: primeiro marca os acertos exatos,
 * depois resolve as letras "presentes" respeitando a contagem de
 * ocorrências restantes na palavra secreta (evita marcar amarelo
 * a mais quando a letra já foi toda consumida pelos verdes).
 */
export function evaluateGuess(guess: string, secret: string): LetterStatus[] {
  const guessLetters = guess.toLowerCase().split('');
  const secretLetters = secret.toLowerCase().split('');
  const result: LetterStatus[] = new Array(guessLetters.length).fill('absent');

  const remaining = new Map<string, number>();

  guessLetters.forEach((letter, index) => {
    if (letter === secretLetters[index]) {
      result[index] = 'correct';
    } else {
      const letterInSecret = secretLetters[index];
      remaining.set(letterInSecret, (remaining.get(letterInSecret) ?? 0) + 1);
    }
  });

  guessLetters.forEach((letter, index) => {
    if (result[index] === 'correct') return;
    const available = remaining.get(letter) ?? 0;
    if (available > 0) {
      result[index] = 'present';
      remaining.set(letter, available - 1);
    }
  });

  return result;
}

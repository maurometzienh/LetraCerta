const DICTIONARY_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/pt';
const TIMEOUT_MS = 3000;

/**
 * Consulta a Free Dictionary API para saber se uma palavra existe no português.
 * Retorna `true`/`false` quando a API responde normalmente, e `null` quando
 * não foi possível obter uma resposta confiável (timeout, API fora do ar,
 * erro inesperado) — nesses casos o chamador deve liberar o palpite em vez
 * de bloquear o jogo por causa de uma falha de terceiros.
 */
export async function checkWordExists(word: string): Promise<boolean | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${DICTIONARY_API_URL}/${encodeURIComponent(word)}`, {
      signal: controller.signal,
    });

    if (response.status === 404) return false;
    if (!response.ok) {
      console.warn(`[dictionaryClient] resposta inesperada (${response.status}) para "${word}"`);
      return null;
    }

    return true;
  } catch (err) {
    console.warn(`[dictionaryClient] falha ao consultar a API para "${word}":`, err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

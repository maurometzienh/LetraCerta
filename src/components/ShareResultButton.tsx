import { useState } from 'react';
import type { GameState } from '../types/game';
import { buildShareText } from '../utils/share';

interface ShareResultButtonProps {
  game: GameState;
  modeLabel: string;
}

export function ShareResultButton({ game, modeLabel }: ShareResultButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const text = buildShareText(game, modeLabel);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Permissão de clipboard pode ser negada pelo navegador; nesse caso não faz nada.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700"
    >
      {copied ? 'Copiado! ✅' : 'Compartilhar resultado 📋'}
    </button>
  );
}

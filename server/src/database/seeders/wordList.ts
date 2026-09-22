export const WORD_LIST: string[] = [
  // Lista original
  'sabor', 'carta', 'porta', 'lider', 'mundo', 'praia', 'ponte', 'amigo', 'campo', 'plano',
  'fogao', 'terra', 'papel', 'dente', 'verde', 'preto', 'claro', 'grito', 'luvas', 'corda',
  'nuvem', 'trigo', 'barco', 'forte', 'vidro', 'lenha', 'seiva', 'rocha', 'folha', 'chuva',
  'flor', 'gelo', 'aviso', 'balde', 'canto', 'dedal', 'elmos', 'fatia', 'girar', 'horta',
  'ideal', 'jogar', 'lacre', 'macio', 'novas', 'ombro', 'pacto', 'quase', 'rapaz', 'salto',
  'tesla', 'unido', 'vasto', 'xarpa', 'zebra', 'abrir', 'bolsa', 'cerca', 'dobra', 'estar',

  // Ampliação da lista
  'carro', 'gente', 'feliz', 'lento', 'mesmo', 'tempo', 'livro', 'lugar', 'longe', 'perto',
  'baixo', 'doces', 'fruta', 'fruto', 'prato', 'copos', 'garfo', 'facas', 'mesas', 'tetos',
  'muros', 'pedra', 'vento', 'calor', 'frios', 'lagos', 'ilhas', 'monte', 'vales', 'filho',
  'filha', 'amiga', 'aluno', 'aluna', 'turma', 'prova', 'notas', 'salas', 'telas', 'filme',
  'festa', 'bolos', 'peras', 'cocos', 'arroz', 'carne', 'peixe', 'sopas', 'sucos', 'leite',
  'couve', 'vagem', 'milho', 'feira', 'venda', 'troco', 'moeda', 'banco', 'trens', 'navio',
  'motos', 'pista', 'canoa', 'clara', 'altos', 'largo', 'curto', 'longo', 'leves', 'duros',
  'suave', 'fraco', 'veloz', 'calmo', 'bravo', 'medos', 'sonho', 'ideia', 'plana', 'certo',
  'certa', 'justo', 'justa', 'digno', 'firme', 'fraca', 'nobre', 'reino', 'reina', 'poder',
  'podes', 'posso', 'saber', 'sabem', 'sabia', 'avisa', 'falar', 'falam', 'falou', 'ouvir',
  'ouviu', 'olhar', 'olhou', 'andar', 'andou', 'pular', 'pulou', 'nadar', 'nadou', 'subir',
  'subiu', 'ficar', 'ficou', 'mudar', 'mudou', 'jogou', 'lutar', 'lutou', 'odiar', 'odiou',
  'achar', 'achou',
].filter((word, index, list) => word.length === 5 && list.indexOf(word) === index);

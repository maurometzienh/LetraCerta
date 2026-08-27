# LetraCerta

LetraCerta é um jogo de adivinhação de palavras (estilo Wordle/Termo). Este repositório contém, por enquanto, apenas a estrutura base do front-end — sem a lógica do jogo implementada.

## Stack

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [TailwindCSS](https://tailwindcss.com/)

## Estrutura de pastas

```
src/
  components/   # Componentes reutilizáveis de UI
  pages/        # Páginas/telas da aplicação
  hooks/        # Hooks customizados
  services/     # Integrações externas, chamadas de API, etc.
  types/        # Tipos e interfaces TypeScript compartilhados
  styles/       # Estilos globais/auxiliares além do index.css
```

## Como rodar localmente

Pré-requisitos: [Node.js](https://nodejs.org/) 18+ e npm.

```bash
# 1. Instalar as dependências
npm install

# 2. Rodar o servidor de desenvolvimento
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

### Outros comandos

```bash
# Gerar build de produção em dist/
npm run build

# Pré-visualizar o build de produção localmente
npm run preview

# Rodar o linter
npm run lint
```

## Deploy

O projeto é compatível com qualquer plataforma de hosting estático (Vercel, Netlify, Render, etc.). O comando de build é `npm run build` e a pasta de saída é `dist/`.

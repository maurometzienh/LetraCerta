# LetraCerta

LetraCerta é um jogo de adivinhação de palavras (estilo Wordle/Termo). O jogador tem 6 tentativas para descobrir a palavra secreta de 5 letras sorteada diariamente, recebendo feedback visual a cada palpite:

- 🟩 **Verde**: letra correta na posição correta
- 🟨 **Amarelo**: letra correta na posição errada
- ⬛ **Cinza**: letra que não pertence à palavra

O sistema possui cadastro/login de usuários, histórico de partidas, estatísticas (vitórias, sequência de acertos, distribuição de tentativas) e ranking dos jogadores.

Existem três modos de jogo:

- **Palavra do dia**: uma única palavra sorteada por dia, igual para todos os jogadores (conta para estatísticas e ranking).
- **Palavra aleatória**: modo livre/treino — a qualquer momento o jogador pode sortear uma nova palavra e jogar quantas vezes quiser. Não afeta a palavra do dia nem entra nas estatísticas/ranking.
- **Duelo**: desafie um amigo pra uma corrida 1x1 com a mesma palavra secreta. Cada um vê o próprio tabuleiro normalmente, e o progresso do adversário num painel ao lado — só os quadradinhos de cor (🟩🟨⬜) de cada tentativa dele, nunca as palavras que ele digitou. Quem acerta primeiro vence a partida.

Outras funcionalidades:

- **Lista de amigos**: busca por nome de usuário, pedidos de amizade (enviar/aceitar/recusar).
- **Validação de palavras reais**: os palpites são conferidos contra uma API de dicionário externa — não dá pra "forçar" o jogo digitando qualquer sequência de letras.
- **Compartilhar resultado**: depois de uma partida (palavra do dia ou aleatória), copia pro clipboard um resumo em emojis estilo Wordle.

## Stack

| Camada       | Tecnologia                            |
| ------------ | -------------------------------------- |
| Front-end    | React + TypeScript + TailwindCSS (Vite) |
| Back-end     | Node.js + TypeScript + Fastify         |
| ORM          | MikroORM                               |
| Banco de dados | PostgreSQL                           |
| Integração externa | [Free Dictionary API](https://dictionaryapi.dev/) (validação de palavras em português, sem necessidade de chave) |

## Arquitetura

O projeto é dividido em dois workspaces independentes:

```
/                 # Front-end (React + TS + Tailwind)
  src/
    components/   # Componentes reutilizáveis de UI (Board, Keyboard, Navbar, ...)
    pages/        # Páginas (Home/Jogo, Login, Registro, Ranking)
    hooks/        # Hooks customizados (AuthContext, useGame, useStats, useRanking)
    services/     # Cliente HTTP e chamadas à API do backend
    types/        # Tipos TypeScript compartilhados
    utils/        # Constantes (tamanho da palavra, nº de tentativas)

/server           # Back-end (Node + TypeScript + Fastify + MikroORM)
  src/
    domain/entities/  # Entidades MikroORM (User, Word, DailyWord, Game, Attempt, Friendship, Duel, DictionaryCache)
    repositories/     # Camada de acesso a dados (uma classe por entidade)
    services/         # Regras de negócio (Auth, DailyWord, Game, WordFeedback, Stats, Ranking, Dictionary, Friendship, Duel)
    controllers/       # Camada de apresentação: recebe a request e delega ao service
    routes/            # Definição das rotas Fastify e amarração dos controllers
    middlewares/        # Autenticação JWT e tratamento centralizado de erros
    dtos/               # Schemas de validação de entrada (Zod)
    database/           # Sincronização de schema e seed de palavras
    infra/              # Configuração e bootstrap do MikroORM
```

O back-end segue uma **arquitetura em camadas** clássica:

```
Rotas → Controllers → Services (regra de negócio) → Repositories (acesso a dados via MikroORM) → Banco de Dados
```

Cada camada só conhece a camada imediatamente abaixo dela (os controllers não montam queries, os services não sabem nada de HTTP, os repositórios não têm regra de negócio).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [PostgreSQL](https://www.postgresql.org/) 14+ (local ou via Docker)

## Como rodar localmente

### 1. Banco de dados

Suba um PostgreSQL local com Docker Compose (mais simples):

```bash
docker compose up -d
```

Isso cria um banco `letracerta` acessível em `localhost:5432` com usuário/senha `letracerta`/`letracerta` (veja `docker-compose.yml`).

Se preferir usar um PostgreSQL já instalado na máquina, crie manualmente um banco e ajuste a `DATABASE_URL` no passo seguinte.

### 2. Back-end

```bash
cd server
cp .env.example .env   # ajuste DATABASE_URL/JWT_SECRET se necessário
npm install
npm run db:sync        # cria as tabelas no banco a partir das entidades
npm run seed            # popula a tabela de palavras (5 letras)
npm run dev              # sobe a API em http://localhost:3333
```

### 3. Front-end

Em outro terminal, na raiz do projeto:

```bash
cp .env.example .env   # já aponta para http://localhost:3333/api por padrão
npm install
npm run dev              # sobe o app em http://localhost:5173
```

Acesse `http://localhost:5173`, crie uma conta e jogue a palavra do dia.

### Outros comandos

**Front-end** (raiz do projeto):

```bash
npm run build     # build de produção em dist/
npm run preview   # pré-visualiza o build
npm run lint       # linter
```

**Back-end** (pasta `server/`):

```bash
npm run build   # compila TypeScript para dist/
npm run start   # roda a versão compilada (produção)
npm run db:sync # sincroniza o schema do banco com as entidades MikroORM
npm run seed    # roda o seed de palavras novamente (idempotente)
```

## Variáveis de ambiente

**`server/.env`**

| Variável       | Descrição                                      |
| -------------- | ------------------------------------------------ |
| `PORT`         | Porta da API (padrão `3333`)                     |
| `DATABASE_URL` | String de conexão do PostgreSQL                  |
| `JWT_SECRET`   | Segredo usado para assinar os tokens JWT          |
| `CORS_ORIGIN`  | Origem permitida pelo CORS (URL do front-end)     |

**`.env`** (raiz, front-end)

| Variável       | Descrição                     |
| -------------- | -------------------------------- |
| `VITE_API_URL` | URL base da API (ex.: `http://localhost:3333/api`) |

## Principais endpoints da API

| Método | Rota                | Descrição                                   | Autenticado |
| ------ | -------------------- | --------------------------------------------- | ----------- |
| POST   | `/api/auth/register`  | Cria uma conta                                 | não         |
| POST   | `/api/auth/login`     | Autentica e retorna um JWT                     | não         |
| GET    | `/api/auth/me`        | Dados do usuário logado                        | sim         |
| GET    | `/api/games/today`    | Estado da partida do dia do usuário            | sim         |
| POST   | `/api/games/guess`    | Envia um palpite na palavra do dia (`{ "guess": "carta" }`) | sim |
| GET    | `/api/games/random/current` | Estado da partida aleatória em andamento (ou `null`) | sim   |
| POST   | `/api/games/random/start`   | Sorteia uma nova palavra e inicia uma partida avulsa | sim   |
| POST   | `/api/games/random/guess`   | Envia um palpite na partida aleatória atual    | sim         |
| GET    | `/api/stats/me`       | Estatísticas do usuário (vitórias, streak, distribuição de tentativas) — apenas modo palavra do dia | sim |
| GET    | `/api/ranking`        | Ranking dos jogadores por vitórias — apenas modo palavra do dia | não |
| GET    | `/api/friends`        | Lista de amigos                                | sim         |
| GET    | `/api/friends/requests` | Pedidos de amizade pendentes recebidos       | sim         |
| POST   | `/api/friends/requests` | Envia um pedido de amizade (`{ "username": "..." }`) | sim   |
| POST   | `/api/friends/requests/:id/respond` | Aceita/recusa um pedido (`{ "accept": true }`) | sim |
| POST   | `/api/duels/challenge` | Desafia um amigo pra um duelo (`{ "username": "..." }`) | sim    |
| GET    | `/api/duels/pending`  | Convites de duelo pendentes recebidos          | sim         |
| GET    | `/api/duels/active`   | Id do duelo em andamento do usuário, se houver | sim         |
| POST   | `/api/duels/:id/respond` | Aceita/recusa um convite de duelo (`{ "accept": true }`) | sim |
| GET    | `/api/duels/:id`      | Estado do duelo: meu jogo completo + progresso do adversário (só emojis) | sim |
| POST   | `/api/duels/:id/guess` | Envia um palpite no duelo                     | sim         |

## Modos de jogo e multiplayer

O duelo é implementado por polling: o front consulta `GET /api/duels/:id` a cada ~3 segundos enquanto a partida está em andamento, pra atualizar o progresso do adversário sem precisar de WebSocket. Cada jogador tem sua própria `Game` (reaproveitando toda a lógica de validação/avaliação de palpite do modo normal), vinculada ao mesmo `Duel` e à mesma palavra secreta. Quando alguém acerta, a partida do outro jogador é automaticamente encerrada (derrota por "corrida perdida"), e se os dois esgotarem as tentativas sem acertar, o duelo termina em empate.

## Deploy

- **Front-end**: qualquer hosting estático (Vercel, Netlify, Render Static Site). Build command: `npm run build`, publish directory: `dist`. Configure `VITE_API_URL` apontando para a URL pública da API.
- **Back-end**: Render, Railway ou qualquer serviço que rode Node.js. Build command: `npm run build`, start command: `npm run start`. Configure `DATABASE_URL`, `JWT_SECRET` e `CORS_ORIGIN` (com a URL do front-end publicado) como variáveis de ambiente, e provisione um PostgreSQL gerenciado (Render Postgres, Railway Postgres, Supabase, etc). Rode `npm run db:sync` e `npm run seed` uma vez contra o banco de produção antes do primeiro uso.

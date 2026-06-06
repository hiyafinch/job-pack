# Job Pack

A full-stack web app that takes a pasted job description and candidate profile and generates three tailored artifacts: a customized resume PDF, a cover letter PDF, and a company fit infographic (SVG). Drafts are saved server-side and can be reopened, edited, and compared side by side.

## Live deployment

- Frontend: https://rococo-genie-3daa9d.netlify.app
- Backend: https://job-pack-tbnl.onrender.com (free tier, spins down after 15 min — visit `/api/drafts` first to wake it)

## Demo video

https://youtu.be/dQjsK1q4VqQ

## Tech stack

- Backend: Node.js, Koa
- Frontend: Lit Element (web components)
- Database: SQLite (via Node built-in `node:sqlite`)
- PDF generation: pdfkit
- LLM: Ollama API (swappable via Strategy pattern)

## Setup

### Prerequisites

- Node.js 22 or higher
- An Ollama account with an API key (free at ollama.com)

### Installation

```bash
git clone https://github.com/hiyafinch/job-pack.git
cd job-pack
npm install
```

### Configuration

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` and set your values:

```
LLM_BACKEND=ollama-hosted
OLLAMA_API_KEY=your-ollama-api-key
OLLAMA_API_URL=https://ollama.com/api/generate
OLLAMA_MODEL=gpt-oss:120b
PORT=3000
```

The API key must never be committed to the repo. The `.env` file is in `.gitignore`.

### Run

```bash
npm start
```

Then open `http://localhost:3000` in your browser.

## Swapping LLM backends

The backend is swappable via a single config change in `.env`. No code modification required.

| `LLM_BACKEND` value | Adapter class | Backend used |
|---|---|---|
| `ollama-hosted` | `OllamaHostedAdapter` | Class Ollama endpoint (default) |
| `claude-api` | `ClaudeApiAdapter` | Anthropic Claude API |
| `ollama-local` | `OllamaLocalAdapter` | Local Ollama instance at localhost:11434 |

For `claude-api`, add your Claude API key to `.env`:
```
CLAUDE_API_KEY=your-claude-api-key
```

## Design patterns

### Strategy (GoF)
The LLM backend is selected via the Strategy pattern. `LLMBackend.js` defines the interface. `OllamaHostedAdapter`, `ClaudeApiAdapter`, and `OllamaLocalAdapter` are the three concrete strategies. Switching backends requires only a one-line change in `.env` with zero code modification.

### Facade (GoF)
`JobPackService.js` exposes a single `generateJobPack(jobDescription, candidateProfile)` method. This hides the complexity of three parallel LLM calls, PDF generation, and SQLite persistence from the Koa routes.

### Factory Method (GoF)
`createLLMBackend()` in `server/services/JobPackService.js` reads `LLM_BACKEND` from the environment at startup and returns the correct adapter instance. Adding a new backend requires only a new adapter class and one new case in the factory.

### Pipes and Filters (Enterprise Integration Pattern)
The LLM generation pipeline in `server/services/pipeline.js` runs as a sequence of discrete stages: `buildPrompt` → `callLLM` → `parseResponse`. Each stage does one thing and passes its output to the next.

## Perfect Framework concerns

### Secrets management
The Ollama API key is stored in `.env` only, never committed, and listed in `.gitignore`. The app reads it at runtime via `process.env.OLLAMA_API_KEY`.

### Persistence
Drafts are saved server-side in SQLite. Users can save, reopen, edit, and compare multiple drafts for the same job via a side-by-side compare view in the UI.

## Tests

```bash
node --test
```

31 tests passing using Node's built-in test runner.

## Project structure

```
job-pack/
├── client/               Frontend (Lit Element SPA)
├── server/
│   ├── adapters/         Strategy pattern LLM backends
│   ├── services/         Facade, Factory Method, and pipeline
│   ├── generators/       PDF and SVG generators
│   ├── db/               SQLite draft persistence
│   └── routes/           Koa REST API endpoints
├── docs/
│   └── presentation.md   Sprint 1 presentation summary
├── .env.example          Environment variable template
├── .gitignore
└── README.md
```

## AI citations

All files scaffolded by Claude Code include a citation comment at line 1.

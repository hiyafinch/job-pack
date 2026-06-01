# Job Pack

A single-user web application that takes a pasted job description and candidate profile and generates three tailored artifacts: a resume PDF, a cover letter PDF, and a company-fit infographic (SVG).

## Setup

### Prerequisites

- Node.js 22 or higher
- An Ollama account with an API key (free at ollama.com)

### Installation

```bash
git clone https://github.com/uvucs3660/kiddethan.git
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

| `LLM_BACKEND` value | Backend used |
|---|---|
| `ollama-hosted` | Class Ollama endpoint (default) |
| `claude-api` | Anthropic Claude API |
| `ollama-local` | Local Ollama instance at localhost:11434 |

For `claude-api`, add your Claude API key to `.env`:
```
CLAUDE_API_KEY=your-claude-api-key
```

For `ollama-local`, make sure Ollama is running locally before starting the server.

## Design patterns used

### Strategy (GoF)
The LLM backend is selected via the Strategy pattern. `LLMBackend.js` defines the interface. `OllamaHostedAdapter`, `ClaudeApiAdapter`, and `OllamaLocalAdapter` are the concrete strategies. The factory in `server/index.js` reads `LLM_BACKEND` from the environment and instantiates the correct adapter. The rest of the application never knows which backend is active.

### Facade (GoF)
`JobPackService.js` exposes a single `generateJobPack(jobDescription, candidateProfile)` method. This hides the complexity of calling the LLM three times, parsing three different responses, generating three output files, and persisting the draft. The Koa routes only talk to the facade.

### Pipes and Filters (Enterprise Integration Pattern)
The LLM generation pipeline in `services/pipeline.js` is structured as a sequential pipeline: `buildPrompt` → `callLLM` → `parseResponse`. Each stage is a discrete function that takes input and passes its output to the next stage.

## Perfect Framework concerns addressed

### Secrets management
The API key is stored in `.env` only, never in code. `.env` is in `.gitignore`. The app reads the key via `process.env.OLLAMA_API_KEY` at runtime.

### Persistence
Drafts are saved server-side in SQLite. Users can save, reopen, edit, and compare multiple drafts for the same job via the draft viewer in the UI.

## Project structure

```
job-pack/
├── client/               Frontend (Lit Element SPA)
├── server/
│   ├── adapters/         Strategy pattern LLM backends
│   ├── services/         Facade and pipeline
│   ├── generators/       PDF and SVG generators
│   ├── db/               SQLite draft persistence
│   └── routes/           Koa REST API endpoints
├── .env.example          Environment variable template
├── .gitignore
└── README.md
```

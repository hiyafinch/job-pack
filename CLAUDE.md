# Job Pack — Sprint 1

## What we are building

A single-user web application that takes a pasted job description and a pasted candidate profile and produces three artifacts:

1. A customized resume PDF matched to the job
2. A customized cover letter PDF addressed to the company
3. A one-page company-fit infographic (SVG or PNG) summarizing pros and cons of working there

## Tech stack

- **Frontend**: Lit Element (web components, served as static HTML)
- **Backend**: Node.js with Koa
- **Database**: SQLite (for simplicity and portability — no external DB needed)
- **LLM**: Ollama API (primary), Claude API (secondary backend via Adapter)
- **PDF generation**: pdfkit or puppeteer
- **Deployment**: Netlify (frontend) + backend on a single process

## Architecture

The backend exposes a REST API. The frontend is a Lit Element single-page app that talks to the backend. The LLM backend is swappable via the Strategy pattern — a config value in .env determines which adapter is used.

```
frontend (Lit Element) -> Koa REST API -> LLM Adapter (Strategy) -> Ollama / Claude API
                                       -> SQLite (draft persistence)
                                       -> PDF generator
```

## Design patterns to implement

### GoF Patterns (required in code, will be verified by LLM grader)

1. **Strategy** — LLM backend selection. Define a common interface (e.g., `LLMBackend`) with a `generate(prompt)` method. Implement three concrete strategies:
   - `OllamaHostedAdapter` — calls the class Ollama endpoint
   - `ClaudeApiAdapter` — calls the Claude API
   - `OllamaLocalAdapter` — calls a local Ollama instance
   Switching backends is a `.env` config change only. Zero code modification.

2. **Facade** — A single `JobPackService` class that exposes one method: `generateJobPack(jobDescription, candidateProfile)`. This hides the complexity of calling the LLM three times, generating three PDFs, and saving drafts. The frontend only talks to this facade.

### Enterprise Integration Pattern (required)

**Pipes and Filters** — The LLM generation pipeline should be structured as a pipeline:
```
Input -> Prompt Builder -> LLM Call -> Response Parser -> PDF Generator -> Output
```
Each stage is a discrete function that takes input and passes output to the next stage.

### Perfect Framework concerns (required, at least 2)

1. **Secrets management** — API key stored in `.env`, never committed. `.env` in `.gitignore`. App reads key via `process.env.OLLAMA_API_KEY`.
2. **Persistence** — Drafts saved server-side in SQLite. Users can save, reopen, edit, and compare at least 2 drafts for the same job.
3. **Deployment** — Frontend deployable to Netlify. Backend runs as a single Node process.
4. **Authentication** — Authenticated calls to class LLM endpoint use the student API key from `.env`.

## API endpoints (Koa REST)

- `POST /api/generate` — takes jobDescription and candidateProfile, returns draft ID
- `GET /api/drafts` — returns list of saved drafts
- `GET /api/drafts/:id` — returns a specific draft
- `POST /api/drafts/:id/save` — saves edits to a draft
- `GET /api/drafts/:id/resume.pdf` — returns the resume PDF
- `GET /api/drafts/:id/coverletter.pdf` — returns the cover letter PDF
- `GET /api/drafts/:id/infographic.svg` — returns the infographic

## Environment variables

```
LLM_BACKEND=ollama-hosted   # options: ollama-hosted, claude-api, ollama-local
OLLAMA_API_KEY=your-key-here
CLAUDE_API_KEY=your-key-here
OLLAMA_API_URL=https://ollama.com/api/generate
OLLAMA_MODEL=gpt-oss:120b
PORT=3000
```

## File structure

```
job-pack/
├── CLAUDE.md
├── .env                  (never commit)
├── .env.example          (commit this)
├── .gitignore
├── package.json
├── README.md
├── client/
│   ├── index.html
│   └── src/
│       └── job-pack-app.js   (Lit Element root component)
├── server/
│   ├── index.js              (Koa server entry point)
│   ├── routes/
│   │   └── api.js
│   ├── services/
│   │   ├── JobPackService.js  (Facade)
│   │   └── pipeline.js        (Pipes and Filters)
│   ├── adapters/
│   │   ├── LLMBackend.js      (Strategy interface)
│   │   ├── OllamaHostedAdapter.js
│   │   ├── ClaudeApiAdapter.js
│   │   └── OllamaLocalAdapter.js
│   ├── db/
│   │   └── drafts.js          (SQLite draft persistence)
│   └── generators/
│       ├── resumePDF.js
│       ├── coverLetterPDF.js
│       └── infographic.js
└── docs/
    └── sprint1-requirements.md
```

## Important constraints

- Inputs are pasted text only. No scraping LinkedIn, Indeed, or any third-party site.
- API key must never be committed to the repo. Use .env only.
- Draft persistence is required. Users must be able to save, reopen, edit, and compare at least 2 drafts for the same job.
- The app must be deployable. Frontend on Netlify, backend as a single process.

## Demo day

June 1, 2026. 12 minutes live demo plus 3 minutes Q&A. Bring a real job description and your own candidate profile to demo with.

# Sprint 1 Presentation — Job Pack

## Demo Video

https://youtu.be/dQjsK1q4VqQ

## Topics Covered

### What the app does
Job Pack takes a pasted job description and candidate profile and generates three tailored artifacts: a customized resume PDF, a cover letter PDF, and a company fit infographic (SVG). Drafts are saved server-side and can be reopened, edited, and compared.

### GoF Design Patterns

**Strategy** — The LLM backend is swappable via the Strategy pattern. Three concrete adapters implement a common `generate(prompt)` interface: `OllamaHostedAdapter` (class Ollama endpoint), `ClaudeApiAdapter` (Anthropic API), and `OllamaLocalAdapter` (local Ollama). Switching backends is a single line change in `.env` with zero code modification.

**Facade** — `JobPackService` exposes a single `generateJobPack(jobDescription, candidateProfile)` method that hides the complexity of three LLM calls, PDF generation, and SQLite persistence. The Koa routes only interact with this facade.

### Enterprise Integration Pattern

**Pipes and Filters** — The LLM generation pipeline in `server/services/pipeline.js` runs as a sequence of discrete stages: `buildPrompt` → `callLLM` → `parseResponse`. Each stage does one thing and passes its output forward.

### Perfect Framework Concerns

**Secrets management** — The Ollama API key is stored in `.env`, never committed, and listed in `.gitignore`. The app reads it at runtime via `process.env.OLLAMA_API_KEY`.

**Persistence** — Drafts are saved server-side in SQLite. Users can save, reopen, edit, and compare multiple drafts for the same job via a side-by-side compare view.

### Deployment
- Frontend: Netlify (https://rococo-genie-3daa9d.netlify.app)
- Backend: Render (https://job-pack-tbnl.onrender.com)

# Sprint 1 Presentation — Job Pack

## Demo Video

https://youtu.be/dQjsK1q4VqQ

## Summary

The presentation opened with an overview of what Job Pack does and a live demo of the fully deployed application. Starting from the Netlify frontend, a job description for a Senior Software Engineer role at Meridian AI and a candidate profile were pasted in and generated live. The resulting resume PDF, cover letter PDF, and company fit infographic were shown and downloaded. A second draft was generated to demonstrate the draft save and compare feature, showing two resumes side by side.

The second half of the presentation covered the architecture and design patterns. The Strategy pattern was explained in the context of the swappable LLM backends, the Facade pattern in the context of the JobPackService, and the Pipes-and-Filters enterprise integration pattern in the context of the generation pipeline. The two Perfect Framework concerns addressed — secrets management and persistence — were explained with reference to the .env setup and SQLite draft storage. The presentation closed with the deployment overview covering Netlify for the frontend and Render for the backend.

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

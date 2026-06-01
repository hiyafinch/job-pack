# Sprint 1 Requirements

## Brief

Build a single-user web application that takes a pasted job description and a pasted candidate profile and produces:
1. A customized resume PDF matched to the job
2. A customized cover letter PDF addressed to the company
3. A one-page company-fit infographic (SVG or PNG)

## Mandatory technical requirements

- LLM backend selectable via the Strategy pattern, supporting at least two of: hosted class Ollama (default), Claude API, raw local Ollama. Switching backend is a config-only change with zero code modification.
- Drafts persist server-side. Users can save, reopen, edit, and compare 2 or more drafts for the same job.
- Deployable. Frontend on Netlify or uvucs.org. Backend either embedded (single process) or split.
- Inputs are pasted text only. No scraping LinkedIn, Indeed, or any other third-party site.
- Authenticated calls to the class LLM endpoint use the student API key from a .env file. The key must never be committed.

## Vernacular requirements (must be named and explained in demo)

- 2 or more GoF design patterns used in the codebase (Strategy is a freebie, pick another)
- 1 or more Enterprise Integration Pattern used in the LLM pipeline (Pipes-and-Filters is the easy one)
- 2 or more Perfect Framework concerns addressed (auth, persistence, deploy, secrets management, etc.)

## Stretch goals (bonus up to 10%)

- Multilingual resume output
- Accessibility audit pass (WCAG AA)
- Automated regression test suite with non-trivial coverage

## Deliverables checklist

- Working app deployed and reachable from a public URL
- Source code in repo with tagged final commit `sprint-1-final`
- README documenting setup, the LLM backend used, and how to swap backends
- Individual reflection (500 words max) at sprints/sprint-1-reflection.md in personal portfolio repo, due 24 hours after demo day

## Demo format

12 minutes live demo plus 3 minutes Q&A. Bring a real job description and your own profile to demo with.

## Due date

Demo day: Monday June 1, 2026 (in class)

import Router from 'koa-router';
import { JobPackService } from '../services/JobPackService.js';
import { getDraft, listDrafts, saveDraftEdits } from '../db/drafts.js';
import { generateResumePDF } from '../generators/resumePDF.js';
import { generateCoverLetterPDF } from '../generators/coverLetterPDF.js';
import { generateInfographic } from '../generators/infographic.js';

const router = new Router({ prefix: '/api' });
const service = new JobPackService();

// POST /api/generate — kick off generation, returns draft ID
router.post('/generate', async (ctx) => {
  const { jobDescription, candidateProfile } = ctx.request.body;
  if (!jobDescription || !candidateProfile) {
    ctx.status = 400;
    ctx.body = { error: 'jobDescription and candidateProfile are required' };
    return;
  }
  const { draftId } = await service.generateJobPack(jobDescription, candidateProfile);
  ctx.body = { draftId };
});

// GET /api/drafts — list all drafts
router.get('/drafts', async (ctx) => {
  ctx.body = listDrafts();
});

// GET /api/drafts/:id — get one draft
router.get('/drafts/:id', async (ctx) => {
  const draft = getDraft(Number(ctx.params.id));
  if (!draft) { ctx.status = 404; ctx.body = { error: 'Not found' }; return; }
  ctx.body = draft;
});

// POST /api/drafts/:id/save — save edits
router.post('/drafts/:id/save', async (ctx) => {
  const { label, resumeText, coverLetterText } = ctx.request.body;
  saveDraftEdits(Number(ctx.params.id), { label, resumeText, coverLetterText });
  ctx.body = { ok: true };
});

// GET /api/drafts/:id/resume.pdf
router.get('/drafts/:id/resume.pdf', async (ctx) => {
  const draft = getDraft(Number(ctx.params.id));
  if (!draft?.resume_text) { ctx.status = 404; ctx.body = 'Not found'; return; }
  const pdf = await generateResumePDF(draft.resume_text);
  ctx.set('Content-Type', 'application/pdf');
  ctx.set('Content-Disposition', `attachment; filename="resume-${draft.id}.pdf"`);
  ctx.body = pdf;
});

// GET /api/drafts/:id/coverletter.pdf
router.get('/drafts/:id/coverletter.pdf', async (ctx) => {
  const draft = getDraft(Number(ctx.params.id));
  if (!draft?.cover_letter_text) { ctx.status = 404; ctx.body = 'Not found'; return; }
  const pdf = await generateCoverLetterPDF(draft.cover_letter_text);
  ctx.set('Content-Type', 'application/pdf');
  ctx.set('Content-Disposition', `attachment; filename="coverletter-${draft.id}.pdf"`);
  ctx.body = pdf;
});

// GET /api/drafts/:id/infographic.svg
router.get('/drafts/:id/infographic.svg', async (ctx) => {
  const draft = getDraft(Number(ctx.params.id));
  if (!draft?.infographic_data) { ctx.status = 404; ctx.body = 'Not found'; return; }
  const data = JSON.parse(draft.infographic_data);
  const svg = generateInfographic(data);
  ctx.set('Content-Type', 'image/svg+xml');
  ctx.body = svg;
});

export default router;

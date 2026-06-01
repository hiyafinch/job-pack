import 'dotenv/config';
import Koa from 'koa';
import { koaBody } from 'koa-body';
import serve from 'koa-static';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = new Koa();
const PORT = process.env.PORT || 3000;

app.use(koaBody());
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());
app.use(serve(path.join(__dirname, '../client')));

app.listen(PORT, () => {
  console.log(`Job Pack server running on http://localhost:${PORT}`);
  console.log(`LLM backend: ${process.env.LLM_BACKEND || 'ollama-hosted'}`);
});

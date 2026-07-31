import type { Connect, Plugin } from 'vite';
import type { ServerResponse } from 'node:http';
import {
  addSubmission,
  deleteSubmission,
  listSubmissions,
  updateSubmission,
} from './store';

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function handleApi(
  req: Connect.IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const url = new URL(req.url || '/', 'http://localhost');
  if (!url.pathname.startsWith('/api/')) return false;

  const method = (req.method || 'GET').toUpperCase();

  if (url.pathname === '/api/health' && method === 'GET') {
    sendJson(res, 200, {
      ok: true,
      mode: 'local-json',
      count: listSubmissions().length,
    });
    return true;
  }

  if (url.pathname === '/api/submissions' && method === 'GET') {
    sendJson(res, 200, { ok: true, submissions: listSubmissions() });
    return true;
  }

  if (url.pathname === '/api/submissions' && method === 'POST') {
    try {
      const raw = await readBody(req);
      const payload = JSON.parse(raw || '{}');
      const saved = addSubmission(payload);
      sendJson(res, 201, { ok: true, submission: saved });
    } catch (e) {
      sendJson(res, 400, {
        ok: false,
        error: e instanceof Error ? e.message : 'Invalid payload',
      });
    }
    return true;
  }

  const idMatch = url.pathname.match(/^\/api\/submissions\/([^/]+)$/);
  if (idMatch && method === 'PATCH') {
    try {
      const raw = await readBody(req);
      const patch = JSON.parse(raw || '{}');
      const updated = updateSubmission(decodeURIComponent(idMatch[1]), patch);
      if (!updated) sendJson(res, 404, { ok: false, error: 'Not found' });
      else sendJson(res, 200, { ok: true, submission: updated });
    } catch (e) {
      sendJson(res, 400, {
        ok: false,
        error: e instanceof Error ? e.message : 'Invalid payload',
      });
    }
    return true;
  }

  if (idMatch && method === 'DELETE') {
    const ok = deleteSubmission(decodeURIComponent(idMatch[1]));
    sendJson(res, ok ? 200 : 404, { ok });
    return true;
  }

  sendJson(res, 404, { ok: false, error: 'Not found' });
  return true;
}

export function feedbackLocalApiPlugin(): Plugin {
  const attach = (server: { middlewares: Connect.Server }) => {
    server.middlewares.use(async (req, res, next) => {
      try {
        if (req.url?.startsWith('/api/')) {
          const handled = await handleApi(req, res);
          if (handled) return;
        }
      } catch (e) {
        console.error('[feedback-api]', e);
        sendJson(res, 500, { ok: false, error: 'Server error' });
        return;
      }
      next();
    });
  };

  return {
    name: 'feedback-local-api',
    configureServer: attach,
    configurePreviewServer: attach,
  };
}

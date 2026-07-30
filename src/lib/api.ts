import { FeedbackSubmission } from '../types';

type ListResponse = {
  ok: boolean;
  submissions?: FeedbackSubmission[];
  error?: string;
};

type SaveResponse = {
  ok: boolean;
  submission?: FeedbackSubmission;
  error?: string;
};

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T;
  return data;
}

/** Primary storage for CN / no-VPN: local server JSON file via /api */
export async function fetchSubmissions(): Promise<FeedbackSubmission[]> {
  const res = await fetch('/api/submissions', { cache: 'no-store' });
  if (!res.ok) throw new Error(`GET /api/submissions ${res.status}`);
  const data = await parseJson<ListResponse>(res);
  if (!data.ok || !data.submissions) throw new Error(data.error || 'list failed');
  return data.submissions;
}

export async function postSubmission(
  submission: Omit<FeedbackSubmission, 'id'> & { id?: string }
): Promise<FeedbackSubmission> {
  const res = await fetch('/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission),
  });
  if (!res.ok) throw new Error(`POST /api/submissions ${res.status}`);
  const data = await parseJson<SaveResponse>(res);
  if (!data.ok || !data.submission) throw new Error(data.error || 'save failed');
  return data.submission;
}

export async function patchSubmission(
  id: string,
  patch: Partial<FeedbackSubmission>
): Promise<FeedbackSubmission> {
  const res = await fetch(`/api/submissions/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`PATCH /api/submissions ${res.status}`);
  const data = await parseJson<SaveResponse>(res);
  if (!data.ok || !data.submission) throw new Error(data.error || 'patch failed');
  return data.submission;
}

export async function removeSubmission(id: string): Promise<void> {
  const res = await fetch(`/api/submissions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`DELETE /api/submissions ${res.status}`);
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health', { cache: 'no-store' });
    if (!res.ok) return false;
    const data = (await res.json()) as { ok?: boolean };
    return !!data.ok;
  } catch {
    return false;
  }
}

/** Poll local API for dashboard live updates (no Firebase needed) */
export function pollSubmissions(
  callback: (submissions: FeedbackSubmission[]) => void,
  intervalMs = 2000
): () => void {
  let stopped = false;
  let timer: number | null = null;

  const tick = async () => {
    if (stopped) return;
    try {
      const list = await fetchSubmissions();
      if (!stopped) callback(list);
    } catch (e) {
      console.warn('[api] poll failed', e);
    } finally {
      if (!stopped) {
        timer = window.setTimeout(tick, intervalMs);
      }
    }
  };

  tick();
  return () => {
    stopped = true;
    if (timer) window.clearTimeout(timer);
  };
}

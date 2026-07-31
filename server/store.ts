import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type StoredSubmission = {
  id?: string;
  name: string;
  email: string;
  company: string;
  businessUnit: string;
  q1Rating: number;
  q2Helpful: string;
  q3Matrix: Record<string, number>;
  q4Favorite: string;
  q5Expectations: string[];
  q5OtherText?: string;
  q6Suggestions: string;
  timestamp: string;
  persona: string;
  isHidden?: boolean;
};

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(rootDir, '../data');
const dataFile = path.join(dataDir, 'submissions.json');

function ensureStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '[]', 'utf8');
  }
}

export function readSubmissions(): StoredSubmission[] {
  ensureStore();
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSubmissions(list: StoredSubmission[]) {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(list, null, 2), 'utf8');
}

export function listSubmissions(): StoredSubmission[] {
  return readSubmissions().sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

export function addSubmission(
  payload: Omit<StoredSubmission, 'id'> & { id?: string }
): StoredSubmission {
  const list = readSubmissions();
  const doc: StoredSubmission = {
    ...payload,
    id: payload.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: payload.timestamp || new Date().toISOString(),
    isHidden: payload.isHidden ?? false,
  };
  list.push(doc);
  writeSubmissions(list);
  return doc;
}

export function updateSubmission(
  id: string,
  patch: Partial<StoredSubmission>
): StoredSubmission | null {
  const list = readSubmissions();
  const idx = list.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], ...patch, id };
  writeSubmissions(list);
  return list[idx];
}

export function deleteSubmission(id: string): boolean {
  const list = readSubmissions();
  const next = list.filter((s) => s.id !== id);
  if (next.length === list.length) return false;
  writeSubmissions(next);
  return true;
}

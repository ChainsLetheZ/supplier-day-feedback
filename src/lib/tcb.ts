/**
 * 腾讯云 CloudBase（云开发）— 大陆扫码可用的免费存储
 *
 * 控制台必做：
 *  1. 环境 ID → VITE_TCB_ENV_ID
 *  2. 身份认证 → 开启「匿名登录」
 *  3. 集合 Submission + 权限「读取全部数据，修改本人数据」
 *  4. 【最常踩坑】环境设置 → 安全配置 → 网页安全域名
 *     把 AI Studio 预览域名 / localhost 加进去（改完约等 10 分钟）
 *  5. 可选：API Key → Publishable Key → VITE_TCB_ACCESS_KEY
 */
import { FeedbackSubmission } from '../types';

// 内置默认值：云端构建（腾讯云公开仓库部署）无需再配置环境变量即可跑通。
// 环境 ID 本就会出现在前端代码里，不属于机密。
const DEFAULT_ENV_ID = 'uxgs-d4gv4c7qr60f22622';
const DEFAULT_REGION = 'ap-shanghai';

const ENV_ID =
  (import.meta.env.VITE_TCB_ENV_ID as string | undefined) || DEFAULT_ENV_ID;
const REGION =
  (import.meta.env.VITE_TCB_REGION as string | undefined) || DEFAULT_REGION;
const ACCESS_KEY = import.meta.env.VITE_TCB_ACCESS_KEY as string | undefined;
const COLLECTION = 'Submission';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyApp = any;

let appPromise: Promise<AnyApp> | null = null;
let authed = false;

export function isTcbConfigured(): boolean {
  return Boolean(ENV_ID);
}

export function formatTcbError(e: unknown): string {
  const raw =
    e && typeof e === 'object'
      ? String(
          (e as { message?: string; code?: string; error_description?: string })
            .message ||
            (e as { code?: string }).code ||
            e
        )
      : String(e);

  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const hints: string[] = [];

  if (/CORS|cross-origin|Failed to fetch|NetworkError|ERR_FAILED|network request error/i.test(raw)) {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    hints.push(
      `把「${host}」加入 CloudBase 网页安全域名（来源 ${origin}），保存后等约10分钟；开着VPN时腾讯云常会失败，请关VPN或改部署到腾讯云静态托管`
    );
  }
  if (/PERMISSION|permission|denied|AUTH|未登录|login|unauthorized/i.test(raw)) {
    hints.push('请确认已开启匿名登录，且 Submission 权限为「读取全部数据，修改本人数据」');
  }
  if (/not found|MODULE|Cannot find|cloudbase/i.test(raw)) {
    hints.push('缺少 @cloudbase/js-sdk，请在 AI Studio 重新安装依赖');
  }
  if (!ENV_ID) {
    hints.push('未配置 VITE_TCB_ENV_ID');
  }

  return hints.length ? `${raw} | ${hints.join('；')}` : raw;
}

async function getApp(): Promise<AnyApp> {
  if (!ENV_ID) throw new Error('VITE_TCB_ENV_ID not set');
  if (!appPromise) {
    appPromise = (async () => {
      try {
        const mod = await import('@cloudbase/js-sdk');
        const cloudbase = (mod as { default?: { init: Function } }).default || mod;
        const cfg: Record<string, string> = {
          env: ENV_ID,
          region: REGION,
        };
        if (ACCESS_KEY) cfg.accessKey = ACCESS_KEY;
        return (cloudbase as { init: (c: Record<string, string>) => AnyApp }).init(cfg);
      } catch (e) {
        appPromise = null;
        throw new Error(
          `无法加载 @cloudbase/js-sdk：${e instanceof Error ? e.message : String(e)}`
        );
      }
    })();
  }
  return appPromise;
}

function getAuth(app: AnyApp) {
  // 旧版：app.auth()；新版：app.auth 为对象
  if (typeof app.auth === 'function') {
    try {
      return app.auth({ persistence: 'local' });
    } catch {
      return app.auth();
    }
  }
  return app.auth;
}

function getDb(app: AnyApp) {
  if (typeof app.database === 'function') return app.database();
  return app.database;
}

async function ensureAuth(app: AnyApp) {
  if (authed) return;

  // 若已配置 Publishable Key，部分版本可不登录直接写公开资源；仍尽量匿名登录
  const auth = getAuth(app);
  if (!auth) {
    if (ACCESS_KEY) {
      authed = true;
      return;
    }
    throw new Error('CloudBase auth 不可用');
  }

  try {
    // 已登录则跳过
    if (typeof auth.getLoginState === 'function') {
      const state = await auth.getLoginState();
      if (state && (state.isAnonymousAuth || state.user || state.isLoggedIn)) {
        authed = true;
        return;
      }
    }

    const errors: string[] = [];

    // 新版 v2/v3
    if (typeof auth.signInAnonymously === 'function') {
      try {
        const result = await auth.signInAnonymously();
        // 部分版本返回 { data, error }
        if (result && result.error) {
          throw result.error;
        }
        authed = true;
        return;
      } catch (e) {
        errors.push(`signInAnonymously: ${formatTcbError(e)}`);
      }
    }

    // 旧版
    if (typeof auth.anonymousAuthProvider === 'function') {
      try {
        await auth.anonymousAuthProvider().signIn();
        authed = true;
        return;
      } catch (e) {
        errors.push(`anonymousAuthProvider: ${formatTcbError(e)}`);
      }
    }

    if (ACCESS_KEY) {
      // Publishable Key 兜底：不强制登录
      console.warn('[tcb] anonymous login failed, continue with accessKey', errors);
      authed = true;
      return;
    }

    throw new Error(
      errors.length
        ? errors.join(' | ')
        : '匿名登录 API 不可用，请开启匿名登录或配置 VITE_TCB_ACCESS_KEY'
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/already|已登录|signed/i.test(msg)) {
      authed = true;
      return;
    }
    throw e;
  }
}

function fromDoc(row: Record<string, unknown>): FeedbackSubmission {
  const id = String(row._id || row.id || '');
  return {
    id,
    name: String(row.name || ''),
    email: String(row.email || ''),
    company: String(row.company || ''),
    businessUnit: String(row.businessUnit || 'Other'),
    q1Rating: Number(row.q1Rating || 0),
    q2Helpful: String(row.q2Helpful || 'A'),
    q3Matrix: (row.q3Matrix as FeedbackSubmission['q3Matrix']) || {
      themeSpeech: 5,
      buStrategy: 5,
      relevance: 5,
      exhibition: 5,
      networking: 5,
    },
    q4Favorite: String(row.q4Favorite || 'A'),
    q5Expectations: Array.isArray(row.q5Expectations)
      ? (row.q5Expectations as string[])
      : [],
    q5OtherText: String(row.q5OtherText || ''),
    q6Suggestions: String(row.q6Suggestions || ''),
    timestamp: String(row.timestamp || new Date().toISOString()),
    persona: (row.persona as FeedbackSubmission['persona']) || 'INNOVATOR',
    isHidden: Boolean(row.isHidden),
  };
}

function toDoc(submission: Omit<FeedbackSubmission, 'id'> & { id?: string }) {
  // CloudBase 文档字段：避免传入客户端临时 id
  return {
    name: submission.name,
    email: submission.email,
    company: submission.company,
    businessUnit: submission.businessUnit,
    q1Rating: Number(submission.q1Rating) || 0,
    q2Helpful: submission.q2Helpful,
    q3Matrix: submission.q3Matrix,
    q4Favorite: submission.q4Favorite,
    q5Expectations: submission.q5Expectations || [],
    q5OtherText: submission.q5OtherText || '',
    q6Suggestions: submission.q6Suggestions || '',
    timestamp: submission.timestamp || new Date().toISOString(),
    persona: submission.persona,
    isHidden: Boolean(submission.isHidden),
  };
}

export async function tcbFetchSubmissions(): Promise<FeedbackSubmission[]> {
  const app = await getApp();
  await ensureAuth(app);
  const db = getDb(app);
  let res: { data?: Record<string, unknown>[] };
  try {
    res = await db.collection(COLLECTION).orderBy('timestamp', 'asc').limit(200).get();
  } catch {
    res = await db.collection(COLLECTION).limit(200).get();
  }
  return (res.data || [])
    .map(fromDoc)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
}

export async function tcbPostSubmission(
  submission: Omit<FeedbackSubmission, 'id'> & { id?: string }
): Promise<FeedbackSubmission> {
  const app = await getApp();
  await ensureAuth(app);
  const payload = toDoc(submission);
  try {
    const result = await getDb(app).collection(COLLECTION).add(payload);
    const id = String(result?.id || result?._id || '');
    if (!id) {
      // 有的版本 add 成功但不回 id，仍视为成功
      console.warn('[tcb] add ok but no id in response', result);
    }
    return fromDoc({ ...payload, _id: id || `tcb-${Date.now()}` });
  } catch (e) {
    throw new Error(formatTcbError(e));
  }
}

export async function tcbPatchSubmission(
  id: string,
  patch: Partial<FeedbackSubmission>
): Promise<FeedbackSubmission> {
  const app = await getApp();
  await ensureAuth(app);
  const { id: _omit, ...rest } = patch;
  try {
    await getDb(app).collection(COLLECTION).doc(id).update(rest);
    return fromDoc({ ...rest, _id: id });
  } catch (e) {
    throw new Error(formatTcbError(e));
  }
}

export async function tcbRemoveSubmission(id: string): Promise<void> {
  const app = await getApp();
  await ensureAuth(app);
  try {
    await getDb(app).collection(COLLECTION).doc(id).remove();
  } catch (e) {
    throw new Error(formatTcbError(e));
  }
}

export async function tcbPing(): Promise<boolean> {
  if (!isTcbConfigured()) return false;
  try {
    await tcbFetchSubmissions();
    return true;
  } catch (e) {
    console.warn('[tcb] ping failed', formatTcbError(e));
    return false;
  }
}

export function tcbPollSubmissions(
  callback: (submissions: FeedbackSubmission[]) => void,
  intervalMs = 2500
): () => void {
  let stopped = false;
  let timer: number | null = null;

  const tick = async () => {
    if (stopped) return;
    try {
      const list = await tcbFetchSubmissions();
      if (!stopped) callback(list);
    } catch (e) {
      console.warn('[tcb] poll failed', formatTcbError(e));
    } finally {
      if (!stopped) timer = window.setTimeout(tick, intervalMs);
    }
  };

  tick();
  return () => {
    stopped = true;
    if (timer) window.clearTimeout(timer);
  };
}

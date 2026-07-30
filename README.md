# Bosch Supplier Day 2026 — Feedback Hub

手机端反馈收集 + 大屏 Dashboard。数据存 **腾讯云 CloudBase**（不依赖 Firebase / VPN）。

## 本地开发

```bash
npm install
npm run dev
```

- 问卷：`http://localhost:3000/`
- 大屏：`http://localhost:3000/#/dashboard`

环境 ID 已内置；也可用 `.env.local` 覆盖（见 `.env.example`）。

## 部署

见 [DEPLOY_TENCENT.md](./DEPLOY_TENCENT.md)。大陆扫码存储说明见 [CN_STORAGE.md](./CN_STORAGE.md)。

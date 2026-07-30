# 部署到腾讯云静态托管（不用本地 npm / 命令行）

思路：GitHub 建仓库（浏览器）→ 腾讯云连仓库云端自动 build → 得到 `*.tcloudbaseapp.com` 域名（已在白名单，免费、无需 VPN）。

---

## 第一步：把代码放到 GitHub（全程浏览器）
1. 解压 `supplier-day-feedback-hub-tcb.zip`
2. 打开 https://github.com → 右上角 **+ → New repository**
3. 名称随意（如 `supplier-day-feedback`），**选 Public（公开）**，点 Create
4. 新仓库页面点 **uploading an existing file**
5. 把解压后的**所有文件和文件夹**拖进去（`src/`、`server/`、`package.json`、`index.html` 等都要）
   - ⚠️ 不要传 `node_modules`（压缩包里本来就没有）
6. 底部点 **Commit changes**

> 复制仓库地址备用，形如：`https://github.com/你的名字/supplier-day-feedback`

---

## 第二步：腾讯云公开仓库部署
1. CloudBase 控制台 → **静态网站托管**
2. 点 **公开仓库部署**（或「Git 仓库部署」）
3. 粘贴上面的 GitHub 仓库地址
4. 构建配置（若需要手填）：
   - 安装命令：`npm install`
   - 构建命令：`npm run build`
   - 输出目录：`dist`
   - 框架：Vite / React（能选就选）
5. 开始部署，等云端 build 完成（约几分钟）

> 环境 ID 已内置在代码里，构建时**不用**再配环境变量就能连数据库。

---

## 第三步：拿到网址、做二维码
部署完成会给一个网址，形如：
```
https://uxgs-d4gv4c7qr60f22622-1317468313.tcloudbaseapp.com
```
- **顾客二维码** → 指向这个网址（首页就是手机问卷）
- **大屏看板** → 打开：
  ```
  https://uxgs-d4gv4c7qr60f22622-1317468313.tcloudbaseapp.com/#/dashboard
  ```
  （注意有 `#`）

---

## 第四步：验证
1. 手机（4G，不开 VPN）扫码打开 → 左上角应显示 `DB: 腾讯云 CloudBase ✓`
2. 提交一条 → CloudBase 控制台「文档型数据库 → Submission」出现记录
3. 大屏 `/#/dashboard` 能实时看到

若还写不进：多半是 CloudBase 数据库权限。把 `Submission` 权限改宽（会场临时）：
自定义安全规则
```json
{ "read": true, "write": true }
```

---

## 之后要改内容怎么办？
在 GitHub 仓库网页里编辑文件并 Commit，腾讯云会（可设为）自动重新构建；或在静态托管里点「重新部署」。

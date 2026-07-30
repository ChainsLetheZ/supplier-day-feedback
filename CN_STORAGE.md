# 扫码入库：腾讯云 CloudBase（替代 Firebase）

## 写入失败时按这个顺序查（90% 是第 1 条）

### 1. 网页安全域名（最常见）
CloudBase 控制台 → **环境设置 / 安全配置 / 网页安全域名**  
把下面这些都加上（有端口就带端口）：
- `localhost`
- `127.0.0.1`
- AI Studio 预览域名（看浏览器地址栏主机名，例如 `xxx.ai.studio` / `*.run.app` 等）

保存后 **等约 10 分钟** 再生效，再刷新页面提交。

### 2. 匿名登录
身份认证 → 登录方式 → **匿名登录 = 开**

### 3. 集合权限
集合名必须是 **`Submission`**  
权限选：**读取全部数据，修改本人数据**

若仍写不进，可改「自定义安全规则」：
```json
{
  "read": true,
  "write": true
}
```
（会场临时用；结束后再收紧）

### 4. Secrets
```env
VITE_TCB_ENV_ID=uxgs-d4gv4c7qr60f22622
VITE_TCB_REGION=ap-shanghai
VITE_TCB_ACCESS_KEY=   # 控制台若有 Publishable Key 建议填上
```

### 5. 依赖
需安装 `@cloudbase/js-sdk`。失败提示里若出现 “无法加载 sdk”，在 AI Studio 重装依赖。

## 验证
1. 左上角：`DB: 腾讯云 CloudBase ✓`
2. 提交一条 → 控制台 `Submission` 出现记录
3. 打开 `/dashboard` 能看到

## 二维码域名
CloudBase 只管存数据。二维码打开的 H5 域名也必须能在大陆访问。

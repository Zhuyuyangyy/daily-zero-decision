# SECURITY POLICY

> 每日零决策卡（Daily Zero Decision / 养一片自己的天空）
> 仓库：`D:/ZYY Project/daily-zero-decision`
> App：`app/`

我们相信：**一个习惯打卡应用不应该成为用户的负担**。本文件说明我们如何对待安全、漏洞披露、第三方依赖与监控。

---

## 1. 我们的立场（Our Posture）

| 维度 | 立场 |
| --- | --- |
| 默认网络行为 | **完全离线**。本应用是纯前端 SPA，构建产物为静态文件，无后端 API、无数据库、无登录。 |
| 遥测（Telemetry） | **零遥测**。我们不在应用内埋点、不收集使用事件、不上报崩溃。 |
| 第三方追踪 | **零第三方追踪**。无 Google Analytics、无 Sentry、无 Mixpanel、无任何脚本注入。 |
| 第三方 JS | **无 CDN 运行时依赖**。`package.json` 仅含 `react` / `react-dom` 两条运行依赖；构建后产物自包含，不在运行时从外部拉取任何脚本、字体、样式或数据。 |
| 用户身份 | **无账号、无登录、无设备 ID、无 Cookie**。 |
| 数据归属 | **数据归用户所有**，只存在于用户浏览器 `localStorage` 中。详见 `PRIVACY.md`。 |

如果你在运行产物中看到任何对外部域名的网络请求，请视为异常并报告（见 §3）。

---

## 2. 安全设计原则（Security by Design）

1. **最小攻击面**：不开放端口、不接收网络输入、不解析远端数据。应用不发起任何 `fetch` / `XMLHttpRequest` / `WebSocket`。
2. **最小权限**：Vite 构建产物为纯静态资源（`index.html` + `assets/*`），无 `service-worker.js` 注入、无 manifest 越权、无 Notification 权限请求。
3. **输入净化**：所有用户输入（任务名、心情、书名）走 React 受控组件渲染；不通过 `dangerouslySetInnerHTML` 插入；不通过 `eval` / `new Function` 执行。
4. **存储隔离**：所有持久化数据写入浏览器 `localStorage` 单一 key（`daily-zero-decision`）；不写入 `IndexedDB` / `Cookie` / `SessionStorage`。
5. **导入/导出**：备份 JSON 由用户主动触发下载（`exportState`），导入走 `importState` 严格 schema 校验（见 `DATA_MODEL.md`）；失败时静默回退默认状态，不抛错给 UI。
6. **构建链路**：依赖固定 `package-lock.json`；CI 跑 `typecheck` + `test` + `build`；无 postinstall 脚本。

---

## 3. 漏洞披露（Vulnerability Disclosure）

我们欢迎负责任的漏洞披露。

- **联系方式**：在 GitHub 仓库开一个 **Private Security Advisory**（Security → Advisories → New draft security advisory），不要在公开 Issue 中贴 PoC。
- **响应时效**：维护者会在 **7 个日历日内**确认收到，并在 **30 个日历日内**给出修复计划或拒绝理由。
- **披露窗口**：除非双方另有约定，我们遵循 **90 天负责任披露**原则。
- **范围**：
  - `app/src/**` 全部代码
  - `app/public/**` 静态资源
  - `app/vite.config.ts` / `app/tailwind.config.js` 构建配置
  - `vercel.json` 部署配置
- **不在范围**：
  - 第三方依赖本身的漏洞 → 请直接报上游
  - 浏览器自身漏洞
  - 社交工程
  - 拒绝服务（DoS）攻击 —— 我们的产物是纯静态文件，没有可被 DoS 的服务端口

请在报告中包含：复现步骤、受影响版本（commit SHA 或 release tag）、影响面、PoC（若有）。

---

## 4. OWASP Top 10 合规说明（自评）

我们按 [OWASP Top 10 (2021)](https://owasp.org/Top10/) 自评如下表。本应用不暴露后端，所以 Web 特有的服务端威胁不适用。

| OWASP 项 | 适用性 | 我们的处置 |
| --- | --- | --- |
| A01: Broken Access Control | N/A | 无后端、无账号、无权限层 |
| A02: Cryptographic Failures | 低 | 不在浏览器存储任何密钥/凭据；导出 JSON 不含敏感数据 |
| A03: Injection | 低 | 无 SQL / NoSQL / Shell 调用；所有渲染走 React 文本节点 |
| A04: Insecure Design | 已处理 | 安全设计原则见 §2 |
| A05: Security Misconfiguration | 已处理 | 默认 CSP 由托管平台（Vercel）提供；无调试接口外露 |
| A06: Vulnerable Components | 持续 | CI 跑 `npm audit`（可扩展）；仅 `react` / `react-dom` 两项运行依赖 |
| A07: Identification & Auth Failures | N/A | 无身份认证 |
| A08: Software & Data Integrity | 已处理 | `package-lock.json` 入库；构建产物自包含；导入数据走 schema 校验 |
| A09: Logging & Monitoring Failures | 低 | `window.onerror` 仅做 console.warn，不上报远端 |
| A10: Server-Side Request Forgery | N/A | 不发起出站请求 |

---

## 5. 依赖与供应链

- **运行依赖**：`react`、`react-dom`（均来自 npm 官方 registry，固定版本）
- **开发依赖**：`vite`、TypeScript、Vitest、Testing Library、ESLint、tailwindcss 等
- **锁定文件**：`app/package-lock.json` 入库
- **建议**：贡献者升级依赖时请发起独立 PR，附 `npm audit` 输出与影响说明

---

## 6. 隐私与数据的进一步说明

涉及用户数据（本地存储内容、导入/导出文件、备份）请同时阅读 `PRIVACY.md`。
涉及数据结构、schemaVersion、迁移规则请阅读 `DATA_MODEL.md`。

---

## 7. 版本

- 文档版本：v1.0.0（与 v0.1.0 应用版本配套）
- 任何安全相关变更需同步更新本文件并在 `app/CHANGELOG.md` 标注

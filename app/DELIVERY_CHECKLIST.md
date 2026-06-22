# DELIVERY CHECKLIST

> 每日零决策卡（Daily Zero Decision / 养一片自己的天空）
> 适用：每次发版（release tag）前的强制自检

**原则**：没有"差不多"。每一条都要勾；任何一条失败 → 阻断发版。

---

## 0. 适用范围

- 仓库：`D:/ZYY Project/daily-zero-decision`
- App：`app/`
- 本文件是 `app/DELIVERY_STANDARD.md` 的**操作层配套**：标准说什么，这里勾什么

---

## 1. 自动化门禁（必须全绿）

| # | 项目 | 命令 | 通过标准 |
| --- | --- | --- | --- |
| 1.1 | TypeScript 类型检查 | `cd app && npm run typecheck` | 0 error |
| 1.2 | 单元测试 | `cd app && npm test` | 全部用例 pass |
| 1.3 | Lint | `cd app && npm run lint` | 0 error，0 warning（`--max-warnings 0`） |
| 1.4 | 构建 | `cd app && npm run build` | 成功产出 `app/dist/` |
| 1.5 | 依赖审计 | `cd app && npm audit --omit=dev` | 无 high / critical 漏洞 |
| 1.6 | CI 工作流 | GitHub Actions `CI` workflow | 所有 job 绿 |

> 上述命令已固化在 `app/package.json` 的 `scripts` 段。CI 跑 1.1 / 1.2 / 1.4；本地至少跑 1.1 / 1.2 / 1.3 / 1.4 / 1.5。

---

## 2. 手工门禁（人眼 + 人脑）

| # | 项目 | 通过标准 | 责任人 |
| --- | --- | --- | --- |
| 2.1 | 首次访问 → Onboarding → 今日卡 | 一屏走通，无 console 报错 | 维护者 |
| 2.2 | 完成一张卡 → 天空长云 | 动画流畅（reduced-motion 关闭 / 开启两态都看） | 维护者 |
| 2.3 | 切到 Cloud Garden | 记忆云渲染正确 | 维护者 |
| 2.4 | 触发一次 streak +1 | 顶栏 streak mini 更新 | 维护者 |
| 2.5 | 导出 → 清浏览器数据 → 导入 | 状态完整还原 | 维护者 |
| 2.6 | 故意喂错 schema JSON 给导入 | UI 友好提示，当前状态不被破坏 | 维护者 |
| 2.7 | 飞行模式断网 | 全部功能仍可用 | 维护者 |
| 2.8 | DevTools Network 面板观察 5 分钟 | **0 个出站请求** | 维护者 |
| 2.9 | Lighthouse（仅本地） | Performance ≥ 90，Accessibility ≥ 95，Best Practices ≥ 95，SEO ≥ 80 | 维护者 |
| 2.10 | 移动端宽度（375 / 768） | 布局不破 | 维护者 |
| 2.11 | 浏览器兼容性 | Chrome / Safari / Firefox 最新两版可正常打开 | 维护者 |

---

## 3. 文档门禁（与代码同步）

| # | 文档 | 检查项 |
| --- | --- | --- |
| 3.1 | `app/README.md` | 截图 / 特性列表 / 快速开始 / 部署步骤与 v0.1.0+ 实际行为一致 |
| 3.2 | `app/CHANGELOG.md` | 新增 `## vX.Y.Z — YYYY-MM-DD — <一句话标题>` 段，列出 Added / Changed / Fixed / Docs |
| 3.3 | `app/SECURITY.md` | 第 1 节立场、第 3 节披露流程与当前发版行为一致 |
| 3.4 | `app/PRIVACY.md` | §3 不做的事清单与实际产物一致；§9 变更承诺未变更 |
| 3.5 | `app/DATA_MODEL.md` | `schemaVersion` 与字段定义与 `storage.ts` 一致；新增字段已记录迁移规则 |
| 3.6 | `app/DELIVERY_STANDARD.md` | 本次发版未引入新标准；如有则同步更新 |
| 3.7 | `app/SPEC.md` / `app/PRODUCT_SPEC.md` / `app/TECH_SPEC.md` | 与本次发版无矛盾 |

---

## 4. 数据与隐私门禁

| # | 项目 | 通过标准 |
| --- | --- | --- |
| 4.1 | 无新增出站请求 | `app/dist/` 中 grep `fetch\|XMLHttpRequest\|WebSocket\|sendBeacon` 结果为空 |
| 4.2 | 无新增第三方运行时依赖 | `app/package.json` `dependencies` 段非 `react*` 条目 = 0；如有新增须在本表下方写明理由 |
| 4.3 | 无新增本地存储 key | 仍只有 `daily-zero-decision` |
| 4.4 | 导入校验仍是最小集 | `importState` 未被弱化 |
| 4.5 | 导出文件不含意外字段 | 仅含 `AppState` |

> 4.2 例外申请需在 PR 描述中显式列出并经维护者审批。

---

## 5. 发布动作

按以下顺序执行，全部成功才视为"已发布"。

- [ ] 5.1 本地跑通 §1 全部 6 条
- [ ] 5.2 跑通 §2 全部 11 条
- [ ] 5.3 同步更新 §3 全部 7 个文档
- [ ] 5.4 检查 §4 全部 5 条
- [ ] 5.5 `git add` + commit（message 含 `release: vX.Y.Z`）
- [ ] 5.6 `git tag -a vX.Y.Z -m "..."`
- [ ] 5.7 `git push origin main --follow-tags`
- [ ] 5.8 等待 CI 绿灯
- [ ] 5.9 在仓库 Release 页面写发布说明（复制 CHANGELOG 该版本段）
- [ ] 5.10 部署（若使用 Vercel / 其他平台），确认线上页面加载正常
- [ ] 5.11 在本清单最下方追加一行"已发版"记录（版本 / 日期 / 触发人）

---

## 6. 阻断发版的红线（任意一条即拒）

- ❌ 任何 §1 自动化门禁失败
- ❌ 任何 §4 数据隐私门禁失败且无审批例外
- ❌ 引入用户未明确同意的第三方运行依赖
- ❌ `AppState` schema 不兼容升级但 `schemaVersion` 未 major + 1
- ❌ `SECURITY.md` / `PRIVACY.md` 与实际产物不一致
- ❌ CI 红但强行合并

---

## 7. 已发版记录

| 版本 | 日期 | 触发人 | CI | 备注 |
| --- | --- | --- | --- | --- |
| （待填） | | | | |

---

## 8. 关联文档

- 标准层：`app/DELIVERY_STANDARD.md`
- 安全：`app/SECURITY.md`
- 隐私：`app/PRIVACY.md`
- 数据契约：`app/DATA_MODEL.md`
- 变更日志：`app/CHANGELOG.md`
- 产品规格：`app/PRODUCT_SPEC.md` / `app/SPEC.md`
- 技术规格：`app/TECH_SPEC.md`

# 养一片自己的天空 ☁️

> **治愈不焦虑的打卡。你在养天空，天空不会 PUA 你。**

不是"坚持 X 天"的冷数字，是一片**你亲手养出来的、独一无二的天空**。
每坚持一天，天空里多一朵属于你的云——形状、颜色、表情每天都不一样。
坚持越久，天空越丰盈：从晨雾到晴空，再到夕阳。

漏签了？没关系。云会飘回来。

## 核心循环

1. **说一句话**（"看书""背单词""下课看书"……）—— 或点预设 chip
2. **应用生成零决策卡**：自动记住上次看到第几页、算好这一段看几页、标好地点时间
3. **截图 / 打印这张卡，放下手机，去做**
4. **回来点完成** —— 天空里多了一朵云，云会跟你说"嗯"
5. **刷新后数据还在**

没有"失败""断了""再坚持一次"——只有"今天少了一朵，明天补一朵"。

## 反 Duolingo

Duolingo 漏签会骂你、扣你 XP、看着火苗熄灭。
**我们不会。**

断签 = 多云的一天。
你不欠这朵云任何东西。
明天回来，云还在。

## 抖音天然可晒

"这是我坚持 30 天养出来的天空"——这句话本身就是一条短视频。
**每个人的天空都不一样**，别人会想拍自己的。

## 视觉特色

- **天空随坚持变丰盈**：晨雾 → 晨曦 → 晴空 → 暖阳 → 夕阳
- **每朵云由日期 hash 生成**：同一日期永远同一朵云，不同日期不同
- **8 种云的表情**：calm / smile / sleep / wink / tiny-smile / peeking / peaceful / neutral
- **温柔文案系统**：每条文案都过"不骂你"审核

## 技术栈

- React 18 + TypeScript
- Tailwind CSS
- Vite
- 纯前端、localStorage、可静态托管

## 设计系统引用

借用了本机 `D:\GITHUB` 下的几个开源 design system 的思路（仅思路，不搬代码）：

| 项目 | 取了什么 |
|---|---|
| `open-design-main/design-systems/claymorphism` | 软圆 3D、双重 inset+偏移阴影、150-250ms 缓动 |
| `open-design-main/design-systems/clay` | 暖奶油画布、命名 swatch（Matcha / Lemon / Pomegranate）、多档暖色命名 |
| `impeccable-main` | typography / motion / spatial / ux-writing 规则 |
| `taste-skill-main` | 双边框 (Doppelrand)、Bento 网格、tinted shadow |
| `ui-ux-pro-max-skill-main` | 3 层 token 体系、4-8pt 间距、44px 触点 |

具体适配写进 `src/theme/clay.css` 顶部的注释 + swatch 别名层（`--swatch-matcha` / `--swatch-lemon` 等）。

## 本地运行

```bash
npm install
npm run dev          # http://localhost:5173
```

## 部署

```bash
npm run build        # → dist/
# Vercel / Netlify / 任意静态托管
```

## 许可证

MIT

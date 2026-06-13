# official-document-assistant

公文格式校验与会议督办提取 Skill。v0.3 的核心目标是把“检查公文有没有明显问题”升级为“给出可直接修改的规范修订稿”。

## 参赛定位

本 Skill 面向基层政务、办公室、人事行政、学生组织等高频正式材料场景，支持通知、请示、报告、函、会议纪要等材料的结构审查、风险提示、草稿起草和督办事项提取。

它不包装成“政务全场景大模型”，而是聚焦一个可落地的小场景：输入一段通知、请示、报告或会议纪要，自动检查标题、主送机关、落款、日期、附件、正文层级、请示/报告误用、敏感信息等问题，并输出修改建议和建议修订稿。

## v0.3 重点升级

- 新增“建议修订稿”：审查报告不只列问题，还给出可直接复制修改的规范文本。
- 增强公文规则：检查标题三要素、正文层级、附件编号、请示一文一事、请示结语、报告夹带请示事项、函的商洽语气、通知事项可执行性。
- 优化起草模板：请示、函、报告的表达更自然，减少占位感和机械套话。
- 支持本地 `.docx` 输入：无需第三方依赖，直接从 Word 文档中提取正文。
- 支持批量审查：对文件夹内的 `.txt`、`.md`、`.json`、`.docx` 批量生成 JSON 或 Markdown 报告。
- 删除未实现的政策解读宣传，避免 README 和 Skill 能力描述虚标。

## 核心能力

- 公文审查：识别文种，检查标题、主送机关、正文、附件、落款单位、落款日期和正式语气。
- 专项规则：针对请示、报告、函、通知分别检查常见公文错误。
- 建议修订：输出“问题清单、修改建议、建议修订稿、督办事项、脱敏预览”。
- 模板起草：根据 JSON 或一句话需求生成通知、请示、报告、函、会议纪要草稿。
- 会议督办：从会议纪要中提取责任方、截止时间和待办事项。
- 安全合规：识别手机号、身份证号、涉密/内部资料表述，并给出本地脱敏预览。

## 本地运行

```bash
python scripts/gov_doc_review.py --mode review --format markdown < examples/input-notice.md
python scripts/gov_doc_review.py --mode brief --format json < examples/input-meeting.md
python scripts/gov_doc_review.py --mode draft --format markdown < examples/input-draft-request.txt
python scripts/gov_doc_review.py --mode review --format markdown --input examples/input-notice.md
python scripts/gov_doc_review.py --mode review --format json --batch examples
python scripts/gov_doc_review.py --mode review --format markdown --input demo.docx --output report.md
```

## 参数说明

- `--mode review`：公文格式和合规审查。
- `--mode draft`：根据 JSON 或自然语言需求生成公文草稿。
- `--mode brief`：会议纪要/简报督办事项提取。
- `--format markdown`：输出适合复制粘贴的审查报告。
- `--format json`：输出结构化结果，便于二次处理。
- `--input`：读取 UTF-8 文本、Markdown、JSON 或 `.docx` 文件。
- `--batch`：批量审查文件夹内的文本和 `.docx` 文件。
- `--output`：把结果写入指定文件。

## 输出结构

审查模式默认输出 Markdown 报告：

1. 文种识别、综合评分、风险等级。
2. 标题、主送机关、落款单位、落款日期等结构识别。
3. 问题清单：每项包含严重程度、问题名称和修改建议。
4. 修改建议：按问题汇总可执行修改方向。
5. 建议修订稿：给出一版可直接复制再人工复核的规范文本。
6. 督办事项：责任方、期限和事项。
7. 脱敏预览：对手机号、身份证号等字段进行本地脱敏展示。

## 示例覆盖

- `examples/input-notice.md`：通知审查。
- `examples/input-meeting.md`：会议纪要督办提取。
- `examples/input-report-misuse.md`：报告夹带请示事项检查。
- `examples/input-request-ending.md`：请示结语检查。
- `examples/input-attachment-mismatch.md`：附件编号一致性检查。
- `examples/input-draft-*`：通知、请示、函、会议纪要起草示例。
- `examples/output-*`：对应 Markdown 输出。

## SkillHub 提交

作品名称填写：

```text
official-document-assistant
```

该名称需与 `SKILL.md` frontmatter 中的 `name` 保持一致。

## 已知限制

- 本 Skill 是轻量、可解释、无外部依赖的参赛版，不替代人工公文审核、法律审核或保密审查。
- `.docx` 支持仅提取正文段落，不解析复杂表格、页眉页脚、批注和修订痕迹。
- 不编造政策依据。涉及政策、法规、涉密材料、个人隐私和未公开政务数据时，应由用户提供依据并进行人工复核。

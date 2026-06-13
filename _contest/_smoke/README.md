# official-document-assistant

公文格式检查与材料起草助手，面向政务公文、办公室通知、会议纪要、工作简报和学生组织正式材料。

## 参赛定位

本 Skill 面向“政务公文智能处理”场景，解决公文格式容易出错、正式材料不会起草、会议纪要难以沉淀督办事项、行政通知语气不规范等问题。它既能用于政务场景，也适合行政、人事、办公室、学生会和社团通知等高频材料场景。

v0.2 在 v0.1 稳定审查能力基础上新增模板起草模式，并增强空输入、异常输入下的稳定性。

## 核心能力

- 公文文种识别：通知、请示、报告、函、会议纪要等。
- 格式检查：标题、主送机关、落款单位、落款日期、附件。
- 表达检查：口语化表述、强制性表述缺少依据、事项不明确。
- 风险评分：输出综合评分和低/中/高风险等级。
- 模板起草：根据 JSON 或一句话需求生成通知、请示、函、会议纪要等草稿。
- 督办提取：从会议纪要中提取责任方、截止时间和任务描述。
- 异常兜底：空输入、短文本、坏 JSON、控制字符等输入不会导致崩溃。

## 本地运行

```bash
python scripts/gov_doc_review.py --mode review --format markdown < examples/input-notice.md
python scripts/gov_doc_review.py --mode brief --format json < examples/input-meeting.md
python scripts/gov_doc_review.py --mode draft --format markdown < examples/input-draft-notice.json
python scripts/gov_doc_review.py --mode draft --format markdown < examples/input-draft-meeting.json
echo 请帮我写一份请示，主题是申请采购办公电脑，报给信息中心 | python scripts/gov_doc_review.py --mode draft --format markdown
```

## 示例覆盖

- 审查示例：通知、会议纪要
- 起草示例：通知、请示、函、会议纪要
- 输出示例：对应的 Markdown 报告或模板正文均已放在 `examples/output-*`

## 推荐传播口径

作品可以包装为“体制内/办公室/学生会都能用的公文材料助手”：

- 不会写正式通知：输入主题和要求，先生成可改模板。
- 怕格式不规范：自动检查标题、主送机关、落款、日期。
- 会议开完没人跟进：自动抽取责任方、截止时间和督办事项。

这个口径比单纯“政务公文”更适合热度榜传播，同时仍符合赛题的政务公文智能处理方向。

## 提交说明

提交 SkillHub 时，作品名称填写：

```text
official-document-assistant
```

该名称必须与 `SKILL.md` frontmatter 中的 `name` 保持一致。

## 版本说明

- v0.1：稳定审查版，适合立即提交。
- v0.2：参赛增强版，增加模板起草、多文种示例、异常输入鲁棒性和传播文案，更适合作为正式冲榜版本。

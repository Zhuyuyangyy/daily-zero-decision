# official-document-assistant

公文格式检查与材料助手，面向政务公文、办公室通知、会议纪要、工作简报和学生组织正式材料。

## 参赛定位

本 Skill 面向“政务公文智能处理”场景，解决公文格式容易出错、会议纪要难以沉淀督办事项、正式材料语气不规范等问题。它既能用于政务场景，也适合行政、人事、办公室、学生会和社团通知等高频材料场景。

## 核心能力

- 公文文种识别：通知、请示、报告、函、会议纪要等。
- 格式检查：标题、主送机关、落款单位、落款日期、附件。
- 表达检查：口语化表述、强制性表述缺少依据、事项不明确。
- 风险评分：输出综合评分和低/中/高风险等级。
- 督办提取：从会议纪要中提取责任方、截止时间和任务描述。

## 本地运行

```bash
python scripts/gov_doc_review.py --mode review --format markdown < examples/input-notice.md
python scripts/gov_doc_review.py --mode brief --format json < examples/input-meeting.md
```

## 提交说明

提交 SkillHub 时，作品名称填写：

```text
official-document-assistant
```

该名称必须与 `SKILL.md` frontmatter 中的 `name` 保持一致。

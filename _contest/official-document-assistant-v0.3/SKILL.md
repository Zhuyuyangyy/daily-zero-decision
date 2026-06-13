---
name: official-document-assistant
description: 公文格式校验与会议督办提取助手。用于审查或起草通知、请示、报告、函、会议纪要等正式材料，输出问题清单、风险等级、修改建议、建议修订稿、督办事项和脱敏预览。
version: 0.3.0
---

# 公文格式校验与会议督办提取助手

## 适用场景

当用户需要处理以下材料时使用本 Skill：

- 通知、请示、报告、函、通报等正式公文类材料。
- 会议纪要、工作简报、活动通知、学生组织通知、办公室材料。
- 需要检查标题、主送机关、正文层级、附件编号、落款、日期和正式语气的文本。
- 需要快速生成通知、请示、报告、函、会议纪要等可编辑草稿的文本需求。
- 需要从会议材料中提取责任单位、截止时间、待办事项。
- 需要对手机号、身份证号、涉密或内部资料表述进行风险提示和本地脱敏预览。

## 工作流程

1. 判断用户材料类型：公文审查、模板起草或会议纪要/督办提取。
2. 优先读取用户直接提供的文本；如用户给出文件路径，可读取 UTF-8 文本、Markdown、JSON 或 `.docx` 文件。
3. 起草模式下，根据文种、主题、主送机关、落款单位、截止时间和要求生成可编辑草稿。
4. 审查模式下执行结构和规则检查：
   - 标题是否符合“关于 + 事由 + 文种”的三要素结构。
   - 是否具备主送机关、正文、落款单位和中文日期。
   - 附件说明和正文附件编号是否一致。
   - 正文层级是否存在“一、”和“1.”跳级混用。
   - 请示是否符合一文一事，结语是否包含“妥否，请批示”。
   - 报告是否夹带“请批示”“妥否”等请示事项。
   - 函的语气是否适合平行机关商洽。
   - 通知是否明确对象、事项、时间节点和办理要求。
   - 是否存在口语化、强制性表述缺少依据、个人敏感信息、涉密或内部资料风险。
5. 对会议纪要和简报提取督办事项：
   - 责任方。
   - 任务描述。
   - 截止时间。
   - 原文依据。
6. 输出审查报告，包含评分、风险等级、问题清单、修改建议、建议修订稿、督办事项和脱敏预览。

## 可用脚本

本 Skill 附带一个纯 Python 标准库脚本：

```bash
python scripts/gov_doc_review.py --mode review --format markdown < examples/input-notice.md
python scripts/gov_doc_review.py --mode brief --format json < examples/input-meeting.md
python scripts/gov_doc_review.py --mode draft --format markdown < examples/input-draft-request.txt
python scripts/gov_doc_review.py --mode review --format markdown --input examples/input-notice.md
python scripts/gov_doc_review.py --mode review --format json --batch examples
python scripts/gov_doc_review.py --mode review --format markdown --input demo.docx --output report.md
```

参数说明：

- `--mode review`：公文格式和合规审查。
- `--mode draft`：根据 JSON 或自然语言需求生成公文草稿。
- `--mode brief`：会议纪要/简报督办提取。
- `--format markdown`：输出适合直接复制的审查报告。
- `--format json`：输出结构化结果，便于二次处理。
- `--input`：读取单个 UTF-8 文本、Markdown、JSON 或 `.docx` 文件。
- `--batch`：批量审查文件夹内的 `.txt`、`.md`、`.json`、`.docx` 文件。
- `--output`：将结果写入指定文件。

## 输出要求

审查模式输出结构如下：

1. 文种识别、综合评分、风险等级。
2. 标题、主送机关、落款单位、落款日期等结构识别结果。
3. 问题清单：每项包含严重程度、问题名称和修改建议。
4. 修改建议：按问题汇总可执行修改方向。
5. 建议修订稿：生成一版可复制、可人工复核的规范文本。
6. 督办事项：责任方、期限、事项。
7. 脱敏预览：识别手机号、身份证号等个人敏感信息时输出本地脱敏预览。

起草模式输出可直接修改的 Markdown 正文，默认保留 `XXXX年XX月XX日` 等占位符，避免编造未提供的信息。

## 安全与合规

- 不编造政策依据、法规名称或不存在的上级文件。
- 涉及涉密、个人隐私或未公开政务数据时，只给出本地处理和脱敏建议，不建议上传外部平台。
- 输出结果仅作为材料初审和起草辅助，最终应由人工复核。

## 已知限制

- `.docx` 解析仅提取正文段落，不解析复杂表格、页眉页脚、批注和修订痕迹。
- 本 Skill 聚焦公文格式校验、起草、修订建议和督办提取，不承诺政策问答、政策依据核验或全量政务知识检索。

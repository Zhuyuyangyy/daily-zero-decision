# 3 分钟现场演示脚本

## 演示目标

用 3 分钟证明 `official-document-assistant` 不是只会生成一段文字，而是能完成“起草、审查、督办、安全提示”的完整公文材料处理流程。

## 演示前准备

打开终端，进入项目目录：

```bash
cd "D:\ZYY Project"
```

确认使用最终提交包对应源码：

```bash
python _contest/final-submit/tools/preflight_check.py --skill-zip _contest/final-submit/official-document-assistant-v0.2.zip --materials-zip _contest/final-submit/official-document-assistant-v0.2-review-materials.zip
```

预期看到：

```text
summary: 21/21 passed
```

## 0:00 - 0:30 开场

讲法：

`official-document-assistant` 面向政务和行政办公里的正式材料处理，覆盖三个高频痛点：不会起草、格式不确定、会议事项没人跟。当前版本是轻量 Skill 包，纯 Python 标准库实现，便于部署和复用。

## 0:30 - 1:05 演示 1：公文格式审查

命令：

```bash
python _contest/official-document-assistant-v0.2/scripts/gov_doc_review.py --mode review --format markdown --input _contest/official-document-assistant-v0.2/examples/input-notice.md
```

看点：

- 自动识别文种为“通知”。
- 输出综合评分和风险等级。
- 识别标题、主送机关、落款单位、落款日期。
- 有督办事项时抽取责任方、期限和事项。

讲法：

这一步对应专家榜的结果质量和稳定性。输出不是自由文本，而是结构化审查报告。

## 1:05 - 1:40 演示 2：模板起草

命令：

```bash
python _contest/official-document-assistant-v0.2/scripts/gov_doc_review.py --mode draft --format markdown --input _contest/official-document-assistant-v0.2/examples/input-draft-letter.txt
```

看点：

- 从自然语言识别“函”。
- 识别主送单位“市数据局”。
- 生成“关于商请协助开展数据核验的函”。
- 保留 `XXXX年XX月XX日` 占位，不编造日期。

讲法：

起草模式的定位是生成可编辑骨架，不替代最终人工定稿。它把正式材料的结构先搭起来，降低起草成本。

## 1:40 - 2:10 演示 3：会议纪要督办提取

命令：

```bash
python _contest/official-document-assistant-v0.2/scripts/gov_doc_review.py --mode brief --format json --input _contest/official-document-assistant-v0.2/examples/input-meeting.md
```

看点：

- 输出 JSON，便于系统集成。
- 提取责任方。
- 提取截止时间。
- 提取事项描述。

讲法：

这对应赛题里的会议与信息处理方向，把会议纪要从“写完就结束”变成可跟踪的督办清单。

## 2:10 - 2:45 演示 4：安全合规和脱敏预览

命令：

```bash
@'
关于报送人员信息的通知

各部门：

请报送张三身份证号110105199001011234，联系电话13812345678，用于名单核验。

办公室
2026年6月10日
'@ | python _contest/official-document-assistant-v0.2/scripts/gov_doc_review.py --mode review --format markdown
```

看点：

- 识别“疑似个人敏感信息”。
- 风险等级不会保持为低。
- 输出“脱敏预览”。
- 手机号显示为 `138****5678`。
- 身份证号显示为 `110105********1234`。

讲法：

政务材料对安全合规很敏感，所以本作品不仅提示风险，还提供本地脱敏预览，并提醒人工复核和本地处理。

## 2:45 - 3:00 收尾

讲法：

这个 Skill 的优势是场景边界清楚、工程结构轻、异常输入不崩、输出可读也可集成。当前已通过 15 个自动化测试和 21 项最终 preflight 检查。后续可以继续扩展政策摘要、政策问答和更多细粒度公文格式规则。

## 可能追问

### 为什么不用纯大模型生成？

正式材料需要稳定结构和合规边界。纯生成容易编造依据或日期。本作品用规则和模板先保证结构，再把未知信息保留为占位符。

### 能不能直接用于正式发文？

不能替代人工审核。它适合作为初稿生成、格式体检和督办提取工具，正式发文仍需公文专员、法务或保密流程复核。

### 安全合规怎么证明？

已实现个人敏感信息、涉密/内部资料提示和脱敏预览，并通过自动化测试与 preflight 验证。


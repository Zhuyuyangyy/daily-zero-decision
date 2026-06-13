# official-document-assistant v0.2 最终提交验收记录

## 提交产物

- SkillHub 上传文件：`D:\ZYY Project\_contest\official-document-assistant-v0.2.zip`
- 作品名称：`official-document-assistant`
- 评审材料包：`D:\ZYY Project\_contest\official-document-assistant-v0.2-review-materials.zip`

## 文件哈希

- `official-document-assistant-v0.2.zip`
  - SHA256：`05C11100212707FB6A4668467AA6031CE73AB12CAD8944375E55F10D415F9AC4`

> 评审材料包会包含本记录本身，不在本文件内记录自身哈希；如需校验，以最终打包后单独计算结果为准。

## Skill ZIP 文件清单

| 文件 | 字节数 |
|---|---:|
| README.md | 3050 |
| SKILL.md | 4416 |
| examples/input-draft-letter.txt | 82 |
| examples/input-draft-meeting.json | 184 |
| examples/input-draft-notice.json | 249 |
| examples/input-draft-request.txt | 82 |
| examples/input-meeting.md | 185 |
| examples/input-notice.md | 243 |
| examples/output-draft-letter.md | 395 |
| examples/output-draft-meeting.md | 471 |
| examples/output-draft-notice.md | 476 |
| examples/output-draft-request.md | 467 |
| examples/output-meeting.md | 500 |
| examples/output-notice.md | 525 |
| scripts/gov_doc_review.py | 18540 |
| templates/review-report.md | 354 |

## 解压后独立烟测

将 `official-document-assistant-v0.2.zip` 解压到 `_contest/_smoke` 后运行脚本，结果如下：

| 检查项 | 结果 |
|---|---|
| 根目录存在 SKILL.md | 通过 |
| 根目录存在 README.md | 通过 |
| review 模式识别通知 | 通过 |
| draft 模式生成函并与示例一致 | 通过 |
| brief 模式提取会议督办事项 | 通过 |
| 控制字符输入不崩溃并返回高风险问题清单 | 通过 |

## 自动化测试

命令：

```bash
python -m pytest "_contest\official-document-assistant-v0.2\tests" -q
```

结果：

```text
15 passed
```

覆盖点：

- 通知格式审查
- 缺主送机关和缺落款日期识别
- 落款日期格式不规范提示
- 附件说明不完整提示
- 会议纪要督办提取
- 通知、请示、函、会议纪要起草
- 坏 JSON 起草兜底
- 控制字符清洗
- 空输入不崩溃
- 个人敏感信息风险提示
- 涉密或内部资料风险提示
- 手机号和身份证号本地脱敏预览

## ZIP 合规校验

- `SKILL.md` 位于 ZIP 根目录
- ZIP 文件数：16
- ZIP 大小：14807 字节
- 文本文件 UTF-8：通过
- 文本文件 NUL 字节：未发现
- 单文件大小限制：通过
- ZIP 总大小限制：通过

## 上传提醒

1. 必须从赛事页面进入“作品提交”，不要绕过赛事页面直接去 SkillHub 上传。
2. 上传文件选择 `official-document-assistant-v0.2.zip`。
3. 作品名称填写 `official-document-assistant`，必须与 `SKILL.md` 中 `name` 一致。
4. 审核通过后，进入“我的技能”复制 SkillHub 发布链接。
5. 将发布链接补入评审材料 DOCX 的 `Skill发布链接` 字段。

# Contest Utility Tools

## preflight_check.py

Run before upload or after any package change:

```bash
python _contest/tools/preflight_check.py
```

It checks:

- Skill ZIP exists and has `SKILL.md` at the root.
- Skill ZIP text files are UTF-8 and contain no NUL bytes.
- Skill ZIP size and file count are within submission limits.
- Extracted Skill ZIP can run `review`, `draft`, and `brief` smoke tests.
- Extracted Skill ZIP warns on personal sensitive information and confidential/internal material.
- Extracted Skill ZIP generates a redacted preview without exposing original phone or ID card numbers.
- Materials ZIP contains required review, promotion, and poster files.

Expected result:

```text
summary: 21/21 passed
```

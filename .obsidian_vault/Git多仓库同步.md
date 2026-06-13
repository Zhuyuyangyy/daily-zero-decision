# Git多仓库同步

> 57个项目repos的同步状态管理

---

## 当前状态 (2026-06-13)

| 状态 | 数量 |
|------|------|
| 总repos | 57 |
| ✅ 已同步 | 57 |
| ⚠️ 有问题 | 0 |

---

## 同步脚本

```bash
# 检查所有repos
for repo in */; do
  if [ -d "$repo/.git" ]; then
    cd "$repo"
    git push origin main
    cd - >/dev/null
  fi
done
```

---

## 常见问题

### Network Reset
```
fatal: Recv failure: Connection was reset
```
解决：等待10秒后重试

### Merge Conflict
解决：`git stash` → `git pull --rebase` → `git stash pop`

### Force Push
```bash
git push --force origin main
```

---

## 发布新Skill到GitHub

```bash
cd _skill
gh repo create llm-autoresearch-pipeline --public
git add . && git commit
git push origin main
gh release create v0.1.0 --title "v0.1.0"
```

---

标签: #git #自动化

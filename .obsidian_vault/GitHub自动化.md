# GitHub自动化

> 发布Skill和批量同步repos

---

## 发布Skill到GitHub

```bash
cd _skill
git init -b main
git add . && git commit
gh repo create <name> --public
git push origin main
gh release create v0.1.0 --title "v0.1.0"
```

## 批量同步所有repos

```bash
for repo in */; do
  if [ -d "$repo/.git" ]; then
    cd "$repo"
    git add . && git commit -m "chore: update"
    git push origin main
    cd - >/dev/null
  fi
done
```

---

标签: #git #automation

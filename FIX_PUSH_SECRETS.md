# Fix GitHub push blocked by secret scanning

GitHub blocked your push because **Google OAuth Client ID and Client Secret** were committed inside the `.history/` folder (editor local-history backups).

## What was done

- **`.history/`** has been added to `.gitignore` so it is never committed again.

---

## Recommended: use the script (Windows)

`git filter-branch` often fails on Windows (signal pipe errors). Use the script instead:

### 1. Close Cursor/VS Code completely

So `.git/index.lock` is released and no process is using the repo.

### 2. Open PowerShell in the project folder

```powershell
cd D:\Api_indiaholiday_nodejs
```

### 3. Run the fix script

```powershell
.\fix-secrets-and-push.ps1
```

This creates a **new history** with one commit that has no `.history/` and no secrets.

### 4. Force push

```powershell
git push --force origin backend
```

---

## Manual steps (if you prefer)

### 1. Close Cursor/VS Code (or any Git GUI)

### 2. Remove `.git/index.lock` if it exists

```powershell
Remove-Item .git/index.lock -Force -ErrorAction SilentlyContinue
```

### 3. Remove `.history` from the index and rewrite history

Either use the script above, or try (can fail on Windows):

```powershell
git filter-branch --force --index-filter "git rm -r --cached --ignore-unmatch .history" --prune-empty HEAD
```

### 4. Force push

```powershell
git push --force origin backend
```

**Note:** Force push rewrites history. If others use `backend`, coordinate with them first.

---

## Important: rotate the exposed secrets

The **Google OAuth Client Secret** was in Git history and should be treated as compromised.

1. Open [Google Cloud Console](https://console.cloud.google.com/) → your project → **APIs & Services** → **Credentials**.
2. Edit the OAuth 2.0 Client ID used by this app.
3. Create a **new client secret** and update your local `.env` with the new value.
4. Remove or revoke the old client secret.

The **Client ID** can stay; rotating the **secret** is what matters for security.

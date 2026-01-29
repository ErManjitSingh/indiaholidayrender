# Run this script AFTER closing Cursor/VS Code (so .git/index.lock is released).
# Open PowerShell in this folder and run: .\fix-secrets-and-push.ps1

Set-Location $PSScriptRoot

# Remove stale lock so Git can run
if (Test-Path .git/index.lock) {
    Remove-Item .git/index.lock -Force
    Write-Host "Removed .git/index.lock"
}

# Create new branch with NO history (so no secrets in any commit)
git checkout --orphan backend-clean
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Unstage everything
git rm -rf --cached . 2>$null

# Re-add everything; .gitignore will exclude .history/
git add .
$staged = git diff --cached --name-only
if ($staged -match "\.history") {
    git reset HEAD .history
    git status --short .history
}
git status

# Single clean commit (no .history, no secrets)
git commit -m "Initial Node.js backend setup (no secrets in history)"

# Replace backend with this clean history
git branch -D backend
git branch -m backend

Write-Host ""
Write-Host "Done. Push with:  git push --force origin backend"
Write-Host "Then rotate your Google OAuth Client Secret in Google Cloud Console."

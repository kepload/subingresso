# scripts/session-backup.ps1
# Crea un tag git "backup/session-YYYYMMDD-HHMMSS" su HEAD e lo pusha su GitHub.
# Da lanciare PRIMA di qualsiasi modifica in una nuova sessione AI (Codex, Claude o altro).
#
# USO:
#   .\scripts\session-backup.ps1                       # tag minimal
#   .\scripts\session-backup.ps1 -Reason "test-codex"  # tag con motivo nel nome
#
# RIPRISTINO IN CASO DI DISASTRO:
#   git log --oneline -20                       # trova l'ultimo backup tag
#   git tag -l "backup/session-*"               # lista tutti i tag di backup
#   git reset --hard backup/session-YYYYMMDD-HHMMSS    # torna a quel punto

param(
    [string]$Reason = ""
)

$ErrorActionPreference = "Stop"

# Verifica siamo in un repo git
$repoRoot = git rev-parse --show-toplevel 2>$null
if (-not $repoRoot) {
    Write-Host "ERRORE: non sei dentro un repo git." -ForegroundColor Red
    exit 1
}

# Costruisci nome tag
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$suffix = if ($Reason) { "-$($Reason -replace '[^a-zA-Z0-9-]','')" } else { "" }
$tagName = "backup/session-$ts$suffix"

# Verifica che non esista già (improbabile col timestamp al secondo)
$existing = git tag -l $tagName
if ($existing) {
    Write-Host "Tag $tagName esiste già. Salto." -ForegroundColor Yellow
    exit 0
}

# Verifica stato pulito (warn ma non blocca)
$dirty = git status --porcelain
if ($dirty) {
    Write-Host "ATTENZIONE: working tree NON pulito. Il tag punterà all'ultimo commit, non alle modifiche non committate." -ForegroundColor Yellow
}

# Crea il tag
$headSha = (git rev-parse --short HEAD).Trim()
$msg = "Session backup $ts -- agent handoff checkpoint. HEAD=$headSha"
git tag -a $tagName -m $msg
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRORE creazione tag." -ForegroundColor Red
    exit 1
}
Write-Host "Tag locale creato: $tagName -> $headSha" -ForegroundColor Green

# Push del tag su origin (no 2>&1: in PS 5.1 wrappa stderr come NativeCommandError)
git push origin $tagName | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Tag pushato su GitHub. Sicuro." -ForegroundColor Green
} else {
    Write-Host "Tag locale OK ma push fallito. Riprova con: git push origin $tagName" -ForegroundColor Yellow
}

# Cleanup: tieni solo gli ultimi 30 backup tag locali (i remoti restano per sempre)
$oldTags = git tag -l "backup/session-*" | Sort-Object -Descending | Select-Object -Skip 30
if ($oldTags) {
    foreach ($t in $oldTags) { try { git tag -d $t -ErrorAction Stop | Out-Null } catch {} }
    Write-Host "Cleanup: rimossi $($oldTags.Count) tag locali vecchi (sopra i 30)." -ForegroundColor Gray
}

Write-Host ""
Write-Host "Per tornare a questo punto in futuro:" -ForegroundColor Cyan
Write-Host "  git reset --hard $tagName" -ForegroundColor Cyan

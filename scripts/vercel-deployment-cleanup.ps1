param([switch]$Apply)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
try {
    $nodePath = (Get-Command node.exe -ErrorAction Stop).Source
    $vercelCommand = (Get-Command vercel.cmd -ErrorAction Stop).Source
    $vercelEntry = Join-Path (Split-Path -Parent $vercelCommand) 'node_modules\vercel\dist\vc.js'
    if (-not (Test-Path -LiteralPath $vercelEntry -PathType Leaf)) {
        throw 'Vercel CLI non trovata. Pulizia interrotta.'
    }
    $cleanupArgs = @((Join-Path $PSScriptRoot 'vercel-deployment-cleanup.cjs'), '--cli-entry', $vercelEntry)
    if ($Apply) { $cleanupArgs += '--apply' }
    Push-Location -LiteralPath $projectRoot
    try {
        & $nodePath @cleanupArgs
        $cleanupExitCode = $LASTEXITCODE
    } finally {
        Pop-Location
    }
} catch {
    $reportDirectory = Join-Path $projectRoot '.local\verifiche\vercel-cleanup'
    [System.IO.Directory]::CreateDirectory($reportDirectory) | Out-Null
    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $report = [pscustomobject]@{ complete = $false; stage = 'launcher'; error = 'Avvio non riuscito. Verificare Node.js, Vercel CLI e i percorsi del task.' }
    $reportPath = Join-Path $reportDirectory "$timestamp-launcher-error.json"
    [System.IO.File]::WriteAllText($reportPath, ($report | ConvertTo-Json), (New-Object System.Text.UTF8Encoding($false)))
    $cleanupExitCode = 1
}
exit $cleanupExitCode

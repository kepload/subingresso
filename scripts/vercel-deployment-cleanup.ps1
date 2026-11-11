param([switch]$Apply)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
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
exit $cleanupExitCode

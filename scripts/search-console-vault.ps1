param([Parameter(Mandatory=$true)][ValidateSet('protect','unprotect')][string]$Action)
$ErrorActionPreference = 'Stop'
try {
    Add-Type -AssemblyName System.Security
    $inputText = [Console]::In.ReadToEnd()
    $entropy = [Text.Encoding]::UTF8.GetBytes('subingresso-search-console-v1')
    if ($Action -eq 'protect') {
        $bytes = [Text.Encoding]::UTF8.GetBytes($inputText)
        $encrypted = [Security.Cryptography.ProtectedData]::Protect($bytes, $entropy, [Security.Cryptography.DataProtectionScope]::CurrentUser)
        [Console]::Out.Write([Convert]::ToBase64String($encrypted))
    } else {
        $encrypted = [Convert]::FromBase64String($inputText.Trim())
        $bytes = [Security.Cryptography.ProtectedData]::Unprotect($encrypted, $entropy, [Security.Cryptography.DataProtectionScope]::CurrentUser)
        [Console]::Out.Write([Text.Encoding]::UTF8.GetString($bytes))
    }
} catch {
    [Console]::Error.Write('Archivio credenziali non accessibile con questo utente Windows.')
    exit 1
}

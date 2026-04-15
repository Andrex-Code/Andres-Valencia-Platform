. (Join-Path $PSScriptRoot "common.ps1")

$projectRoot = Get-ProjectRoot
$port = 4173

Write-Host ""
Write-Host "Portafolio listo en http://127.0.0.1:$port" -ForegroundColor Cyan
Write-Host "Presiona Ctrl+C para detenerlo." -ForegroundColor DarkGray
Write-Host ""

Invoke-ProjectPython -Arguments @("-m", "http.server", "$port", "--bind", "127.0.0.1") -WorkingDirectory $projectRoot

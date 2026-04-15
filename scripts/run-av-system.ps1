. (Join-Path $PSScriptRoot "common.ps1")

$projectRoot = Get-ProjectRoot
$appRoot = Join-Path $projectRoot "av-system"

Write-Host ""
Write-Host "AV System listo en http://127.0.0.1:8765" -ForegroundColor Cyan
Write-Host "Login admin: http://127.0.0.1:8765/login" -ForegroundColor DarkGray
Write-Host "Login cliente: http://127.0.0.1:8765/client-login" -ForegroundColor DarkGray
Write-Host "Presiona Ctrl+C para detenerlo." -ForegroundColor DarkGray
Write-Host ""

Invoke-ProjectPython -Arguments @("app.py") -WorkingDirectory $appRoot

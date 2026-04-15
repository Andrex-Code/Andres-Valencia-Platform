. (Join-Path $PSScriptRoot "common.ps1")

$projectRoot = Get-ProjectRoot
$appRoot = Join-Path $projectRoot "av-system"

Write-Host ""
Write-Host "Exportando la version publica de AV System..." -ForegroundColor Cyan
Write-Host ""

Invoke-ProjectPython -Arguments @("export_static.py") -WorkingDirectory $appRoot

Write-Host ""
Write-Host "Exportacion terminada en av-system\deploy\" -ForegroundColor Green

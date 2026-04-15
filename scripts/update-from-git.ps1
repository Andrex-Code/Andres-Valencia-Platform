Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Push-Location $projectRoot
try {
    Write-Host ""
    Write-Host "Estado actual del proyecto:" -ForegroundColor Cyan
    git status --short --branch

    Write-Host ""
    Write-Host "Descargando cambios remotos..." -ForegroundColor Cyan
    git fetch origin

    Write-Host ""
    Write-Host "Aplicando cambios de la rama actual..." -ForegroundColor Cyan
    git pull --ff-only

    Write-Host ""
    Write-Host "Proyecto actualizado." -ForegroundColor Green
} finally {
    Pop-Location
}

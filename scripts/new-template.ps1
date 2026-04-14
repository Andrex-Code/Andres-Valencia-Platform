param(
  [Parameter(Mandatory = $true)]
  [string]$Slug,

  [Parameter(Mandatory = $true)]
  [string]$Name,

  [Parameter(Mandatory = $true)]
  [string]$Category
)

$root = Split-Path -Parent $PSScriptRoot
$templatePath = Join-Path $root "templates/$Slug"

if (Test-Path $templatePath) {
  Write-Error "La plantilla '$Slug' ya existe en $templatePath"
  exit 1
}

New-Item -ItemType Directory -Path $templatePath | Out-Null

@"
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>$Name</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 40px;
      background: #f8fafc;
      color: #0f172a;
    }
    .card {
      max-width: 720px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>$Name</h1>
    <p>Plantilla base para categoria: $Category.</p>
    <p>Edita este archivo para construir el sitio final.</p>
  </div>
</body>
</html>
"@ | Set-Content -Encoding UTF8 (Join-Path $templatePath "index.html")

@"
# $Name

## Categoria
$Category

## Archivos
- index.html

## Pendientes
- Definir paleta visual
- Definir secciones
- Adaptar copy del negocio
"@ | Set-Content -Encoding UTF8 (Join-Path $templatePath "README.md")

Write-Host "Plantilla creada: $templatePath"
Write-Host "Recuerda actualizar catalog/templates.json con la nueva entrada."

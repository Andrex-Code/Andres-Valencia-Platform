Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-ProjectRoot {
    return (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}

function Resolve-ProjectPython {
    $projectRoot = Get-ProjectRoot
    $portablePython = Join-Path $projectRoot "tools\python\python.exe"

    if (Test-Path $portablePython) {
        return $portablePython
    }

    foreach ($commandName in @("python", "py")) {
        $command = Get-Command $commandName -ErrorAction SilentlyContinue
        if ($command) {
            return $command.Source
        }
    }

    throw "No encontre Python. Usa una instalacion normal o copia un Python portable en tools\python\python.exe."
}

function Invoke-ProjectPython {
    param(
        [Parameter(Mandatory = $true)]
        [string[]] $Arguments,

        [string] $WorkingDirectory = (Get-ProjectRoot)
    )

    $python = Resolve-ProjectPython
    Push-Location $WorkingDirectory
    try {
        & $python @Arguments
        $exitCode = $LASTEXITCODE
    } finally {
        Pop-Location
    }

    if ($exitCode -ne 0) {
        throw "Python termino con codigo $exitCode."
    }
}

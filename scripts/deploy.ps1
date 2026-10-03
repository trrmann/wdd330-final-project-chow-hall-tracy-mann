$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot

function Invoke-NpmStep {
  param([Parameter(Mandatory)][string]$Name)

  Write-Host "`n==> npm run $Name" -ForegroundColor Cyan
  & npm.cmd run $Name

  if ($LASTEXITCODE -ne 0) {
    throw "npm run $Name failed with exit code $LASTEXITCODE. Stopping deployment."
  }
}

Push-Location $projectRoot
try {
  Invoke-NpmStep -Name 'build'
  Invoke-NpmStep -Name 'format'
  Invoke-NpmStep -Name 'lint'

  Write-Host "`nAll checks passed. Starting the local site..." -ForegroundColor Green
  & npm.cmd run start
}
finally {
  Pop-Location
}
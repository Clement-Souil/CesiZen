# 1. On lit l'URL dans le fichier config.json
$config = Get-Content "config.json" | ConvertFrom-Json
$newUrl = $config.apiUrl

Write-Host "Mise à jour vers : $newUrl" -ForegroundColor Cyan

# 2. Mise à jour du WEB (.env)
$webEnvPath = "cesizen-web/.env"
if (Test-Path $webEnvPath) {
    (Get-Content $webEnvPath) -replace 'VITE_API_URL=.*', "VITE_API_URL=$newUrl" | Set-Content $webEnvPath
    Write-Host "[Web] .env mis à jour." -ForegroundColor Green
}

$mobileApiPath = "CESIZenMobile/src/services/api.ts"

if (Test-Path $mobileApiPath) {
    (Get-Content $mobileApiPath) `
        -replace "const API_BASE_URL = 'https://.*'", "const API_BASE_URL = '$newUrl'" `
        | Set-Content $mobileApiPath

    Write-Host "[Mobile] api.ts mis à jour avec succès." -ForegroundColor Green
}
# Safe sync script: backup current frontend and copy downloaded UI into frontend
$ErrorActionPreference = 'Stop'

# Modify these paths if your downloaded folder is somewhere else
$source = 'C:\Users\ktkrr\Downloads\chrome downloads'
$dest = Join-Path (Get-Location) 'frontend'

if (-not (Test-Path $source)) {
    Write-Error "Source folder not found: $source"
    exit 1
}

# Create backup
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backup = Join-Path (Get-Location) "frontend-backup-$timestamp"
Write-Output "Creating backup: $backup"
Copy-Item -Path $dest -Destination $backup -Recurse -Force

Write-Output "Copying from $source to $dest (this will overwrite files in frontend/)"
Get-ChildItem -Path $source -Recurse | ForEach-Object {
    $relative = Resolve-Path $_.FullName | ForEach-Object { $_.Path.Replace($source, '') }
    $target = Join-Path $dest $relative
    if ($_.PSIsContainer) {
        if (-not (Test-Path $target)) { New-Item -ItemType Directory -Path $target | Out-Null }
    } else {
        Copy-Item -Path $_.FullName -Destination $target -Force
    }
}

Write-Output "Sync complete. Review changes and run npm install in frontend/ if needed."

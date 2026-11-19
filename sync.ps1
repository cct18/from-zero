param(
    [ValidateSet("AutoSync", "ProjectToGlobal", "GlobalToProject", "Watch")]
    [string]$Mode = "AutoSync"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectSkillDir = Join-Path $ProjectRoot "skills\from-zero"
$ProjectRulesDir = Join-Path $ProjectRoot "rules"
$ProjectPluginJson = Join-Path $ProjectRoot "plugin.json"
$ProjectReadme = Join-Path $ProjectRoot "README.md"

$GlobalPluginDir = Join-Path $env:USERPROFILE ".gemini\config\plugins\from-zero"
$GlobalSkillDir = Join-Path $GlobalPluginDir "skills\from-zero"
$GlobalRulesDir = Join-Path $GlobalPluginDir "rules"
$GlobalPluginJson = Join-Path $GlobalPluginDir "plugin.json"
$GlobalReadme = Join-Path $GlobalPluginDir "README.md"

function Ensure-RealDirectory([string]$Path) {
    if (Test-Path -LiteralPath $Path) {
        $item = Get-Item -LiteralPath $Path -Force
        if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
            $item.Delete()
            New-Item -ItemType Directory -Path $Path -Force | Out-Null
        }
    } else {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Sync-FilePair([string]$FileA, [string]$FileB, [string]$Direction = "Auto") {
    $existsA = Test-Path -LiteralPath $FileA
    $existsB = Test-Path -LiteralPath $FileB
    if (-not $existsA -and -not $existsB) { return }

    Ensure-RealDirectory (Split-Path -Parent $FileA)
    Ensure-RealDirectory (Split-Path -Parent $FileB)

    if ($Direction -eq "AToB" -or ($existsA -and -not $existsB)) {
        Copy-Item -LiteralPath $FileA -Destination $FileB -Force
        return
    }
    if ($Direction -eq "BToA" -or ($existsB -and -not $existsA)) {
        Copy-Item -LiteralPath $FileB -Destination $FileA -Force
        return
    }

    $timeA = (Get-Item -LiteralPath $FileA).LastWriteTimeUtc
    $timeB = (Get-Item -LiteralPath $FileB).LastWriteTimeUtc
    if ([Math]::Abs(($timeA - $timeB).TotalSeconds) -le 1) { return }

    if ($timeA -gt $timeB) {
        Copy-Item -LiteralPath $FileA -Destination $FileB -Force
        Write-Host "[Sync -> Global] $FileB" -ForegroundColor Green
    } else {
        Copy-Item -LiteralPath $FileB -Destination $FileA -Force
        Write-Host "[Sync -> Project] $FileA" -ForegroundColor Yellow
    }
}

function Sync-TreePair([string]$DirA, [string]$DirB, [string]$Direction = "Auto") {
    Ensure-RealDirectory $DirA
    Ensure-RealDirectory $DirB

    if ($Direction -eq "AToB") {
        robocopy $DirA $DirB /MIR /NFL /NDL /NJH /NJS | Out-Null
        return
    }
    if ($Direction -eq "BToA") {
        robocopy $DirB $DirA /MIR /NFL /NDL /NJH /NJS | Out-Null
        return
    }

    $relPaths = New-Object System.Collections.Generic.HashSet[string]
    Get-ChildItem -LiteralPath $DirA -Recurse -File | ForEach-Object {
        [void]$relPaths.Add($_.FullName.Substring($DirA.Length).TrimStart('\'))
    }
    Get-ChildItem -LiteralPath $DirB -Recurse -File | ForEach-Object {
        [void]$relPaths.Add($_.FullName.Substring($DirB.Length).TrimStart('\'))
    }

    foreach ($rel in $relPaths) {
        $fA = Join-Path $DirA $rel
        $fB = Join-Path $DirB $rel
        Sync-FilePair -FileA $fA -FileB $fB -Direction "Auto"
    }
}

function Invoke-Sync([string]$DirMode) {
    Sync-FilePair -FileA $ProjectPluginJson -FileB $GlobalPluginJson -Direction $DirMode
    Sync-FilePair -FileA $ProjectReadme -FileB $GlobalReadme -Direction $DirMode
    Sync-TreePair -DirA $ProjectRulesDir -DirB $GlobalRulesDir -Direction $DirMode
    Sync-TreePair -DirA $ProjectSkillDir -DirB $GlobalSkillDir -Direction $DirMode
}

if ($Mode -eq "AutoSync") {
    Write-Host "=== Bidirectional Smart Sync (Newest Wins): Project <-> Global ===" -ForegroundColor Cyan
    Invoke-Sync -DirMode "Auto"
    Write-Host "[OK] Synchronized Project ($ProjectRoot) <-> Global ($GlobalPluginDir)" -ForegroundColor Cyan
}
elseif ($Mode -eq "ProjectToGlobal") {
    Invoke-Sync -DirMode "AToB"
    Write-Host "[OK] Mirrored Project -> Global ($GlobalPluginDir)" -ForegroundColor Green
}
elseif ($Mode -eq "GlobalToProject") {
    Invoke-Sync -DirMode "BToA"
    Write-Host "[OK] Mirrored Global -> Project ($ProjectRoot)" -ForegroundColor Yellow
}
elseif ($Mode -eq "Watch") {
    Invoke-Sync -DirMode "Auto"
    Write-Host "=== Watching Project & Global Skill Directories for Real-Time Sync (Ctrl+C to stop) ===" -ForegroundColor Cyan
    $watcherA = New-Object System.IO.FileSystemWatcher $ProjectRoot -Property @{ IncludeSubdirectories = $true; EnableRaisingEvents = $true }
    $watcherB = New-Object System.IO.FileSystemWatcher $GlobalPluginDir -Property @{ IncludeSubdirectories = $true; EnableRaisingEvents = $true }
    while ($true) {
        Start-Sleep -Milliseconds 800
        Invoke-Sync -DirMode "Auto"
    }
}

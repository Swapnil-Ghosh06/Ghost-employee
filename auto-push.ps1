# ============================================
# Ghost Employee -- Auto Push Watcher
# Watches for file changes and auto-pushes to GitHub
# ============================================

$repoPath = "c:\Code with Swap\Swapnil\Ghost Rider"
$debounceSeconds = 5

Write-Host ""
Write-Host "  Ghost Employee -- Auto Push Watcher" -ForegroundColor Cyan
Write-Host "  Watching: $repoPath" -ForegroundColor DarkGray
Write-Host "  Debounce: $debounceSeconds seconds after last change" -ForegroundColor DarkGray
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $repoPath
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::FileName

$ignoredPatterns = @('\.git', 'node_modules', '__pycache__', '\.env$', '\.log$', 'dist\\', '\.next\\')

$script:lastChangeTime = [DateTime]::MinValue
$script:pendingPush = $false
$script:changedFiles = [System.Collections.Generic.HashSet[string]]::new()

function Should-Ignore($path) {
    foreach ($pattern in $ignoredPatterns) {
        if ($path -match $pattern) { return $true }
    }
    return $false
}

function On-Change($path) {
    if (Should-Ignore $path) { return }
    $script:lastChangeTime = [DateTime]::Now
    $script:pendingPush = $true
    $null = $script:changedFiles.Add($path)
    Write-Host "  [CHANGED] $(Split-Path $path -Leaf)" -ForegroundColor Yellow
}

$action = { On-Change $Event.SourceEventArgs.FullPath }
Register-ObjectEvent $watcher Changed -Action $action | Out-Null
Register-ObjectEvent $watcher Created -Action $action | Out-Null
Register-ObjectEvent $watcher Deleted -Action $action | Out-Null
Register-ObjectEvent $watcher Renamed -Action { On-Change $Event.SourceEventArgs.FullPath } | Out-Null

Write-Host "  [ACTIVE] Watcher running. Make a change to trigger auto-push..." -ForegroundColor Green
Write-Host ""

try {
    while ($true) {
        Start-Sleep -Milliseconds 500

        if ($script:pendingPush) {
            $elapsed = ([DateTime]::Now - $script:lastChangeTime).TotalSeconds
            if ($elapsed -ge $debounceSeconds) {
                $script:pendingPush = $false
                $script:changedFiles.Clear()

                Set-Location $repoPath

                $status = git status --porcelain
                if ($status) {
                    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                    $commitMsg = "auto: save at $timestamp"

                    Write-Host ""
                    Write-Host "  [PUSHING] $timestamp" -ForegroundColor Cyan
                    git add .
                    git commit -m $commitMsg --quiet
                    git push --quiet

                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "  [OK] Pushed successfully" -ForegroundColor Green
                    } else {
                        Write-Host "  [ERROR] Push failed -- check connection or auth" -ForegroundColor Red
                    }
                    Write-Host ""
                }
            }
        }
    }
} finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Get-EventSubscriber | Unregister-Event
    Write-Host ""
    Write-Host "  [STOPPED] Watcher stopped." -ForegroundColor DarkGray
}

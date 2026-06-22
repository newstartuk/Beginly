$ErrorActionPreference = 'Continue'
$log = "$env:USERPROFILE\Desktop\beginly_fix_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$null = New-Item -Path $log -ItemType File -Force

function Write-Log {
    $msg = "$(Get-Date -Format 'HH:mm:ss') $_"
    $msg | Out-File -FilePath $log -Append
    Write-Host $msg
}

Push-Location "C:\Users\akino\.qclaw-oversea\workspace\NewstartUK"

Write-Log "=== Git: stage + commit ==="
git add app/checklist/page.tsx components/ChecklistContent.tsx .gitignore
git status --short | Out-File -FilePath $log -Append
git commit -m "fix: wrap checklist client component in Suspense boundary (Next.js 15)"
git log --oneline -3 | Out-File -FilePath $log -Append

Write-Log "=== Git: push ==="
git push origin master 2>&1 | Out-File -FilePath $log -Append

Write-Log "=== Done ==="
Write-Host "Log: $log"
Read-Host "Press Enter to exit"

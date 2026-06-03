$ErrorActionPreference = 'Continue'
$log = "$env:USERPROFILE\Desktop\sm_brand_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$null = New-Item -Path $log -ItemType File -Force
$start = Get-Date

function Write-Log {
    $msg = "$(Get-Date -Format 'HH:mm:ss') $_"
    $msg | Out-File -FilePath $log -Append
    Write-Host $msg
}

Push-Location "C:\Users\akino\.qclaw-oversea\workspace\SettleMap"
Write-Log "=== Staging and committing ==="
git add app/page.tsx
git status --short | Out-File -FilePath $log -Append
git commit -m "fix: broaden homepage audience language to include all UK newcomers

- Replace 'international students' with 'everyone arriving in the UK'
- Update CTA copy to reference 'newcomers from around the world'
- Fix feature card to say 'newcomers' not 'international students'"
git log --oneline -3 | Out-File -FilePath $log -Append

Write-Log "=== Pushing to GitHub ==="
git push origin master 2>&1 | Out-File -FilePath $log -Append

$elapsed = (Get-Date) - $start
Write-Log "Done in $($elapsed.TotalSeconds.ToString('F0'))s"
Write-Host "Log: $log"

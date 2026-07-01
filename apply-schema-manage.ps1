$headers = @{
  "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwenh0cHdhanhxYmd5cXRiYm14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA4NDQ1MCwiZXhwIjoyMDk2NjYwNDUwfQ.zniwTnx6SqswyGly2k2TkdEwihnUHD6wYlGe7Oulk6Q"
  "Content-Type" = "application/json"
}

$body = @{
  "query" = "select table_name from information_schema.tables where table_schema='public' order by table_name"
} | ConvertTo-Json

try {
  $r = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/cpzxtpwajxqbgyqtbbmx/database/query" -Method POST -Headers $headers -Body $body -TimeoutSec 30
  Write-Host "SUCCESS: $(($r | ConvertTo-Json -Depth 5))"
} catch {
  Write-Host "ERROR: $($_.Exception.Message)"
  Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
}

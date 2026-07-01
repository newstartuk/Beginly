$headers = @{
  "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwenh0cHdhanhxYmd5cXRiYm14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA4NDQ1MCwiZXhwIjoyMDk2NjYwNDUwfQ.zniwTnx6SqswyGly2k2TkdEwihnUHD6wYlGe7Oulk6Q"
  "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwenh0cHdhanhxYmd5cXRiYm14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA4NDQ1MCwiZXhwIjoyMDk2NjYwNDUwfQ.zniwTnx6SqswyGly2k2TkdEwihnUHD6wYlGe7Oulk6Q"
  "Content-Type" = "application/json"
}

# Try to call pg_execute RPC to run SQL
$body = @{
  "query" = "select table_name from information_schema.tables where table_schema='public' order by table_name"
} | ConvertTo-Json

# Try different Supabase API endpoints
$endpoints = @(
  "https://cpzxtpwajxqbgyqtbbmx.supabase.co/rest/v1/rpc/pg_execute",
  "https://cpzxtpwajxqbgyqtbbmx.supabase.co/rest/v1/rpc/exec",
  "https://cpzxtpwajxqbgyqtbbmx.supabase.co/database/query",
  "https://cpzxtpwajxqbgyqtbbmx.supabase.co/postgrest/rpc"
)

foreach ($ep in $endpoints) {
  try {
    $r = Invoke-RestMethod -Uri $ep -Method POST -Headers $headers -Body $body -TimeoutSec 10
    Write-Host "[$ep] SUCCESS: $($r | ConvertTo-Json -Depth 3)"
  } catch {
    Write-Host "[$ep] FAIL: $($_.Exception.Message.Split("`n")[0])"
  }
}

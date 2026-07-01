$headers = @{
  "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwenh0cHdhanhxYmd5cXRiYm14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA4NDQ1MCwiZXhwIjoyMDk2NjYwNDUwfQ.zniwTnx6SqswyGly2k2TkdEwihnUHD6wYlGe7Oulk6Q"
  "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwenh0cHdhanhxYmd5cXRiYm14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA4NDQ1MCwiZXhwIjoyMDk2NjYwNDUwfQ.zniwTnx6SqswyGly2k2TkdEwihnUHD6wYlGe7Oulk6Q"
  "Content-Type" = "application/json"
}

# Try querying information_schema to see what tables exist
$uri = "https://cpzxtpwajxqbgyqtbbmx.supabase.co/rest/v1/information_schema.tables?schema=eq.public&select=table_name"

try {
  $r = Invoke-WebRequest -Uri $uri -Method GET -Headers $headers -TimeoutSec 15
  Write-Host "Status: $($r.StatusCode)"
  Write-Host "Content: $($r.Content)"
} catch {
  Write-Host "Error: $($_.Exception.Message)"
}

# Also try the pg_* catalog
$uri2 = "https://cpzxtpwajxqbgyqtbbmx.supabase.co/rest/v1/pg_tables?schema=eq.public&select=tablename"
try {
  $r2 = Invoke-WebRequest -Uri $uri2 -Method GET -Headers $headers -TimeoutSec 15
  Write-Host "pg_tables Status: $($r2.StatusCode)"
  Write-Host $r2.Content
} catch {
  Write-Host "pg_tables Error: $($_.Exception.Message)"
}

$headers = @{
  "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwenh0cHdhanhxYmd5cXRiYm14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA4NDQ1MCwiZXhwIjoyMDk2NjYwNDUwfQ.zniwTnx6SqswyGly2k2TkdEwihnUHD6wYlGe7Oulk6Q"
  "Content-Type" = "application/json"
  "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwenh0cHdhanhxYmd5cXRiYm14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA4NDQ1MCwiZXhwIjoyMDk2NjYwNDUwfQ.zniwTnx6SqswyGly2k2TkdEwihnUHD6wYlGe7Oulk6Q"
}

$sql = Get-Content "C:\Users\akino\Downloads\beginly_v136\beginly_v1_3_6_full_10_10_completion_source_pack\BEGINLY_SCHEMA_PATCH_v1_3_6_FULL_10_10_COMPLETION.sql" -Raw -Encoding UTF8

$body = @{
  "query" = $sql
} | ConvertTo-Json -Depth 10

$response = Invoke-RestMethod -Uri "https://cpzxtpwajxqbgyqtbbmx.supabase.co/rest/v1/rpc/pg_execute" -Method POST -Headers $headers -Body $body -TimeoutSec 60
$response | ConvertTo-Json -Depth 10

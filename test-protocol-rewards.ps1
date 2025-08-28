# Test NEAR Protocol Rewards API with real transaction data

Write-Host "Testing NEAR Protocol Rewards API..." -ForegroundColor Green

# Test 1: Get Account Information
Write-Host "`n1. Testing account info endpoint..." -ForegroundColor Yellow
$accountInfoBody = @{
    action = "getAccountInfo"
} | ConvertTo-Json

$accountResponse = Invoke-RestMethod -Uri "http://localhost:3003/api/near-protocol-rewards" -Method Post -Body $accountInfoBody -ContentType "application/json"
Write-Host "Account Info Response:" -ForegroundColor Cyan
$accountResponse | ConvertTo-Json -Depth 10

# Test 2: Collect Metrics for a date range
Write-Host "`n2. Testing metrics collection endpoint..." -ForegroundColor Yellow
$metricsBody = @{
    action = "collectMetrics"
    startDate = "2025-01-01"
    endDate = "2025-12-31"
} | ConvertTo-Json

$metricsResponse = Invoke-RestMethod -Uri "http://localhost:3003/api/near-protocol-rewards" -Method Post -Body $metricsBody -ContentType "application/json"
Write-Host "Metrics Collection Response:" -ForegroundColor Cyan
$metricsResponse | ConvertTo-Json -Depth 10

Write-Host "`nTest completed successfully!" -ForegroundColor Green
# API Test Script for LeagueLink Backend
$baseUrl = "http://localhost:5000/api"
$testResults = @()

function Add-TestResult {
    param (
        [string]$TestName,
        [bool]$Success,
        [string]$Message
    )
    
    $result = New-Object PSObject -Property @{
        TestName = $TestName
        Success = $Success
        Message = $Message
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    $global:testResults += $result
}

function Test-Endpoint {
    param (
        [string]$TestName,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [hashtable]$Headers = @{},
        [int]$ExpectedStatusCode = 200
    )

    try {
        $params = @{
            Method = $Method
            Uri = "$baseUrl$Endpoint"
            ContentType = 'application/json'
            Headers = $Headers
        }

        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }

        $response = Invoke-RestMethod @params -ErrorVariable responseError
        $statusCode = $response.StatusCode
        
        if ($statusCode -eq $ExpectedStatusCode) {
            Add-TestResult -TestName $TestName -Success $true -Message "Success (Status: $statusCode)"
            return $response
        } else {
            Add-TestResult -TestName $TestName -Success $false -Message "Unexpected status code: $statusCode"
            return $null
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = "Failed with status code: $statusCode. $($_.Exception.Message)"
        Add-TestResult -TestName $TestName -Success $false -Message $errorMessage
        return $null
    }
}

# Clear console and start tests
Clear-Host
Write-Host "Starting API Tests..." -ForegroundColor Cyan

# Test 1: Register a new user
$registerData = @{
    username = "testuser"
    email = "test@example.com"
    password = "Test123!"
}

$registerResponse = Test-Endpoint -TestName "User Registration" -Method "POST" -Endpoint "/auth/register" -Body $registerData

# Test 2: Login
$loginData = @{
    email = "test@example.com"
    password = "Test123!"
}

$loginResponse = Test-Endpoint -TestName "User Login" -Method "POST" -Endpoint "/auth/login" -Body $loginData
$token = $loginResponse.data.token

if ($token) {
    $authHeaders = @{
        "Authorization" = "Bearer $token"
    }

    # Test 3: Create a Channel
    $channelData = @{
        name = "Test Sports Channel"
        description = "A channel for testing purposes"
        sport = "Basketball"
        isPrivate = $false
    }

    $channelResponse = Test-Endpoint -TestName "Create Channel" -Method "POST" -Endpoint "/channels" -Body $channelData -Headers $authHeaders

    if ($channelResponse) {
        $channelId = $channelResponse.data._id

        # Test 4: Create a Tournament
        $tournamentData = @{
            name = "Test Tournament"
            description = "A test tournament for our sports channel"
            channelId = $channelId
            format = "single_elimination"
            startDate = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss")
            maxParticipants = 8
            rules = "Standard tournament rules apply"
            prizes = "1st Place: Trophy"
        }

        $tournamentResponse = Test-Endpoint -TestName "Create Tournament" -Method "POST" -Endpoint "/tournaments" -Body $tournamentData -Headers $authHeaders

        # Test 5: Get Channel Tournaments
        Test-Endpoint -TestName "Get Channel Tournaments" -Method "GET" -Endpoint "/tournaments/channel/$channelId" -Headers $authHeaders
    }

    # Test 6: Get User Profile
    Test-Endpoint -TestName "Get User Profile" -Method "GET" -Endpoint "/users/profile" -Headers $authHeaders
}

# Print Test Results
Write-Host "`nTest Results:" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan

$testResults | ForEach-Object {
    $color = if ($_.Success) { "Green" } else { "Red" }
    Write-Host ("`nTest: " + $_.TestName) -ForegroundColor Yellow
    Write-Host ("Status: " + $(if ($_.Success) { "PASSED" } else { "FAILED" })) -ForegroundColor $color
    Write-Host ("Message: " + $_.Message)
    Write-Host ("Timestamp: " + $_.Timestamp)
}

# Print Summary
$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Success }).Count
$failedTests = $totalTests - $passedTests

Write-Host "`nTest Summary:" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests"
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red 
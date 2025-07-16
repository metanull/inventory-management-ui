[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateNotNullOrEmpty()]
    [Alias('Url')]
    [string]$AppUrl = 'http://localhost:8000',

    [Parameter(Mandatory=$false)]
    [Alias('Timeout')]
    [int]$TimeoutSec = 10
)
Process {
    $HealthCheckUrl = "$AppUrl/api/health"
    Write-Information "Checking API health at $HealthCheckUrl with timeout of $TimeoutSec seconds..."

    Invoke-RestMethod -Uri $HealthCheckUrl -TimeoutSec $TimeoutSec -ErrorAction Stop
}

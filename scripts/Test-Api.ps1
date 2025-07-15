[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [Alias('Url')]
    [string]$AppUrl = 'http://localhost:8000',

    [Parameter(Mandatory=$false)]
    [Alias('Timeout')]
    [int]$TimeoutSec = 10
)
Process {
    try {
        return Invoke-RestMethod -Uri "$AppUrl/api/health" -TimeoutSec $TimeoutSec -ErrorAction Stop
    } catch {
        Write-Warning "Failed to connect to API at $AppUrl. Error: $_"
        return $false
    }
}

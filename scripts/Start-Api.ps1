[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateScript({ Test-Path -Path $_ -PathType Container })]
    [string]$Path = '../inventory-app',

    [Parameter(Mandatory=$false)]
    [ValidateNotNullOrEmpty()]
    [string]$Url = 'http://localhost:8000'
)
Process {
    if ((. $PsScriptRoot\Test-Api -Url $Url)) {
        Write-Warning "API server already started at $Url"
    } else {
        Push-Location $Path -ErrorAction Stop
        try {
            Write-Information "Starting API server in '$Path'..."
            php artisan serve
        } finally {
            Pop-Location
        }
    }
}
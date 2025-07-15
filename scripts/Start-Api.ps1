[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$Path = '../inventory-app',
    [Parameter(Mandatory=$false)]
    [string]$Url = 'http://localhost:8000'
)
Begin {
    $OldInformationPreference = $InformationPreference
    $InformationPreference = 'Continue'
}
Process {
    if (-not (Test-Path -Path $Path -PathType Container)) {
        throw "Path '$Path' is not a valid directory."
    }

    if ((. $PsScriptRoot\Test-Api -Url $Url)) {
        Write-Information "API server already started at $Url"
    } else {
        Push-Location $Path
        try {
            Write-Information "Starting API server in '$Path'..."
            php artisan serve
        } finally {
            Pop-Location
            $InformationPreference = $OldInformationPreference
        }
    }
}
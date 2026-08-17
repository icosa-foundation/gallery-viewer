$ErrorActionPreference = "Stop"

$repositoryRoot = $PSScriptRoot
$staticPort = 8765
$polyPort = 8766
$staticHealthUrl = "http://127.0.0.1:$staticPort/dist/comparison-side-by-side.html"
$polyHealthUrl = "http://127.0.0.1:$polyPort/comparison-fixtures.js"
$ownedProcesses = [System.Collections.Generic.List[System.Diagnostics.Process]]::new()

function Test-HttpService {
    param([Parameter(Mandatory)][string]$Url)

    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 2
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 400
    } catch {
        return $false
    }
}

function Test-TcpListener {
    param([Parameter(Mandatory)][int]$Port)

    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $connection = $client.ConnectAsync("127.0.0.1", $Port)
        return $connection.Wait(500) -and $client.Connected
    } catch {
        return $false
    } finally {
        $client.Dispose()
    }
}

function Wait-ForHttpService {
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$Url,
        [Parameter(Mandatory)][System.Diagnostics.Process]$Process,
        [int]$TimeoutSeconds = 15
    )

    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    while ([DateTime]::UtcNow -lt $deadline) {
        if ($Process.HasExited) {
            throw "$Name exited during startup with code $($Process.ExitCode)."
        }
        if (Test-HttpService -Url $Url) {
            return
        }
        Start-Sleep -Milliseconds 200
    }
    throw "$Name did not become healthy at $Url within $TimeoutSeconds seconds."
}

function Start-ManagedService {
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][int]$Port,
        [Parameter(Mandatory)][string]$HealthUrl,
        [Parameter(Mandatory)][string]$Executable,
        [Parameter(Mandatory)][string]$ArgumentLine
    )

    if (Test-HttpService -Url $HealthUrl) {
        Write-Host "$Name is already running at $HealthUrl"
        return $null
    }
    if (Test-TcpListener -Port $Port) {
        throw "Port $Port is already owned by another process, but $Name is not healthy at $HealthUrl. The existing process was left untouched."
    }

    Write-Host "Starting $Name on port $Port..."
    $process = Start-Process `
        -FilePath $Executable `
        -ArgumentList $ArgumentLine `
        -WorkingDirectory $repositoryRoot `
        -NoNewWindow `
        -PassThru
    $ownedProcesses.Add($process)
    Wait-ForHttpService -Name $Name -Url $HealthUrl -Process $process
    Write-Host "$Name is ready at $HealthUrl"
    return $process
}

$python = (Get-Command python -ErrorAction Stop).Source
$node = (Get-Command node -ErrorAction Stop).Source
$staticArguments = "-m http.server $staticPort --bind 127.0.0.1 --directory `"$repositoryRoot`""
$polyScript = Join-Path $repositoryRoot "scripts\poly-replay-server.cjs"
$polyArguments = "`"$polyScript`" $polyPort"

try {
    Start-ManagedService `
        -Name "Gallery Viewer server" `
        -Port $staticPort `
        -HealthUrl $staticHealthUrl `
        -Executable $python `
        -ArgumentLine $staticArguments | Out-Null
    Start-ManagedService `
        -Name "Poly replay server" `
        -Port $polyPort `
        -HealthUrl $polyHealthUrl `
        -Executable $node `
        -ArgumentLine $polyArguments | Out-Null

    Write-Host ""
    Write-Host "Comparison: http://127.0.0.1:$staticPort/dist/comparison-side-by-side.html"
    Write-Host "Press Ctrl+C to stop services started by this launcher."

    while ($true) {
        foreach ($process in $ownedProcesses) {
            if ($process.HasExited) {
                throw "A managed server process exited with code $($process.ExitCode)."
            }
        }
        Start-Sleep -Seconds 1
    }
} finally {
    foreach ($process in $ownedProcesses) {
        if (!$process.HasExited) {
            Write-Host "Stopping process $($process.Id)..."
            Stop-Process -Id $process.Id
            $process.WaitForExit(5000)
        }
        $process.Dispose()
    }
}

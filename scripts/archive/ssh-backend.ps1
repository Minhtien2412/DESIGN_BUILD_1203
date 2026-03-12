# SSH Backend script
# Usage: .\ssh-backend.ps1 "command"

$password = "6k4BOIRDwWhsM39F2DyM"
$host_ip = "103.200.20.100"
$user = "root"

# Create expect-like script for Windows
$command = $args[0]

# Use plink if available, otherwise use ssh with expect pattern
$plinkPath = "C:\Program Files\PuTTY\plink.exe"

if (Test-Path $plinkPath) {
    & $plinkPath -batch -pw $password "$user@$host_ip" $command
} else {
    # Try with SSH and manual password entry
    Write-Host "Please enter password: $password"
    ssh "$user@$host_ip" $command
}

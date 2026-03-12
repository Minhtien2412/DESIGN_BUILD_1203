# Java 21 Verification and Setup Script
# This script checks if Java 21 is installed and helps configure it for the project

Write-Host "=== Java 21 LTS Verification ===" -ForegroundColor Cyan
Write-Host ""

# Check current Java version
Write-Host "Checking installed Java versions..." -ForegroundColor Yellow
$javaVersion = $null
try {
    $javaOutput = java -version 2>&1 | Select-String "version"
    $javaVersion = $javaOutput -replace '.*version "([^"]*)".*', '$1'
    Write-Host "Current Java version: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "Java not found in PATH" -ForegroundColor Red
}

# Check JAVA_HOME
Write-Host ""
Write-Host "Checking JAVA_HOME environment variable..." -ForegroundColor Yellow
if ($env:JAVA_HOME) {
    Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green
    $javaHomeVersion = & "$env:JAVA_HOME\bin\java.exe" -version 2>&1 | Select-String "version"
    Write-Host "JAVA_HOME version: $javaHomeVersion" -ForegroundColor Green
} else {
    Write-Host "JAVA_HOME is not set" -ForegroundColor Yellow
}

# Check if Java 21 is available
Write-Host ""
Write-Host "Searching for Java 21 installations..." -ForegroundColor Yellow

$commonJdkPaths = @(
    "$env:ProgramFiles\Java",
    "$env:ProgramFiles\Eclipse Adoptium",
    "$env:ProgramFiles\Temurin",
    "$env:ProgramFiles\OpenJDK",
    "${env:ProgramFiles(x86)}\Java",
    "$env:LOCALAPPDATA\Programs\Java",
    "$env:USERPROFILE\.jdks"
)

$java21Paths = @()

foreach ($basePath in $commonJdkPaths) {
    if (Test-Path $basePath) {
        $jdkDirs = Get-ChildItem -Path $basePath -Directory -ErrorAction SilentlyContinue | 
                   Where-Object { $_.Name -match "jdk-?21|java-?21|temurin-?21" }
        
        foreach ($dir in $jdkDirs) {
            $javaExe = Join-Path $dir.FullName "bin\java.exe"
            if (Test-Path $javaExe) {
                $java21Paths += $dir.FullName
                Write-Host "  Found: $($dir.FullName)" -ForegroundColor Green
            }
        }
    }
}

# Provide recommendations
Write-Host ""
Write-Host "=== Recommendations ===" -ForegroundColor Cyan

if ($java21Paths.Count -gt 0) {
    Write-Host "Java 21 installation(s) found!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To use Java 21 for this project, set JAVA_HOME:" -ForegroundColor Yellow
    $escapedPath = $java21Paths[0]
    Write-Host "  setx JAVA_HOME ""$escapedPath""" -ForegroundColor White
    Write-Host ""
    Write-Host "Or update gradle.properties:" -ForegroundColor Yellow
    $gradlePath = $java21Paths[0] -replace '\\', '/'
    Write-Host "  org.gradle.java.home=$gradlePath" -ForegroundColor White
} else {
    Write-Host "✗ Java 21 not found on this system" -ForegroundColor Red
    Write-Host ""
    Write-Host "Download Java 21 LTS from one of these sources:" -ForegroundColor Yellow
    Write-Host "  1. Eclipse Temurin: https://adoptium.net/temurin/releases/?version=21" -ForegroundColor Cyan
    Write-Host "  2. Oracle JDK: https://www.oracle.com/java/technologies/downloads/#java21" -ForegroundColor Cyan
    Write-Host "  3. Microsoft OpenJDK: https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-21" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installation, run this script again to verify." -ForegroundColor Yellow
}

# Check Gradle configuration
Write-Host ""
Write-Host "=== Gradle Configuration ===" -ForegroundColor Cyan
$gradleProps = "android\gradle.properties"
if (Test-Path $gradleProps) {
    $javaHomeInGradle = Get-Content $gradleProps | Select-String "org.gradle.java.home"
    if ($javaHomeInGradle) {
        Write-Host "Gradle Java Home: $javaHomeInGradle" -ForegroundColor Green
    } else {
        Write-Host "org.gradle.java.home not set in gradle.properties" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Install JDK 21 if not already installed" -ForegroundColor White
Write-Host "2. Set JAVA_HOME or update gradle.properties" -ForegroundColor White
Write-Host "3. Restart your terminal/IDE" -ForegroundColor White
Write-Host "4. Build the project: cd android then run gradlew clean build" -ForegroundColor White
Write-Host ""

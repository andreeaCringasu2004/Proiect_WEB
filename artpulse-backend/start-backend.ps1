# =========================================================
# start-backend.ps1 - Porneste ArtPulse Backend
# Folosire: click dreapta -> "Run with PowerShell"
#       sau din terminal: .\start-backend.ps1
# =========================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ArtPulse Backend - Start Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Verifica daca portul 8081 este ocupat si elibereaza-l
$portInUse = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
if ($portInUse) {
    $pid8081 = $portInUse.OwningProcess | Select-Object -First 1
    $processName = (Get-Process -Id $pid8081 -ErrorAction SilentlyContinue).ProcessName
    Write-Host ""
    Write-Host "[!] Portul 8081 este ocupat de: $processName (PID: $pid8081)" -ForegroundColor Yellow
    Write-Host "[>] Se opreste procesul..." -ForegroundColor Yellow
    Stop-Process -Id $pid8081 -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "[OK] Portul 8081 a fost eliberat!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[OK] Portul 8081 este liber." -ForegroundColor Green
}

# Porneste backend-ul
Write-Host ""
Write-Host "[>] Se porneste Spring Boot Backend..." -ForegroundColor Cyan
Write-Host "[i] Apasa Ctrl+C apoi Y pentru a opri serverul." -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

mvn spring-boot:run

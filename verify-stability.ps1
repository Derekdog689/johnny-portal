Write-Host "🔍 DSS Enterprises | Stability Verification Script"

# Check critical directories
$paths = @(".next", "node_modules", "../pdf-server/node_modules")
foreach ($p in $paths) {
    if (Test-Path $p) {
        Write-Host "✅ Found: $p"
    } else {
        Write-Host "❌ Missing: $p"
    }
}

# Verify critical dependencies
$deps = @("react", "next", "pdfkit", "papaparse", "recharts", "file-saver")
foreach ($d in $deps) {
    try {
        npm list $d | Out-Null
        Write-Host "✅ Verified dependency: $d"
    } catch {
        Write-Host "⚠️ Missing or mismatched: $d"
    }
}

Write-Host "🔒 Stability check complete. If all ✅ are shown, environment integrity is confirmed."

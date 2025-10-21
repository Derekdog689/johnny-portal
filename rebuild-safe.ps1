Write-Host "🧱 DSS Enterprises | Johnny Portal Safe Rebuild Script"

taskkill /f /im node.exe
Remove-Item -Recurse -Force .next, node_modules, ../pdf-server/node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json, ../pdf-server/package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force

Write-Host "Installing stable, verified dependencies..."
npm install --legacy-peer-deps
cd ../pdf-server
npm install --legacy-peer-deps
cd ../johnny-portal

Write-Host "✅ All modules reinstalled successfully"
Write-Host "Starting synchronized dev environment..."
npm run dev-all

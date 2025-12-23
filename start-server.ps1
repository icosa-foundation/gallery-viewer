Set-Location "C:\Users\andyb\Documents\gallery-viewer\dist"
Write-Host "Starting HTTP server on port 8000..."
Write-Host "Access the viewer at: http://127.0.0.1:8000/index.html"
Write-Host "Press Ctrl+C to stop the server"
python -m http.server 8000

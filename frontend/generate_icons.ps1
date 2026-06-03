Add-Type -AssemblyName System.Drawing

function Create-Icon {
    param(
        [string]$Path,
        [int]$Size,
        [string]$Text,
        [string]$BgColor
    )
    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    
    $color = [System.Drawing.ColorTranslator]::FromHtml($BgColor)
    $graphics.Clear($color)
    
    $font = New-Object System.Drawing.Font("Arial", ($Size / 4), [System.Drawing.FontStyle]::Bold)
    $brush = [System.Drawing.Brushes]::White
    
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $rect = New-Object System.Drawing.RectangleF 0, 0, $Size, $Size
    $graphics.DrawString($Text, $font, $brush, $rect, $format)
    
    if ($Path.EndsWith(".ico")) {
        $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Icon)
    } else {
        $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    
    $graphics.Dispose()
    $bmp.Dispose()
}

$publicDir = "c:\Users\RUTHISH VEER\Downloads\Life_flow-main\Life_flow-main\frontend\public"

Create-Icon -Path "$publicDir\pwa-192x192.png" -Size 192 -Text "LF" -BgColor "#0f0f13"
Create-Icon -Path "$publicDir\pwa-512x512.png" -Size 512 -Text "LF" -BgColor "#0f0f13"
Create-Icon -Path "$publicDir\apple-touch-icon.png" -Size 180 -Text "LF" -BgColor "#0f0f13"
Create-Icon -Path "$publicDir\favicon.ico" -Size 32 -Text "LF" -BgColor "#0f0f13"

Write-Host "Icons generated successfully."

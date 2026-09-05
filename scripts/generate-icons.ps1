Add-Type -AssemblyName System.Drawing

$inputPath = Join-Path $PSScriptRoot "..\public\logo.png"
$fullPath = [System.IO.Path]::GetFullPath($inputPath)

if (-not (Test-Path $fullPath)) {
    Write-Error "File not found: $fullPath"
    exit 1
}

$bmp = [System.Drawing.Bitmap]::FromFile($fullPath)
Write-Host "Original Image Dimensions: $($bmp.Width) x $($bmp.Height)"

# The shield emblem in public/logo.png:
# Width is 1024. The shield is centered horizontally at x ~ 512.
# The shield extends from y roughly 180 to 920 (height ~ 740).
# Let's crop a square region around the shield with a nice margin.
# Center of emblem: x = 512, y = 520
# Box size = 880 x 880 (from x = 72 to 952, y = 80 to 960)

$cropX = 72
$cropY = 80
$cropSize = 880

function Save-ResizedIcon($srcBmp, $cropX, $cropY, $cropSize, $targetSize, $outputPath) {
    $targetBmp = New-Object System.Drawing.Bitmap($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($targetBmp)
    
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Fill background with clean white/transparent
    $g.Clear([System.Drawing.Color]::White)
    
    $srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $targetSize, $targetSize)
    
    $g.DrawImage($srcBmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    
    $targetBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $targetBmp.Dispose()
    Write-Host "Generated: $outputPath ($targetSize x $targetSize)"
}

$publicDir = Join-Path $PSScriptRoot "..\public"
$icon512 = Join-Path $publicDir "icon-512x512.png"
$icon192 = Join-Path $publicDir "icon-192x192.png"
$icon180 = Join-Path $publicDir "apple-touch-icon.png"
$icon32  = Join-Path $publicDir "favicon-32x32.png"
$icon16  = Join-Path $publicDir "favicon-16x16.png"

Save-ResizedIcon $bmp $cropX $cropY $cropSize 512 $icon512
Save-ResizedIcon $bmp $cropX $cropY $cropSize 192 $icon192
Save-ResizedIcon $bmp $cropX $cropY $cropSize 180 $icon180
Save-ResizedIcon $bmp $cropX $cropY $cropSize 32  $icon32
Save-ResizedIcon $bmp $cropX $cropY $cropSize 16  $icon16

# Generate favicon.ico from 32x32 bitmap
$iconBmp = [System.Drawing.Bitmap]::FromFile($icon32)
$hIcon = $iconBmp.GetHicon()
$ico = [System.Drawing.Icon]::FromHandle($hIcon)
$icoFileStream = [System.IO.File]::OpenWrite((Join-Path $publicDir "favicon.ico"))
$ico.Save($icoFileStream)
$icoFileStream.Close()
$ico.Dispose()
$iconBmp.Dispose()
Write-Host "Generated: favicon.ico"

$bmp.Dispose()
Write-Host "All PWA icons generated successfully!"

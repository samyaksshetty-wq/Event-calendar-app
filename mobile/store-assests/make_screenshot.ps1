Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\samya\Downloads\event-calendar-app\mobile\store-assests\WhatsApp Image 2026-08-01 at 1.03.09 PM.jpeg"
$outPath = "c:\Users\samya\Downloads\event-calendar-app\mobile\store-assests\out_65.png"

$canvasW = 1284
$canvasH = 2778

$bgColor      = [System.Drawing.ColorTranslator]::FromHtml("#F5C518")
$headlineColor = [System.Drawing.ColorTranslator]::FromHtml("#181B29")
$subColor      = [System.Drawing.ColorTranslator]::FromHtml("#3A3D2E")
$frameColor    = [System.Drawing.ColorTranslator]::FromHtml("#181B29")

$bmp = New-Object System.Drawing.Bitmap $canvasW, $canvasH
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$g.Clear($bgColor)

# Headline
$headlineFont = New-Object System.Drawing.Font("Georgia", 76, [System.Drawing.FontStyle]::Bold)
$subFont = New-Object System.Drawing.Font("Arial", 34, [System.Drawing.FontStyle]::Regular)

$headlineBrush = New-Object System.Drawing.SolidBrush($headlineColor)
$subBrush = New-Object System.Drawing.SolidBrush($subColor)

$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center

$textRect = New-Object System.Drawing.RectangleF(60, 110, ($canvasW - 120), 340)
$g.DrawString("Your Kannadiga Calendar", $headlineFont, $headlineBrush, $textRect, $sf)

$subRect = New-Object System.Drawing.RectangleF(90, 470, ($canvasW - 180), 140)
$g.DrawString("Events, festivals & community meetups - all in one place", $subFont, $subBrush, $subRect, $sf)

# Phone frame with screenshot inside
$srcImgFull = [System.Drawing.Image]::FromFile($srcPath)
$srcW = $srcImgFull.Width
# Crop off the bottom ad banner strip (test ad placeholder) - keep calendar + legend only
$cropH = [int]($srcImgFull.Height * 0.888)
$srcImg = New-Object System.Drawing.Bitmap $srcW, $cropH
$gCrop = [System.Drawing.Graphics]::FromImage($srcImg)
$gCrop.DrawImage($srcImgFull, (New-Object System.Drawing.Rectangle(0, 0, $srcW, $cropH)), 0, 0, $srcW, $cropH, [System.Drawing.GraphicsUnit]::Pixel)
$gCrop.Dispose()
$srcImgFull.Dispose()
$srcH = $cropH
$aspect = $srcW / $srcH

$frameTop = 660
$frameBottom = 2698
$frameH = $frameBottom - $frameTop
$frameW = [int]($frameH * $aspect)
$frameX = [int](($canvasW - $frameW) / 2)
$frameY = $frameTop

$radius = 60
$borderWidth = 16

function Get-RoundedRectPath($x, $y, $w, $h, $r) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

$outerPath = Get-RoundedRectPath ($frameX - $borderWidth) ($frameY - $borderWidth) ($frameW + $borderWidth*2) ($frameH + $borderWidth*2) ($radius + $borderWidth)
$frameBrush = New-Object System.Drawing.SolidBrush($frameColor)
$g.FillPath($frameBrush, $outerPath)

$innerPath = Get-RoundedRectPath $frameX $frameY $frameW $frameH $radius
$g.SetClip($innerPath)
$destRect = New-Object System.Drawing.Rectangle($frameX, $frameY, $frameW, $frameH)
$g.DrawImage($srcImg, $destRect, 0, 0, $srcW, $srcH, [System.Drawing.GraphicsUnit]::Pixel)
$g.ResetClip()

$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$srcImg.Dispose()

Write-Output "Saved: $outPath ($canvasW x $canvasH)"

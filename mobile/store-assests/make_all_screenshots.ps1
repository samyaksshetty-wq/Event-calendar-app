Add-Type -AssemblyName System.Drawing

$root = "c:\Users\samya\Downloads\event-calendar-app\mobile\store-assests"

$canvasW = 1284
$canvasH = 2778

$bgColor       = [System.Drawing.ColorTranslator]::FromHtml("#F5C518")
$headlineColor = [System.Drawing.ColorTranslator]::FromHtml("#181B29")
$subColor      = [System.Drawing.ColorTranslator]::FromHtml("#3A3D2E")
$frameColor    = [System.Drawing.ColorTranslator]::FromHtml("#181B29")

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

function New-StoreScreenshot {
    param(
        [string]$SrcPath,
        [string]$OutPath,
        [string]$Headline,
        [string]$Subheadline,
        [double]$TopCropFrac = 0.0,
        [double]$BottomKeepFrac = 0.888
    )

    $bmp = New-Object System.Drawing.Bitmap $canvasW, $canvasH
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.Clear($bgColor)

    $headlineFont = New-Object System.Drawing.Font("Georgia", 72, [System.Drawing.FontStyle]::Bold)
    $subFont = New-Object System.Drawing.Font("Arial", 34, [System.Drawing.FontStyle]::Regular)
    $headlineBrush = New-Object System.Drawing.SolidBrush($headlineColor)
    $subBrush = New-Object System.Drawing.SolidBrush($subColor)

    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center

    $textRect = New-Object System.Drawing.RectangleF(60, 130, ($canvasW - 120), 320)
    $g.DrawString($Headline, $headlineFont, $headlineBrush, $textRect, $sf)

    $subRect = New-Object System.Drawing.RectangleF(90, 470, ($canvasW - 180), 140)
    $g.DrawString($Subheadline, $subFont, $subBrush, $subRect, $sf)

    $srcImgFull = [System.Drawing.Image]::FromFile($SrcPath)
    $fullW = $srcImgFull.Width
    $fullH = $srcImgFull.Height

    $topPx = [int]($fullH * $TopCropFrac)
    $bottomPx = [int]($fullH * $BottomKeepFrac)
    $cropH = $bottomPx - $topPx

    $srcImg = New-Object System.Drawing.Bitmap $fullW, $cropH
    $gCrop = [System.Drawing.Graphics]::FromImage($srcImg)
    $gCrop.DrawImage($srcImgFull, (New-Object System.Drawing.Rectangle(0, 0, $fullW, $cropH)), 0, $topPx, $fullW, $cropH, [System.Drawing.GraphicsUnit]::Pixel)
    $gCrop.Dispose()
    $srcImgFull.Dispose()

    $srcW = $fullW
    $srcH = $cropH
    $aspect = $srcW / $srcH

    $frameTop = 660
    $frameBottom = 2698
    $frameH = $frameBottom - $frameTop
    $frameW = [int]($frameH * $aspect)
    $maxFrameW = $canvasW - 120
    if ($frameW -gt $maxFrameW) {
        $frameW = $maxFrameW
    }
    $frameX = [int](($canvasW - $frameW) / 2)
    $frameY = $frameTop

    $radius = 60
    $borderWidth = 16

    $outerPath = Get-RoundedRectPath ($frameX - $borderWidth) ($frameY - $borderWidth) ($frameW + $borderWidth*2) ($frameH + $borderWidth*2) ($radius + $borderWidth)
    $frameBrush = New-Object System.Drawing.SolidBrush($frameColor)
    $g.FillPath($frameBrush, $outerPath)

    $innerPath = Get-RoundedRectPath $frameX $frameY $frameW $frameH $radius
    $g.SetClip($innerPath)
    $destRect = New-Object System.Drawing.Rectangle($frameX, $frameY, $frameW, $frameH)
    $g.DrawImage($srcImg, $destRect, 0, 0, $srcW, $srcH, [System.Drawing.GraphicsUnit]::Pixel)
    $g.ResetClip()

    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()
    $srcImg.Dispose()

    Write-Output "Saved: $OutPath"
}

New-StoreScreenshot `
    -SrcPath "$root\WhatsApp Image 2026-08-01 at 1.03.09 PM.jpeg" `
    -OutPath "$root\shot1_calendar.png" `
    -Headline "Your Kannadiga Calendar" `
    -Subheadline "Events, festivals & community meetups - all in one place"

New-StoreScreenshot `
    -SrcPath "$root\WhatsApp Image 2026-08-02 at 9.43.08 AM (1).jpeg" `
    -OutPath "$root\shot2_search.png" `
    -Headline "Search & Discover" `
    -Subheadline "Find events by name, venue, or category in seconds" `
    -BottomKeepFrac 1.0

New-StoreScreenshot `
    -SrcPath "$root\WhatsApp Image 2026-08-02 at 9.43.08 AM (2).jpeg" `
    -OutPath "$root\shot3_saved.png" `
    -Headline "Save Your Favourites" `
    -Subheadline "Bookmark events and find them all in one place" `
    -BottomKeepFrac 0.888

New-StoreScreenshot `
    -SrcPath "$root\WhatsApp Image 2026-08-02 at 9.43.08 AM (3).jpeg" `
    -OutPath "$root\shot4_details.png" `
    -Headline "All The Details" `
    -Subheadline "Date, timing, venue, entry fee & organizer contact, in one place" `
    -BottomKeepFrac 0.888

New-StoreScreenshot `
    -SrcPath "$root\WhatsApp Image 2026-08-02 at 9.43.08 AM (4).jpeg" `
    -OutPath "$root\shot5_festival.png" `
    -Headline "Festivals, Highlighted" `
    -Subheadline "Never miss a Kannadiga festival - see them right on your calendar" `
    -BottomKeepFrac 0.888

New-StoreScreenshot `
    -SrcPath "$root\WhatsApp Image 2026-08-02 at 9.43.08 AM (5).jpeg" `
    -OutPath "$root\shot6_planahead.png" `
    -Headline "Plan Ahead With Ease" `
    -Subheadline "Multi-day festivals and events, mapped out on your calendar" `
    -TopCropFrac 0.10 `
    -BottomKeepFrac 0.90

New-StoreScreenshot `
    -SrcPath "$root\WhatsApp Image 2026-08-02 at 9.43.08 AM.jpeg" `
    -OutPath "$root\shot7_listevent.png" `
    -Headline "Got an Event?" `
    -Subheadline "Reach the local community in one tap" `
    -BottomKeepFrac 0.888

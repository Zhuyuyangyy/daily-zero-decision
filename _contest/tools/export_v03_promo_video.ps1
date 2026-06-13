$ErrorActionPreference = "Stop"

$base = "D:\ZYY Project\_contest\final-submit"
$frameDir = Join-Path $base "_v03_promo_frames"
$pptxPath = Join-Path $base "official-document-assistant-v0.3-promo-video-source.pptx"
$videoPath = Join-Path $base "official-document-assistant-v0.3-promo-vertical-no-voice.mp4"

if (Test-Path $pptxPath) {
    Remove-Item -LiteralPath $pptxPath -Force
}
if (Test-Path $videoPath) {
    Remove-Item -LiteralPath $videoPath -Force
}

$frames = Get-ChildItem -LiteralPath $frameDir -Filter "promo-*.png" | Sort-Object Name
if ($frames.Count -ne 9) {
    throw "Expected 9 frames, found $($frames.Count)"
}

$powerPoint = New-Object -ComObject PowerPoint.Application
$powerPoint.Visible = 1
$presentation = $powerPoint.Presentations.Add()

$slideWidth = 405
$slideHeight = 720
$presentation.PageSetup.SlideWidth = $slideWidth
$presentation.PageSetup.SlideHeight = $slideHeight

foreach ($frame in $frames) {
    $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, 12)
    $null = $slide.Shapes.AddPicture($frame.FullName, 0, -1, 0, 0, $slideWidth, $slideHeight)
    $slide.SlideShowTransition.AdvanceOnTime = -1
    $slide.SlideShowTransition.AdvanceTime = 5
}

$presentation.SaveAs($pptxPath)
$presentation.CreateVideo($videoPath, $true, 5, 1920, 30, 85)

$deadline = (Get-Date).AddMinutes(8)
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 2
    $status = $presentation.CreateVideoStatus
    if ($status -eq 3) {
        break
    }
    if ($status -eq 4) {
        throw "PowerPoint video export failed"
    }
}

if (-not (Test-Path $videoPath)) {
    throw "Video file was not created"
}

$presentation.Close()
$powerPoint.Quit()

[System.Runtime.InteropServices.Marshal]::ReleaseComObject($presentation) | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($powerPoint) | Out-Null

Write-Output "pptx=$pptxPath"
Write-Output "video=$videoPath"
Write-Output "bytes=$((Get-Item -LiteralPath $videoPath).Length)"

param(
    [Parameter(Mandatory=$true)][string]$Input,
    [Parameter(Mandatory=$true)][string]$Output,
    [ValidateSet('720p','1080p')][string]$Resolution = '720p',
    [int]$Crf = 23,
    [string]$Preset = 'veryfast',
    [int]$VideoKbps,
    [int]$AudioKbps = 128,
    [switch]$TwoPass
)

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Error 'ffmpeg not found in PATH. Install ffmpeg first.'
    exit 1
}

$scale = if ($Resolution -eq '1080p') { '-2:1080' } else { '-2:720' }

if ($VideoKbps) {
    # ABR mode, optional two-pass
    if ($TwoPass) {
        ffmpeg -y -i $Input -vf "scale=$scale" -c:v libx264 -profile:v main -preset $Preset -b:v ${VideoKbps}k -maxrate ${VideoKbps}k -bufsize ($VideoKbps*2).ToString()+'k' -pix_fmt yuv420p -movflags +faststart -an -pass 1 -f mp4 NUL
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        ffmpeg -y -i $Input -vf "scale=$scale" -c:v libx264 -profile:v main -preset $Preset -b:v ${VideoKbps}k -maxrate ${VideoKbps}k -bufsize ($VideoKbps*2).ToString()+'k' -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a ${AudioKbps}k -ar 48000 -ac 2 -pass 2 $Output
        exit $LASTEXITCODE
    } else {
        ffmpeg -y -i $Input -vf "scale=$scale" -c:v libx264 -profile:v main -preset $Preset -b:v ${VideoKbps}k -maxrate ${VideoKbps}k -bufsize ($VideoKbps*2).ToString()+'k' -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a ${AudioKbps}k -ar 48000 -ac 2 $Output
        exit $LASTEXITCODE
    }
} else {
    # CRF mode
    ffmpeg -y -i $Input -vf "scale=$scale" -c:v libx264 -profile:v main -preset $Preset -crf $Crf -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a ${AudioKbps}k -ar 48000 -ac 2 $Output
    exit $LASTEXITCODE
}

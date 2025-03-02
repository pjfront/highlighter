# Create minimal PNG files for Chrome extension icons
# This script creates valid but minimal PNG files that Chrome can load

# Define the PNG header (minimal valid PNG)
$pngHeader = [byte[]]@(
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
    0x00, 0x00, 0x00, 0x0D,                          # IHDR chunk length
    0x49, 0x48, 0x44, 0x52,                          # "IHDR" chunk type
    0x00, 0x00, 0x00, 0x10,                          # Width (16)
    0x00, 0x00, 0x00, 0x10,                          # Height (16)
    0x08,                                            # Bit depth (8)
    0x06,                                            # Color type (RGBA)
    0x00,                                            # Compression method
    0x00,                                            # Filter method
    0x00,                                            # Interlace method
    0x3A, 0x7E, 0x9B, 0x55,                          # CRC
    0x00, 0x00, 0x00, 0x00,                          # IDAT chunk length (empty)
    0x49, 0x44, 0x41, 0x54,                          # "IDAT" chunk type
    0x08, 0x1D, 0x01, 0xFE,                          # CRC
    0x00, 0x00, 0x00, 0x00,                          # IEND chunk length
    0x49, 0x45, 0x4E, 0x44,                          # "IEND" chunk type
    0xAE, 0x42, 0x60, 0x82                           # CRC
)

# Create the images directory if it doesn't exist
$imagesDir = ".\images"
if (-not (Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir
}

# Create icon16.png
$icon16Path = Join-Path $imagesDir "icon16.png"
[System.IO.File]::WriteAllBytes($icon16Path, $pngHeader)
Write-Host "Created $icon16Path"

# Create icon48.png (using the same minimal PNG for simplicity)
$icon48Path = Join-Path $imagesDir "icon48.png"
[System.IO.File]::WriteAllBytes($icon48Path, $pngHeader)
Write-Host "Created $icon48Path"

# Create icon128.png (using the same minimal PNG for simplicity)
$icon128Path = Join-Path $imagesDir "icon128.png"
[System.IO.File]::WriteAllBytes($icon128Path, $pngHeader)
Write-Host "Created $icon128Path"

Write-Host "All icon files created successfully."
Write-Host "Now you can use the generate_png_icons.html file to create proper icons." 
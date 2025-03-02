# Text Highlighter Stats

A simple Chrome extension that shows word and character counts for highlighted text on any webpage.

## Features

- Displays a small, semi-transparent box in the corner of the screen
- Shows word count and character count of highlighted text
- Works on any webpage
- Non-intrusive design that doesn't interfere with browsing
- Customizable appearance and behavior through settings

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top-right corner
4. Click "Load unpacked" and select the directory containing this extension
5. The extension should now be installed and active

## Usage

1. Simply highlight any text on a webpage
2. A small box will appear in the top-right corner showing the word and character count
3. The box disappears when you click elsewhere or clear your selection

## Customization

You can customize the extension by right-clicking on the extension icon and selecting "Options" or by going to the Extensions page and clicking "Details" for this extension, then "Extension options".

Available settings include:

- **Appearance**
  - Background color and opacity
  - Text color and opacity
  - Text size
- **Display Options**
  - Show/hide word count
  - Show/hide character count
  - Include/exclude spaces in character count

## Files

- `manifest.json`: Extension configuration
- `content.js`: Main script that detects selections and displays stats
- `styles.css`: Styling for the stats box
- `options.html` & `options.js`: Settings page for customization
- `images/`: Directory containing icon files

## Creating Icons

Before using this extension, you'll need to create icon files in the following sizes:

- 16x16 pixels
- 48x48 pixels
- 128x128 pixels

Save these icons in an `images` directory with the filenames `icon16.png`, `icon48.png`, and `icon128.png` respectively.

## License

MIT

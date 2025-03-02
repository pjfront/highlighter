// Default settings
const defaultSettings = {
  backgroundColor: '#000000',
  textColor: '#FFFFFF',
  backgroundOpacity: 0.7,
  textOpacity: 1.0,
  fontSize: 14,
  showWordCount: true,
  showCharCount: true,
  countSpaces: true
};

// Current settings
let settings = {...defaultSettings};

// Create the stats box element
const statsBox = document.createElement('div');
statsBox.id = 'highlighter-stats-box';
statsBox.style.display = 'none';
document.body.appendChild(statsBox);

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(defaultSettings, (loadedSettings) => {
    settings = loadedSettings;
    applySettings();
  });
}

// Apply settings to the stats box
function applySettings() {
  statsBox.style.fontSize = `${settings.fontSize}px`;
  // Other styles are applied via CSS variables in updateStatsBox
}

// Function to count words in a string
function countWords(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Helper function to convert hex color to rgba
function hexToRgba(hex, opacity) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Function to update the stats box
function updateStatsBox(selection) {
  const text = selection.toString();
  
  if (!text) {
    statsBox.style.display = 'none';
    return;
  }
  
  // Apply dynamic styles based on settings
  statsBox.style.backgroundColor = hexToRgba(settings.backgroundColor, settings.backgroundOpacity);
  statsBox.style.color = hexToRgba(settings.textColor, settings.textOpacity);
  
  // Clear previous content
  statsBox.innerHTML = '';
  
  // Calculate stats
  const wordCount = countWords(text);
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;
  
  // Add word count if enabled
  if (settings.showWordCount) {
    const wordDiv = document.createElement('div');
    wordDiv.textContent = `Words: ${wordCount}`;
    statsBox.appendChild(wordDiv);
  }
  
  // Add character count if enabled
  if (settings.showCharCount) {
    const charDiv = document.createElement('div');
    if (settings.countSpaces) {
      charDiv.textContent = `Characters: ${charCount}`;
    } else {
      charDiv.textContent = `Characters (no spaces): ${charCountNoSpaces}`;
    }
    statsBox.appendChild(charDiv);
  }
  
  // Only show the box if at least one stat is enabled
  if (settings.showWordCount || settings.showCharCount) {
    statsBox.style.display = 'block';
  } else {
    statsBox.style.display = 'none';
  }
}

// Function to position the stats box
function positionStatsBox(event) {
  const selection = window.getSelection();
  
  if (selection.toString()) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Position in the top-right corner of the viewport
    statsBox.style.top = '20px';
    statsBox.style.right = '20px';
  }
}

// Listen for text selection
document.addEventListener('mouseup', function(event) {
  const selection = window.getSelection();
  updateStatsBox(selection);
  positionStatsBox(event);
});

// Listen for keyup events to catch keyboard selections
document.addEventListener('keyup', function(event) {
  // Only process if it's a key that might affect selection
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Shift'].includes(event.key)) {
    const selection = window.getSelection();
    updateStatsBox(selection);
    positionStatsBox(event);
  }
});

// Hide the stats box when clicking elsewhere with no selection
document.addEventListener('click', function(event) {
  const selection = window.getSelection();
  if (!selection.toString()) {
    statsBox.style.display = 'none';
  }
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    // Update our settings object with any changed values
    for (const [key, { newValue }] of Object.entries(changes)) {
      settings[key] = newValue;
    }
    
    // Re-apply settings
    applySettings();
    
    // Update the display if there's a current selection
    const selection = window.getSelection();
    if (selection.toString()) {
      updateStatsBox(selection);
    }
  }
});

// Initialize
loadSettings(); 
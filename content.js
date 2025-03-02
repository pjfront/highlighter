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

// Function to update the stats box with text
function updateStatsBoxWithText(text) {
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

// Function to update the stats box
function updateStatsBox(selection) {
  const text = selection.toString();
  updateStatsBoxWithText(text);
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

// Check if we're on Google Docs
function isGoogleDocs() {
  return window.location.hostname === 'docs.google.com';
}

// Function to handle Google Docs selection
function handleGoogleDocsSelection() {
  // Get the editor iframe
  const editorIframe = document.querySelector('.docs-texteventtarget-iframe');
  if (!editorIframe) return;
  
  try {
    // Access the iframe content
    const iframeDocument = editorIframe.contentDocument || editorIframe.contentWindow.document;
    
    // Get selection from the iframe
    const iframeSelection = iframeDocument.getSelection();
    if (iframeSelection && iframeSelection.toString()) {
      updateStatsBox(iframeSelection);
    }
  } catch (e) {
    console.error('Error accessing Google Docs iframe:', e);
  }
  
  // Also check the main document selection as a fallback
  const mainSelection = window.getSelection();
  if (mainSelection && mainSelection.toString()) {
    updateStatsBox(mainSelection);
  }
}

// Function to observe DOM changes in Google Docs
function observeGoogleDocs() {
  // Create a MutationObserver to watch for changes in the Google Docs editor
  const observer = new MutationObserver((mutations) => {
    // Check if there's a selection when DOM changes
    handleGoogleDocsSelection();
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    characterData: true
  });
  
  // Also add event listeners specific to Google Docs
  document.addEventListener('keyup', handleGoogleDocsSelection);
  document.addEventListener('mouseup', handleGoogleDocsSelection);
  document.addEventListener('selectionchange', handleGoogleDocsSelection);
}

// Listen for text selection
document.addEventListener('mouseup', function(event) {
  if (isGoogleDocs()) return; // Skip for Google Docs, handled separately
  
  const selection = window.getSelection();
  updateStatsBox(selection);
  positionStatsBox(event);
});

// Listen for keyup events to catch keyboard selections
document.addEventListener('keyup', function(event) {
  if (isGoogleDocs()) return; // Skip for Google Docs, handled separately
  
  // Only process if it's a key that might affect selection
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Shift'].includes(event.key)) {
    const selection = window.getSelection();
    updateStatsBox(selection);
    positionStatsBox(event);
  }
});

// Listen for selection changes
document.addEventListener('selectionchange', function(event) {
  if (isGoogleDocs()) return; // Skip for Google Docs, handled separately
  
  const selection = window.getSelection();
  updateStatsBox(selection);
  positionStatsBox(event);
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

// Listen for the custom event from the Google Docs script
document.addEventListener('googleDocsTextSelected', function(event) {
  if (event.detail && event.detail.text) {
    updateStatsBoxWithText(event.detail.text);
  }
});

// Initialize
loadSettings();

// Set up Google Docs support if we're on Google Docs
if (isGoogleDocs()) {
  // Wait for the Google Docs interface to fully load
  window.addEventListener('load', () => {
    setTimeout(observeGoogleDocs, 2000); // Give Google Docs some time to initialize
  });
} 
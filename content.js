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

// Debug mode
const DEBUG = true;

function debugLog(...args) {
  if (DEBUG) {
    console.log('[Text Highlighter Stats]', ...args);
  }
}

// Current settings
let settings = {...defaultSettings};

// Create the stats box element
const statsBox = document.createElement('div');
statsBox.id = 'highlighter-stats-box';
statsBox.style.display = 'none';
document.body.appendChild(statsBox);
debugLog('Main stats box created');

// Load settings from storage
function loadSettings() {
  debugLog('Loading settings from storage');
  chrome.storage.sync.get(defaultSettings, (loadedSettings) => {
    settings = loadedSettings;
    applySettings();
    debugLog('Settings loaded:', settings);
  });
}

// Apply settings to the stats box
function applySettings() {
  statsBox.style.fontSize = `${settings.fontSize}px`;
  // Other styles are applied via CSS variables in updateStatsBox
  debugLog('Settings applied to stats box');
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
  debugLog('Updating stats box with text:', text ? text.substring(0, 20) + '...' : 'none');
  
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
    debugLog('Stats box is now visible');
  } else {
    statsBox.style.display = 'none';
    debugLog('Stats box is hidden (no stats enabled)');
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
    debugLog('Stats box positioned');
  }
}

// Check if we're on Google Docs
function isGoogleDocs() {
  const isGDocs = window.location.hostname === 'docs.google.com';
  debugLog('Is Google Docs?', isGDocs);
  return isGDocs;
}

// Function to handle Google Docs selection
function handleGoogleDocsSelection() {
  debugLog('Handling Google Docs selection');
  
  // Get the editor iframe
  const editorIframe = document.querySelector('.docs-texteventtarget-iframe');
  if (!editorIframe) {
    debugLog('No editor iframe found');
    return;
  }
  
  try {
    // Access the iframe content
    const iframeDocument = editorIframe.contentDocument || editorIframe.contentWindow.document;
    
    // Get selection from the iframe
    const iframeSelection = iframeDocument.getSelection();
    if (iframeSelection && iframeSelection.toString()) {
      debugLog('Found selection in iframe:', iframeSelection.toString().substring(0, 20) + '...');
      updateStatsBox(iframeSelection);
    }
  } catch (e) {
    debugLog('Error accessing Google Docs iframe:', e);
  }
  
  // Also check the main document selection as a fallback
  const mainSelection = window.getSelection();
  if (mainSelection && mainSelection.toString()) {
    debugLog('Found selection in main document:', mainSelection.toString().substring(0, 20) + '...');
    updateStatsBox(mainSelection);
  }
}

// Function to observe DOM changes in Google Docs
function observeGoogleDocs() {
  debugLog('Setting up Google Docs observer');
  
  // Create a MutationObserver to watch for changes in the Google Docs editor
  const observer = new MutationObserver((mutations) => {
    // Check if there's a selection when DOM changes
    debugLog('DOM mutation detected in Google Docs');
    handleGoogleDocsSelection();
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    characterData: true
  });
  
  // Also add event listeners specific to Google Docs
  document.addEventListener('keyup', function(e) {
    debugLog('Google Docs keyup event:', e.key);
    handleGoogleDocsSelection();
  });
  
  document.addEventListener('mouseup', function(e) {
    debugLog('Google Docs mouseup event');
    handleGoogleDocsSelection();
  });
  
  document.addEventListener('selectionchange', function(e) {
    debugLog('Google Docs selectionchange event');
    handleGoogleDocsSelection();
  });
  
  debugLog('Google Docs observer setup complete');
}

// Listen for text selection
document.addEventListener('mouseup', function(event) {
  if (isGoogleDocs()) {
    debugLog('Mouseup in Google Docs - skipping main handler');
    return; // Skip for Google Docs, handled separately
  }
  
  debugLog('Mouseup event detected');
  const selection = window.getSelection();
  updateStatsBox(selection);
  positionStatsBox(event);
});

// Listen for keyup events to catch keyboard selections
document.addEventListener('keyup', function(event) {
  if (isGoogleDocs()) {
    debugLog('Keyup in Google Docs - skipping main handler');
    return; // Skip for Google Docs, handled separately
  }
  
  // Only process if it's a key that might affect selection
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Shift'].includes(event.key)) {
    debugLog('Selection-related keyup detected:', event.key);
    const selection = window.getSelection();
    updateStatsBox(selection);
    positionStatsBox(event);
  }
});

// Listen for selection changes
document.addEventListener('selectionchange', function(event) {
  if (isGoogleDocs()) {
    debugLog('Selection change in Google Docs - skipping main handler');
    return; // Skip for Google Docs, handled separately
  }
  
  debugLog('Selection change event detected');
  const selection = window.getSelection();
  updateStatsBox(selection);
  positionStatsBox(event);
});

// Hide the stats box when clicking elsewhere with no selection
document.addEventListener('click', function(event) {
  debugLog('Click event detected');
  const selection = window.getSelection();
  if (!selection.toString()) {
    debugLog('No selection after click, hiding stats box');
    statsBox.style.display = 'none';
  }
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    debugLog('Settings changed in storage');
    // Update our settings object with any changed values
    for (const [key, { newValue }] of Object.entries(changes)) {
      settings[key] = newValue;
    }
    
    // Re-apply settings
    applySettings();
    
    // Update the display if there's a current selection
    const selection = window.getSelection();
    if (selection.toString()) {
      debugLog('Updating stats box after settings change');
      updateStatsBox(selection);
    }
  }
});

// Listen for the custom event from the Google Docs script
document.addEventListener('googleDocsTextSelected', function(event) {
  debugLog('Received googleDocsTextSelected event');
  if (event.detail && event.detail.text) {
    debugLog('Text from Google Docs:', event.detail.text.substring(0, 20) + '...');
    updateStatsBoxWithText(event.detail.text);
  }
});

// Initialize
debugLog('Initializing content script');
loadSettings();

// Set up Google Docs support if we're on Google Docs
if (isGoogleDocs()) {
  debugLog('Google Docs detected, setting up special handling');
  // Wait for the Google Docs interface to fully load
  window.addEventListener('load', () => {
    debugLog('Window loaded in Google Docs');
    setTimeout(() => {
      debugLog('Starting Google Docs observer');
      observeGoogleDocs();
    }, 2000); // Give Google Docs some time to initialize
  });
  
  // Also try to initialize immediately
  setTimeout(() => {
    debugLog('Immediate Google Docs initialization');
    observeGoogleDocs();
  }, 1000);
} 
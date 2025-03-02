// This script is specifically for handling Google Docs text selection

// Debug mode - set to true to see console logs
const DEBUG = true;

function debugLog(...args) {
  if (DEBUG) {
    console.log('[Text Highlighter Stats - GDocs]', ...args);
  }
}

// Log that the script has loaded
debugLog('Google Docs content script loaded');

// Create the stats box immediately
let statsBox = null;

// Function to create the stats box
function createStatsBox() {
  debugLog('Creating stats box in Google Docs');
  
  // Check if the box already exists
  if (statsBox) {
    return statsBox;
  }
  
  // Create the box
  statsBox = document.createElement('div');
  statsBox.id = 'gdocs-highlighter-stats-box';
  statsBox.style.position = 'fixed';
  statsBox.style.top = '60px'; // Below the Google Docs toolbar
  statsBox.style.right = '20px';
  statsBox.style.padding = '10px';
  statsBox.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  statsBox.style.color = 'white';
  statsBox.style.borderRadius = '5px';
  statsBox.style.fontFamily = 'Arial, sans-serif';
  statsBox.style.fontSize = '14px';
  statsBox.style.zIndex = '9999999';
  statsBox.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  statsBox.style.transition = 'all 0.3s ease';
  statsBox.style.pointerEvents = 'none';
  statsBox.style.userSelect = 'none';
  statsBox.style.minWidth = '120px';
  statsBox.style.textAlign = 'left';
  statsBox.style.display = 'none';
  
  // Add to the document
  document.body.appendChild(statsBox);
  debugLog('Stats box created and added to document');
  
  return statsBox;
}

// Create the stats box immediately
createStatsBox();

// Function to count words in a string
function countWords(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Function to update the stats box with text
function updateStatsBoxWithText(text) {
  if (!statsBox) {
    statsBox = createStatsBox();
  }
  
  if (!text) {
    statsBox.style.display = 'none';
    return;
  }
  
  // Clear previous content
  statsBox.innerHTML = '';
  
  // Calculate stats
  const wordCount = countWords(text);
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;
  
  // Add word count
  const wordDiv = document.createElement('div');
  wordDiv.textContent = `Words: ${wordCount}`;
  wordDiv.style.margin = '2px 0';
  wordDiv.style.whiteSpace = 'nowrap';
  statsBox.appendChild(wordDiv);
  
  // Add character count
  const charDiv = document.createElement('div');
  charDiv.textContent = `Characters: ${charCount}`;
  charDiv.style.margin = '2px 0';
  charDiv.style.whiteSpace = 'nowrap';
  statsBox.appendChild(charDiv);
  
  // Show the box
  statsBox.style.display = 'block';
  
  debugLog('Updated stats box with text:', text.substring(0, 20) + (text.length > 20 ? '...' : ''));
}

// Function to extract text from Google Docs selection
function getGoogleDocsSelectedText() {
  debugLog('Attempting to get Google Docs selected text');
  
  // Try to get the selection from the main document first
  let selection = window.getSelection();
  let text = selection ? selection.toString() : '';
  
  if (text) {
    debugLog('Found text in main window selection:', text);
    return text;
  }
  
  // If no text is selected in the main document, try to find it in the editor iframe
  try {
    // Find the editor iframe
    const editorIframes = document.querySelectorAll('iframe.docs-texteventtarget-iframe');
    debugLog('Found', editorIframes.length, 'editor iframes');
    
    for (const iframe of editorIframes) {
      try {
        if (!iframe.contentDocument && !iframe.contentWindow) {
          debugLog('No contentDocument or contentWindow in iframe');
          continue;
        }
        
        // Get selection from the iframe
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        const iframeSelection = iframeDocument.getSelection();
        if (iframeSelection && iframeSelection.toString()) {
          const iframeText = iframeSelection.toString();
          debugLog('Found text in iframe selection:', iframeText);
          return iframeText;
        }
      } catch (iframeError) {
        debugLog('Error accessing specific iframe:', iframeError);
      }
    }
  } catch (e) {
    debugLog('Error accessing Google Docs iframes:', e);
  }
  
  // Try another approach - look for the selected text in the DOM
  try {
    // Look for selected text in the editor content
    const selectedElements = document.querySelectorAll('.kix-selection-overlay');
    debugLog('Found', selectedElements.length, 'selection overlay elements');
    
    if (selectedElements.length > 0) {
      // Try to get text from the cursor location
      const cursorElements = document.querySelectorAll('.kix-cursor');
      if (cursorElements.length > 0) {
        debugLog('Found cursor elements, trying to extract nearby text');
        
        // Find the corresponding text elements
        const textElements = document.querySelectorAll('.kix-lineview-text-block');
        debugLog('Found', textElements.length, 'text block elements');
        
        let selectedText = '';
        
        // This is a simplified approach - Google Docs' actual selection is more complex
        for (const textElement of textElements) {
          if (textElement.textContent) {
            selectedText += textElement.textContent + ' ';
          }
        }
        
        if (selectedText.trim()) {
          debugLog('Extracted text from DOM:', selectedText.trim());
          return selectedText.trim();
        }
      }
    }
  } catch (e) {
    debugLog('Error extracting Google Docs selection from DOM:', e);
  }
  
  // Try one more approach - use the clipboard API if available
  try {
    // Check if we can access the clipboard
    if (navigator.clipboard && navigator.clipboard.readText) {
      debugLog('Attempting to read from clipboard');
      
      // Note: This is async and won't work directly in this function
      // We'll handle this separately with a clipboard button
    }
  } catch (e) {
    debugLog('Error accessing clipboard:', e);
  }
  
  debugLog('No selected text found in Google Docs');
  return '';
}

// Function to check for selection and update the stats box
function checkForSelection() {
  const selectedText = getGoogleDocsSelectedText();
  
  if (selectedText) {
    debugLog('Found selected text, updating stats box');
    updateStatsBoxWithText(selectedText);
  } else {
    // If no text is selected, hide the stats box
    if (statsBox) {
      statsBox.style.display = 'none';
    }
  }
}

// Add a manual trigger button for testing
function addDebugButton() {
  const button = document.createElement('button');
  button.textContent = 'Check Selection';
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = '20px';
  button.style.zIndex = '9999999';
  button.style.padding = '5px 10px';
  button.style.backgroundColor = '#4285F4';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  
  button.addEventListener('click', function() {
    debugLog('Debug button clicked');
    checkForSelection();
  });
  
  document.body.appendChild(button);
  debugLog('Debug button added');
}

// Set up event listeners for Google Docs
function setupGoogleDocsListeners() {
  debugLog('Setting up Google Docs listeners');
  
  // Add debug button
  addDebugButton();
  
  // Listen for mouseup events
  document.addEventListener('mouseup', function(e) {
    debugLog('mouseup event detected');
    setTimeout(checkForSelection, 100); // Small delay to ensure selection is complete
  });
  
  // Listen for keyup events that might change selection
  document.addEventListener('keyup', function(e) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Shift'].includes(e.key)) {
      debugLog('keyup event detected:', e.key);
      setTimeout(checkForSelection, 100);
    }
  });
  
  // Use MutationObserver to detect changes in the document
  const observer = new MutationObserver(function(mutations) {
    // Check if any of the mutations might indicate a selection change
    for (const mutation of mutations) {
      if (mutation.type === 'childList' || 
          (mutation.type === 'attributes' && mutation.target.classList && 
           mutation.target.classList.contains('kix-selection-overlay'))) {
        debugLog('Mutation detected that might indicate selection change');
        setTimeout(checkForSelection, 100);
        break;
      }
    }
  });
  
  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });
  
  // Also check periodically for selections
  setInterval(checkForSelection, 1000);
  
  debugLog('All Google Docs listeners set up');
}

// Initialize immediately
debugLog('Starting immediate initialization');
setupGoogleDocsListeners();

// Also initialize when the page is fully loaded
window.addEventListener('load', function() {
  debugLog('Window load event fired');
  // Give Google Docs some time to initialize
  setTimeout(function() {
    debugLog('Starting Google Docs integration after window load');
    setupGoogleDocsListeners();
  }, 2000);
}); 
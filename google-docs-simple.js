// Google Docs script for Text Highlighter Stats extension

console.log('[Text Highlighter Stats] Google Docs Script Injected');

// Wait for the document to be fully loaded
function initializeScript() {
  console.log('[Text Highlighter Stats - Google Docs] Initializing script');
  
  // Create the stats box
  const statsBox = document.createElement('div');
  statsBox.id = 'gdocs-highlighter-stats-box';
  statsBox.style.position = 'fixed';
  statsBox.style.top = '60px';
  statsBox.style.right = '20px';
  statsBox.style.padding = '10px';
  statsBox.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  statsBox.style.color = 'white';
  statsBox.style.borderRadius = '5px';
  statsBox.style.fontFamily = 'Arial, sans-serif';
  statsBox.style.fontSize = '14px';
  statsBox.style.zIndex = '9999999';
  statsBox.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  statsBox.style.pointerEvents = 'none';
  statsBox.style.userSelect = 'none';
  statsBox.style.minWidth = '120px';
  statsBox.style.display = 'none';
  document.body.appendChild(statsBox);
  
  console.log('[Text Highlighter Stats - Google Docs] Stats box created and added to document');
  
  // Add a manual copy button
  const copyButton = document.createElement('button');
  copyButton.id = 'gdocs-highlighter-copy-button';
  copyButton.textContent = 'Copy & Count';
  copyButton.style.position = 'fixed';
  copyButton.style.bottom = '60px';
  copyButton.style.right = '20px';
  copyButton.style.zIndex = '9999999';
  copyButton.style.padding = '5px 10px';
  copyButton.style.backgroundColor = '#4285F4';
  copyButton.style.color = 'white';
  copyButton.style.border = 'none';
  copyButton.style.borderRadius = '4px';
  copyButton.style.cursor = 'pointer';
  document.body.appendChild(copyButton);
  
  console.log('[Text Highlighter Stats - Google Docs] Copy button created and added to document');
  
  // Add a debug button
  const button = document.createElement('button');
  button.id = 'gdocs-highlighter-debug-button';
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
  document.body.appendChild(button);
  
  console.log('[Text Highlighter Stats - Google Docs] Debug button created and added to document');
  
  // Function to count words
  function countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
  
  // Function to get Google Docs selection using a safer approach
  function getGoogleDocsSelection() {
    console.log('[Text Highlighter Stats - Google Docs] Attempting to get Google Docs selection');
    
    // Method 1: Direct window selection (works in some cases)
    let selection = window.getSelection();
    let text = selection ? selection.toString() : '';
    
    if (text) {
      console.log('[Text Highlighter Stats - Google Docs] Found selection in main window:', 
        text.substring(0, 20) + (text.length > 20 ? '...' : ''));
      return text;
    }
    
    // Method 2: Look for selection-related elements in the DOM
    console.log('[Text Highlighter Stats - Google Docs] Looking for selection elements in DOM');
    
    // Look for the Google Docs selection overlay elements
    const selectionElements = document.querySelectorAll('.kix-selection-overlay');
    if (selectionElements.length > 0) {
      console.log('[Text Highlighter Stats - Google Docs] Found selection overlay elements:', selectionElements.length);
    }
    
    // Method 3: Check if there's a visible cursor, which might indicate selection
    const cursorElements = document.querySelectorAll('.kix-cursor');
    if (cursorElements.length > 0) {
      console.log('[Text Highlighter Stats - Google Docs] Found cursor elements:', cursorElements.length);
    }
    
    return text; // Return whatever we found (might be empty)
  }
  
  // Function to manually trigger copy and then read from clipboard
  function manualCopyAndCount() {
    console.log('[Text Highlighter Stats] Manual copy triggered');
    
    // Simulate Ctrl+C keyboard shortcut
    const keyboardEvent = new KeyboardEvent('keydown', {
      key: 'c',
      code: 'KeyC',
      ctrlKey: true,
      bubbles: true,
      cancelable: true
    });
    
    document.dispatchEvent(keyboardEvent);
    
    // Wait a moment for the copy to complete
    setTimeout(() => {
      // Try to read from clipboard
      navigator.clipboard.readText()
        .then(text => {
          console.log('[Text Highlighter Stats] Got text from clipboard:', 
            text ? text.substring(0, 20) + (text.length > 20 ? '...' : '') : 'none');
          updateStatsWithText(text);
        })
        .catch(err => {
          console.log('[Text Highlighter Stats] Error reading clipboard:', err);
          alert('Please manually copy (Ctrl+C) and then click the button again.');
        });
    }, 100);
  }
  
  // Function to update stats with specific text
  function updateStatsWithText(text) {
    if (!text) {
      statsBox.style.display = 'none';
      return;
    }
    
    // Clear previous content
    statsBox.innerHTML = '';
    
    // Calculate stats
    const wordCount = countWords(text);
    const charCount = text.length;
    
    // Add word count
    const wordDiv = document.createElement('div');
    wordDiv.textContent = `Words: ${wordCount}`;
    wordDiv.style.margin = '2px 0';
    statsBox.appendChild(wordDiv);
    
    // Add character count
    const charDiv = document.createElement('div');
    charDiv.textContent = `Characters: ${charCount}`;
    charDiv.style.margin = '2px 0';
    statsBox.appendChild(charDiv);
    
    // Show the box
    statsBox.style.display = 'block';
    console.log('[Text Highlighter Stats - Google Docs] Stats box updated and displayed');
  }
  
  // Function to update stats
  function updateStats() {
    console.log('[Text Highlighter Stats - Google Docs] Checking for selection');
    
    // Get text from Google Docs
    const text = getGoogleDocsSelection();
    updateStatsWithText(text);
  }
  
  // Function to check if elements exist
  function checkElements() {
    const boxExists = document.getElementById('gdocs-highlighter-stats-box');
    const buttonExists = document.getElementById('gdocs-highlighter-debug-button');
    const copyButtonExists = document.getElementById('gdocs-highlighter-copy-button');
    
    console.log('[Text Highlighter Stats - Google Docs] Elements check:', 
      boxExists ? 'Stats box exists' : 'Stats box MISSING',
      buttonExists ? 'Debug button exists' : 'Debug button MISSING',
      copyButtonExists ? 'Copy button exists' : 'Copy button MISSING');
    
    if (!boxExists || !buttonExists || !copyButtonExists) {
      console.log('[Text Highlighter Stats - Google Docs] Recreating missing elements');
      
      // Recreate stats box if missing
      if (!boxExists) {
        const newStatsBox = document.createElement('div');
        newStatsBox.id = 'gdocs-highlighter-stats-box';
        newStatsBox.style.position = 'fixed';
        newStatsBox.style.top = '60px';
        newStatsBox.style.right = '20px';
        newStatsBox.style.padding = '10px';
        newStatsBox.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        newStatsBox.style.color = 'white';
        newStatsBox.style.borderRadius = '5px';
        newStatsBox.style.fontFamily = 'Arial, sans-serif';
        newStatsBox.style.fontSize = '14px';
        newStatsBox.style.zIndex = '9999999';
        newStatsBox.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        newStatsBox.style.pointerEvents = 'none';
        newStatsBox.style.userSelect = 'none';
        newStatsBox.style.minWidth = '120px';
        newStatsBox.style.display = 'none';
        document.body.appendChild(newStatsBox);
        console.log('[Text Highlighter Stats - Google Docs] Stats box recreated');
      }
      
      // Recreate copy button if missing
      if (!copyButtonExists) {
        const newCopyButton = document.createElement('button');
        newCopyButton.id = 'gdocs-highlighter-copy-button';
        newCopyButton.textContent = 'Copy & Count';
        newCopyButton.style.position = 'fixed';
        newCopyButton.style.bottom = '60px';
        newCopyButton.style.right = '20px';
        newCopyButton.style.zIndex = '9999999';
        newCopyButton.style.padding = '5px 10px';
        newCopyButton.style.backgroundColor = '#4285F4';
        newCopyButton.style.color = 'white';
        newCopyButton.style.border = 'none';
        newCopyButton.style.borderRadius = '4px';
        newCopyButton.style.cursor = 'pointer';
        document.body.appendChild(newCopyButton);
        console.log('[Text Highlighter Stats - Google Docs] Copy button recreated');
        
        // Add event listener to the new button
        newCopyButton.addEventListener('click', manualCopyAndCount);
      }
      
      // Recreate debug button if missing
      if (!buttonExists) {
        const newButton = document.createElement('button');
        newButton.id = 'gdocs-highlighter-debug-button';
        newButton.textContent = 'Check Selection';
        newButton.style.position = 'fixed';
        newButton.style.bottom = '20px';
        newButton.style.right = '20px';
        newButton.style.zIndex = '9999999';
        newButton.style.padding = '5px 10px';
        newButton.style.backgroundColor = '#4285F4';
        newButton.style.color = 'white';
        newButton.style.border = 'none';
        newButton.style.borderRadius = '4px';
        newButton.style.cursor = 'pointer';
        document.body.appendChild(newButton);
        console.log('[Text Highlighter Stats - Google Docs] Debug button recreated');
        
        // Add event listener to the new button
        newButton.addEventListener('click', updateStats);
      }
    }
  }
  
  // Set up a MutationObserver to watch for changes in the Google Docs editor
  function setupMutationObserver() {
    console.log('[Text Highlighter Stats - Google Docs] Setting up MutationObserver');
    
    // Create a MutationObserver to watch for changes in the Google Docs editor
    const observer = new MutationObserver((mutations) => {
      // Check if there's a selection when DOM changes
      updateStats();
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      characterData: true
    });
    
    console.log('[Text Highlighter Stats - Google Docs] MutationObserver set up');
  }
  
  // Set up keyboard shortcut listener for Ctrl+C
  function setupKeyboardShortcuts() {
    console.log('[Text Highlighter Stats - Google Docs] Setting up keyboard shortcuts');
    
    document.addEventListener('keydown', (e) => {
      // Check for Ctrl+C (copy)
      if (e.ctrlKey && e.key === 'c') {
        console.log('[Text Highlighter Stats - Google Docs] Detected Ctrl+C');
        
        // Wait a moment for the copy to complete
        setTimeout(() => {
          // Try to read from clipboard
          navigator.clipboard.readText()
            .then(text => {
              console.log('[Text Highlighter Stats - Google Docs] Got text from clipboard after Ctrl+C:', 
                text ? text.substring(0, 20) + (text.length > 20 ? '...' : '') : 'none');
              updateStatsWithText(text);
            })
            .catch(err => {
              console.log('[Text Highlighter Stats - Google Docs] Error reading clipboard after Ctrl+C:', err);
            });
        }, 100);
      }
    });
    
    console.log('[Text Highlighter Stats - Google Docs] Keyboard shortcuts set up');
  }
  
  // Set up event listeners
  button.addEventListener('click', updateStats);
  copyButton.addEventListener('click', manualCopyAndCount);
  document.addEventListener('mouseup', updateStats);
  document.addEventListener('keyup', function(e) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Shift'].includes(e.key)) {
      updateStats();
    }
  });
  
  // Set up the MutationObserver
  setupMutationObserver();
  
  // Set up keyboard shortcuts
  setupKeyboardShortcuts();
  
  // Check periodically for selection and elements
  setInterval(() => {
    updateStats();
    checkElements();
  }, 1000);
  
  console.log('[Text Highlighter Stats - Google Docs] Script is running');
}

// Wait for the document to be ready
if (document.readyState === 'complete') {
  initializeScript();
} else {
  window.addEventListener('load', initializeScript);
}

console.log('[Text Highlighter Stats - Google Docs] Script initialization set up'); 
// Google Docs script for Text Highlighter Stats extension

console.log('[Text Highlighter Stats - Google Docs] Script loaded');

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
  
  // Function to get text from Google Docs
  function getGoogleDocsSelection() {
    console.log('[Text Highlighter Stats - Google Docs] Attempting to get Google Docs selection');
    
    // Try multiple methods to get the selection
    
    // Method 1: Direct window selection
    let selection = window.getSelection();
    let text = selection ? selection.toString() : '';
    
    if (text) {
      console.log('[Text Highlighter Stats - Google Docs] Found selection in main window:', 
        text.substring(0, 20) + (text.length > 20 ? '...' : ''));
      return text;
    }
    
    // Method 2: Try to find the editor iframe
    console.log('[Text Highlighter Stats - Google Docs] Looking for editor iframe');
    
    // Look for the editor iframe (there are several possible selectors)
    const editorIframes = [
      document.querySelector('.docs-texteventtarget-iframe'),
      document.querySelector('.kix-appview-editor iframe'),
      ...Array.from(document.querySelectorAll('iframe')).filter(iframe => 
        iframe.id.includes('editor') || 
        (iframe.className && iframe.className.includes('editor'))
      )
    ].filter(Boolean); // Remove null/undefined values
    
    console.log('[Text Highlighter Stats - Google Docs] Found', editorIframes.length, 'potential editor iframes');
    
    // Try each iframe
    for (const iframe of editorIframes) {
      try {
        console.log('[Text Highlighter Stats - Google Docs] Trying iframe:', iframe.id || 'unnamed iframe');
        
        // Try to access the iframe's document
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        const iframeSelection = iframeDocument.getSelection();
        const iframeText = iframeSelection ? iframeSelection.toString() : '';
        
        if (iframeText) {
          console.log('[Text Highlighter Stats - Google Docs] Found selection in iframe:', 
            iframeText.substring(0, 20) + (iframeText.length > 20 ? '...' : ''));
          return iframeText;
        }
      } catch (error) {
        console.log('[Text Highlighter Stats - Google Docs] Error accessing iframe:', error.message);
      }
    }
    
    // Method 3: Look for text in the DOM that might be selected
    console.log('[Text Highlighter Stats - Google Docs] Looking for selected text in DOM');
    
    // Look for elements that might contain selected text
    const selectedElements = document.querySelectorAll('.kix-selection-overlay, .kix-cursor');
    
    if (selectedElements.length > 0) {
      console.log('[Text Highlighter Stats - Google Docs] Found', selectedElements.length, 'selection elements');
      
      // Try to get text from nearby elements
      for (const element of selectedElements) {
        const parentElement = element.parentElement;
        if (parentElement) {
          const nearbyText = parentElement.textContent;
          if (nearbyText && nearbyText.trim()) {
            console.log('[Text Highlighter Stats - Google Docs] Found nearby text:', 
              nearbyText.substring(0, 20) + (nearbyText.length > 20 ? '...' : ''));
            return nearbyText;
          }
        }
      }
    }
    
    // No selection found
    console.log('[Text Highlighter Stats - Google Docs] No selection found');
    return '';
  }
  
  // Function to update stats
  function updateStats() {
    console.log('[Text Highlighter Stats - Google Docs] Checking for selection');
    
    // Get text from Google Docs
    const text = getGoogleDocsSelection();
    
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
  
  // Function to check if elements exist
  function checkElements() {
    const boxExists = document.getElementById('gdocs-highlighter-stats-box');
    const buttonExists = document.getElementById('gdocs-highlighter-debug-button');
    
    console.log('[Text Highlighter Stats - Google Docs] Elements check:', 
      boxExists ? 'Stats box exists' : 'Stats box MISSING',
      buttonExists ? 'Debug button exists' : 'Debug button MISSING');
    
    if (!boxExists || !buttonExists) {
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
  
  // Set up event listeners
  button.addEventListener('click', updateStats);
  document.addEventListener('mouseup', updateStats);
  document.addEventListener('keyup', function(e) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Shift'].includes(e.key)) {
      updateStats();
    }
  });
  
  // Try to add listeners to the editor iframe
  function setupIframeListeners() {
    const editorIframes = [
      document.querySelector('.docs-texteventtarget-iframe'),
      document.querySelector('.kix-appview-editor iframe'),
      ...Array.from(document.querySelectorAll('iframe')).filter(iframe => 
        iframe.id.includes('editor') || 
        (iframe.className && iframe.className.includes('editor'))
      )
    ].filter(Boolean);
    
    for (const iframe of editorIframes) {
      try {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        
        iframeDocument.addEventListener('mouseup', updateStats);
        iframeDocument.addEventListener('keyup', function(e) {
          if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Shift'].includes(e.key)) {
            updateStats();
          }
        });
        
        console.log('[Text Highlighter Stats - Google Docs] Added listeners to iframe:', iframe.id || 'unnamed iframe');
      } catch (error) {
        console.log('[Text Highlighter Stats - Google Docs] Error adding listeners to iframe:', error.message);
      }
    }
  }
  
  // Set up iframe listeners
  setupIframeListeners();
  
  // Check periodically for selection, elements, and new iframes
  setInterval(() => {
    updateStats();
    checkElements();
    setupIframeListeners(); // Periodically try to set up iframe listeners in case new iframes are added
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
// This script is specifically for handling Google Docs text selection

// Function to extract text from Google Docs selection
function getGoogleDocsSelectedText() {
  // Try to get the selection from the main document first
  let selection = window.getSelection();
  let text = selection ? selection.toString() : '';
  
  if (text) return text;
  
  // If no text is selected in the main document, try to find it in the editor iframe
  try {
    // Find the editor iframe
    const editorIframes = document.querySelectorAll('iframe.docs-texteventtarget-iframe');
    
    for (const iframe of editorIframes) {
      if (!iframe.contentDocument) continue;
      
      // Get selection from the iframe
      const iframeSelection = iframe.contentDocument.getSelection();
      if (iframeSelection && iframeSelection.toString()) {
        return iframeSelection.toString();
      }
    }
  } catch (e) {
    console.error('Error accessing Google Docs iframe:', e);
  }
  
  // If we still don't have text, try to find it in the editor content
  try {
    // Look for selected text in the editor content
    const selectedElements = document.querySelectorAll('.kix-selection-overlay');
    if (selectedElements.length > 0) {
      // Find the corresponding text elements
      const textElements = document.querySelectorAll('.kix-lineview-text-block');
      let selectedText = '';
      
      // This is a simplified approach - Google Docs' actual selection is more complex
      for (const textElement of textElements) {
        if (textElement.textContent) {
          selectedText += textElement.textContent + ' ';
        }
      }
      
      if (selectedText.trim()) {
        return selectedText.trim();
      }
    }
  } catch (e) {
    console.error('Error extracting Google Docs selection:', e);
  }
  
  return '';
}

// Function to send the selected text to the main content script
function sendSelectedTextToContentScript() {
  const selectedText = getGoogleDocsSelectedText();
  
  if (selectedText) {
    // Create a custom event to communicate with the main content script
    const event = new CustomEvent('googleDocsTextSelected', {
      detail: { text: selectedText }
    });
    
    // Dispatch the event to the document
    document.dispatchEvent(event);
  }
}

// Set up event listeners for Google Docs
function setupGoogleDocsListeners() {
  // Listen for mouseup events
  document.addEventListener('mouseup', function(e) {
    setTimeout(sendSelectedTextToContentScript, 100); // Small delay to ensure selection is complete
  });
  
  // Listen for keyup events that might change selection
  document.addEventListener('keyup', function(e) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Shift'].includes(e.key)) {
      setTimeout(sendSelectedTextToContentScript, 100);
    }
  });
  
  // Use MutationObserver to detect changes in the document
  const observer = new MutationObserver(function(mutations) {
    // Check if any of the mutations might indicate a selection change
    for (const mutation of mutations) {
      if (mutation.type === 'childList' || 
          (mutation.type === 'attributes' && mutation.target.classList && 
           mutation.target.classList.contains('kix-selection-overlay'))) {
        setTimeout(sendSelectedTextToContentScript, 100);
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
  setInterval(sendSelectedTextToContentScript, 1000);
}

// Initialize when the page is fully loaded
window.addEventListener('load', function() {
  // Give Google Docs some time to initialize
  setTimeout(setupGoogleDocsListeners, 2000);
}); 
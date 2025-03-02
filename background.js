// Background script for Text Highlighter Stats extension

// Debug mode
const DEBUG = true;

function debugLog(...args) {
  if (DEBUG) {
    console.log('[Text Highlighter Stats - Background]', ...args);
  }
}

// Function to inject the Google Docs script directly
function injectGoogleDocsScript(tabId) {
  debugLog('Attempting to inject script into tab', tabId);
  
  // Return a Promise that resolves when the script is injected
  return new Promise((resolve, reject) => {
    // First, try to inject the script file
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['google-docs-simple.js']
    }).then(() => {
      debugLog('Successfully injected Google Docs script file');
      resolve(true);
    }).catch(err => {
      debugLog('Error injecting Google Docs script file:', err);
      
      // If file injection fails, try direct code injection
      debugLog('Attempting direct code injection...');
      
      // Define the script to inject
      const scriptToInject = `
        console.log('[Text Highlighter Stats] Google Docs Script Injected Directly');
        
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
        
        // Add a debug button
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
        document.body.appendChild(button);
        
        // Function to count words
        function countWords(text) {
          return text.trim().split(/\\s+/).filter(word => word.length > 0).length;
        }
        
        // Function to update stats
        function updateStats() {
          const selection = window.getSelection();
          const text = selection ? selection.toString() : '';
          
          console.log('[Text Highlighter Stats] Selection text:', text ? text.substring(0, 20) + '...' : 'none');
          
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
          wordDiv.textContent = \`Words: \${wordCount}\`;
          wordDiv.style.margin = '2px 0';
          statsBox.appendChild(wordDiv);
          
          // Add character count
          const charDiv = document.createElement('div');
          charDiv.textContent = \`Characters: \${charCount}\`;
          charDiv.style.margin = '2px 0';
          statsBox.appendChild(charDiv);
          
          // Show the box
          statsBox.style.display = 'block';
        }
        
        // Set up event listeners
        button.addEventListener('click', updateStats);
        document.addEventListener('mouseup', updateStats);
        document.addEventListener('keyup', function(e) {
          if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Shift'].includes(e.key)) {
            updateStats();
          }
        });
        
        // Check periodically
        setInterval(updateStats, 1000);
        
        // Log that the script is running
        console.log('[Text Highlighter Stats] Google Docs script is running');
      `;
      
      // Inject the script directly
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        world: "MAIN",
        func: function(scriptCode) {
          // Create a script element
          const scriptElement = document.createElement('script');
          scriptElement.textContent = scriptCode;
          document.head.appendChild(scriptElement);
          console.log('[Text Highlighter Stats] Script element injected into page');
        },
        args: [scriptToInject]
      }).then(() => {
        debugLog('Successfully injected script element');
        resolve(true);
      }).catch(err => {
        debugLog('Error injecting script element:', err);
        reject(err);
      });
    });
  });
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab is a Google Docs document
  if (tab.url && tab.url.includes('docs.google.com/document')) {
    debugLog('Google Docs document detected:', tab.url);
    
    if (changeInfo.status === 'complete') {
      debugLog('Page load complete, injecting script');
      
      // Wait a moment for the page to fully initialize
      setTimeout(() => {
        injectGoogleDocsScript(tabId)
          .then(() => debugLog('Script injection after page load completed successfully'))
          .catch(err => debugLog('Script injection after page load failed:', err));
      }, 2000);
    }
  }
});

// Listen for browser action clicks
chrome.action.onClicked.addListener((tab) => {
  debugLog('Extension icon clicked on tab:', tab.id);
  
  // If it's a Google Docs document, inject the script
  if (tab.url && tab.url.includes('docs.google.com/document')) {
    debugLog('Google Docs document detected, injecting script');
    injectGoogleDocsScript(tab.id)
      .then(() => debugLog('Script injection after icon click completed successfully'))
      .catch(err => debugLog('Script injection after icon click failed:', err));
  }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  debugLog('Received message:', message);
  
  if (message.action === 'injectScript' && message.tabId) {
    debugLog('Received request to inject script into tab', message.tabId);
    
    // Check if the tab exists
    chrome.tabs.get(message.tabId, (tab) => {
      if (chrome.runtime.lastError) {
        debugLog('Error getting tab:', chrome.runtime.lastError);
        sendResponse({ 
          success: false, 
          error: 'Tab not found: ' + chrome.runtime.lastError.message 
        });
        return;
      }
      
      // Inject the script
      injectGoogleDocsScript(message.tabId)
        .then(() => {
          debugLog('Script injection from popup completed successfully');
          sendResponse({ success: true });
        })
        .catch(err => {
          debugLog('Script injection from popup failed:', err);
          sendResponse({ 
            success: false, 
            error: err.message || 'Unknown error during script injection' 
          });
        });
    });
    
    return true; // Indicates we'll send a response asynchronously
  }
  
  // If we don't handle the message, inform the sender
  sendResponse({ success: false, error: 'Unknown message action' });
  return true;
});

// Log that the background script has loaded
debugLog('Background script loaded'); 
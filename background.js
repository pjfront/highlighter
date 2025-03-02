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
    // First, try to inject the script file in MAIN world to access the page's window object
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['google-docs-simple.js'],
      world: "MAIN" // This is important for Google Docs
    }).then(() => {
      debugLog('Successfully injected Google Docs script file in MAIN world');
      resolve(true);
    }).catch(err => {
      debugLog('Error injecting Google Docs script file in MAIN world:', err);
      
      // Try again in ISOLATED world as a fallback
      debugLog('Trying to inject in ISOLATED world...');
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['google-docs-simple.js'],
        world: "ISOLATED"
      }).then(() => {
        debugLog('Successfully injected Google Docs script file in ISOLATED world');
        resolve(true);
      }).catch(err => {
        debugLog('Error injecting Google Docs script file in ISOLATED world:', err);
        
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
          
          // Function to count words
          function countWords(text) {
            return text.trim().split(/\\s+/).filter(word => word.length > 0).length;
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
          
          // Function to get selection
          function getSelection() {
            const selection = window.getSelection();
            return selection ? selection.toString() : '';
          }
          
          // Function to update stats
          function updateStats() {
            const text = getSelection();
            updateStatsWithText(text);
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
          
          // Set up keyboard shortcut listener for Ctrl+C
          document.addEventListener('keydown', (e) => {
            // Check for Ctrl+C (copy)
            if (e.ctrlKey && e.key === 'c') {
              console.log('[Text Highlighter Stats] Detected Ctrl+C');
              
              // Wait a moment for the copy to complete
              setTimeout(() => {
                // Try to read from clipboard
                navigator.clipboard.readText()
                  .then(text => {
                    console.log('[Text Highlighter Stats] Got text from clipboard after Ctrl+C:', 
                      text ? text.substring(0, 20) + (text.length > 20 ? '...' : '') : 'none');
                    updateStatsWithText(text);
                  })
                  .catch(err => {
                    console.log('[Text Highlighter Stats] Error reading clipboard after Ctrl+C:', err);
                  });
              }, 100);
            }
          });
          
          // Set up a MutationObserver to watch for changes
          const observer = new MutationObserver(updateStats);
          observer.observe(document.body, { 
            childList: true, 
            subtree: true,
            characterData: true
          });
          
          // Check periodically
          setInterval(() => {
            updateStats();
            
            // Check if elements exist and recreate if needed
            const boxExists = document.getElementById('gdocs-highlighter-stats-box');
            const buttonExists = document.getElementById('gdocs-highlighter-debug-button');
            const copyButtonExists = document.getElementById('gdocs-highlighter-copy-button');
            
            if (!boxExists || !buttonExists || !copyButtonExists) {
              console.log('[Text Highlighter Stats] Recreating missing elements');
              
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
                
                // Add event listener to the new button
                newButton.addEventListener('click', updateStats);
              }
            }
          }, 1000);
          
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
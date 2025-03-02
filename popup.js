// Popup script for Text Highlighter Stats extension

// Debug logs array
let debugLogs = [];

// Function to add a log entry
function addLogEntry(message) {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `${timestamp}: ${message}`;
  debugLogs.push(logEntry);
  
  // Update the log display
  updateLogDisplay();
  
  // Also log to console for debugging
  console.log(`[Text Highlighter Stats - Popup] ${message}`);
}

// Function to update the log display
function updateLogDisplay() {
  const logElement = document.getElementById('debugLog');
  if (!logElement) {
    console.error('Debug log element not found');
    return;
  }
  
  logElement.innerHTML = '';
  
  if (debugLogs.length === 0) {
    logElement.innerHTML = '<div class="log-entry">No logs yet...</div>';
    return;
  }
  
  // Display the most recent logs first (up to 50)
  const logsToShow = debugLogs.slice(-50).reverse();
  
  for (const log of logsToShow) {
    const logEntryElement = document.createElement('div');
    logEntryElement.className = 'log-entry';
    logEntryElement.textContent = log;
    logElement.appendChild(logEntryElement);
  }
}

// Function to check the current tab
async function checkCurrentTab() {
  try {
    addLogEntry('Checking current tab...');
    
    // Get the current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tabs || tabs.length === 0) {
      addLogEntry('No active tab found');
      
      const statusElement = document.getElementById('status');
      if (statusElement) {
        statusElement.textContent = 'No active tab found';
        statusElement.style.backgroundColor = '#f8d7da';
      }
      
      return null;
    }
    
    const currentTab = tabs[0];
    addLogEntry(`Current tab: ${currentTab.id} - ${currentTab.url}`);
    
    // Update status
    const statusElement = document.getElementById('status');
    if (!statusElement) {
      addLogEntry('Status element not found');
      return currentTab;
    }
    
    if (currentTab.url && currentTab.url.includes('docs.google.com/document')) {
      statusElement.textContent = 'Google Docs document detected!';
      statusElement.style.backgroundColor = '#e6f4ea';
      addLogEntry('Google Docs document detected: ' + currentTab.url);
    } else {
      statusElement.textContent = 'Not a Google Docs document.';
      statusElement.style.backgroundColor = '#f5f5f5';
      addLogEntry('Not a Google Docs document: ' + currentTab.url);
    }
    
    return currentTab;
  } catch (error) {
    addLogEntry('Error checking current tab: ' + error.message);
    console.error('Error checking current tab:', error);
    return null;
  }
}

// Function to inject the script into the current tab
async function injectScript() {
  try {
    addLogEntry('Starting script injection process...');
    
    const currentTab = await checkCurrentTab();
    
    if (!currentTab) {
      addLogEntry('No current tab found, cannot inject script');
      return;
    }
    
    if (!currentTab.url || !currentTab.url.includes('docs.google.com/document')) {
      addLogEntry('Not a Google Docs document, skipping injection');
      return;
    }
    
    addLogEntry(`Requesting script injection for tab ${currentTab.id}...`);
    
    // Send a message to the background script
    chrome.runtime.sendMessage(
      { 
        action: 'injectScript', 
        tabId: currentTab.id 
      }, 
      (response) => {
        if (chrome.runtime.lastError) {
          addLogEntry('Error sending message: ' + chrome.runtime.lastError.message);
          return;
        }
        
        if (response && response.success) {
          addLogEntry('Script injection requested successfully');
        } else {
          addLogEntry('Script injection request failed: ' + (response ? response.error : 'Unknown error'));
        }
      }
    );
  } catch (error) {
    addLogEntry('Error injecting script: ' + error.message);
    console.error('Error injecting script:', error);
  }
}

// Function to check the current selection
async function checkSelection() {
  try {
    addLogEntry('Starting selection check process...');
    
    const currentTab = await checkCurrentTab();
    
    if (!currentTab) {
      addLogEntry('No current tab found, cannot check selection');
      return;
    }
    
    addLogEntry(`Requesting selection check for tab ${currentTab.id}...`);
    
    // Execute a script to check the selection
    chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: () => {
        const selection = window.getSelection();
        const text = selection ? selection.toString() : '';
        
        // Log to the page console
        console.log('[Text Highlighter Stats - Selection Check]', 
          text ? `Selection found: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" (${text.length} chars)` : 'No selection found');
        
        return { 
          hasSelection: !!text, 
          text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
          length: text.length
        };
      }
    }).then((results) => {
      if (results && results[0] && results[0].result) {
        const result = results[0].result;
        if (result.hasSelection) {
          addLogEntry(`Selection found: "${result.text}" (${result.length} chars)`);
        } else {
          addLogEntry('No text currently selected');
        }
      } else {
        addLogEntry('Failed to check selection: No results returned');
      }
    }).catch((error) => {
      addLogEntry('Error executing selection check: ' + error.message);
      console.error('Error executing selection check:', error);
    });
  } catch (error) {
    addLogEntry('Error checking selection: ' + error.message);
    console.error('Error checking selection:', error);
  }
}

// Function to clear logs
function clearLogs() {
  debugLogs = [];
  updateLogDisplay();
  addLogEntry('Logs cleared');
}

// Set up event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  addLogEntry('Popup DOM loaded');
  
  // Check the current tab when the popup opens
  checkCurrentTab().then(() => {
    addLogEntry('Initial tab check completed');
  }).catch(error => {
    addLogEntry('Error during initial tab check: ' + error.message);
  });
  
  // Set up button event listeners
  const injectButton = document.getElementById('injectScript');
  if (injectButton) {
    injectButton.addEventListener('click', injectScript);
    addLogEntry('Inject script button listener added');
  } else {
    addLogEntry('WARNING: Inject script button not found');
  }
  
  const checkButton = document.getElementById('checkSelection');
  if (checkButton) {
    checkButton.addEventListener('click', checkSelection);
    addLogEntry('Check selection button listener added');
  } else {
    addLogEntry('WARNING: Check selection button not found');
  }
  
  const clearButton = document.getElementById('clearLogs');
  if (clearButton) {
    clearButton.addEventListener('click', clearLogs);
    addLogEntry('Clear logs button listener added');
  } else {
    addLogEntry('WARNING: Clear logs button not found');
  }
}); 
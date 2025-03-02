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
}

// Function to update the log display
function updateLogDisplay() {
  const logElement = document.getElementById('debugLog');
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
    // Get the current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    // Update status
    const statusElement = document.getElementById('status');
    
    if (currentTab.url.includes('docs.google.com/document')) {
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
    return null;
  }
}

// Function to inject the script into the current tab
async function injectScript() {
  try {
    const currentTab = await checkCurrentTab();
    
    if (!currentTab) {
      addLogEntry('No current tab found');
      return;
    }
    
    if (!currentTab.url.includes('docs.google.com/document')) {
      addLogEntry('Not a Google Docs document, skipping injection');
      return;
    }
    
    addLogEntry('Requesting script injection...');
    
    // Send a message to the background script
    chrome.runtime.sendMessage({ action: 'injectScript', tabId: currentTab.id }, (response) => {
      if (response && response.success) {
        addLogEntry('Script injection requested successfully');
      } else {
        addLogEntry('Script injection request failed: ' + (response ? response.error : 'Unknown error'));
      }
    });
  } catch (error) {
    addLogEntry('Error injecting script: ' + error.message);
  }
}

// Function to check the current selection
async function checkSelection() {
  try {
    const currentTab = await checkCurrentTab();
    
    if (!currentTab) {
      addLogEntry('No current tab found');
      return;
    }
    
    addLogEntry('Requesting selection check...');
    
    // Execute a script to check the selection
    chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: () => {
        const selection = window.getSelection();
        const text = selection ? selection.toString() : '';
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
        addLogEntry('Failed to check selection');
      }
    }).catch((error) => {
      addLogEntry('Error executing selection check: ' + error.message);
    });
  } catch (error) {
    addLogEntry('Error checking selection: ' + error.message);
  }
}

// Function to clear logs
function clearLogs() {
  debugLogs = [];
  updateLogDisplay();
  addLogEntry('Logs cleared');
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Check the current tab when the popup opens
  checkCurrentTab();
  
  // Set up button event listeners
  document.getElementById('injectScript').addEventListener('click', injectScript);
  document.getElementById('checkSelection').addEventListener('click', checkSelection);
  document.getElementById('clearLogs').addEventListener('click', clearLogs);
  
  // Add initial log entry
  addLogEntry('Popup opened');
}); 
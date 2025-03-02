// Popup script for Text Highlighter Stats extension

// Array to store debug logs
const debugLogs = [];

// Function to add a log entry
function addLogEntry(message) {
  const timestamp = new Date().toLocaleTimeString();
  debugLogs.unshift({ timestamp, message }); // Add to the beginning
  
  // Keep only the most recent 50 logs
  if (debugLogs.length > 50) {
    debugLogs.pop();
  }
  
  updateLogDisplay();
}

// Function to update the log display
function updateLogDisplay() {
  const logContainer = document.getElementById('debug-logs');
  logContainer.innerHTML = '';
  
  debugLogs.forEach(log => {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = `${log.timestamp}: ${log.message}`;
    logContainer.appendChild(logEntry);
  });
}

// Function to check if the current tab is a Google Docs document
async function checkCurrentTab() {
  const statusElement = document.getElementById('status');
  
  try {
    // Get the active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    // Check if it's a Google Docs document
    const isGoogleDocs = currentTab.url.includes('docs.google.com/document');
    
    // Update the status
    if (isGoogleDocs) {
      statusElement.textContent = 'Google Docs document detected';
      statusElement.className = 'status-ok';
    } else {
      statusElement.textContent = 'Not a Google Docs document';
      statusElement.className = 'status-error';
    }
    
    // Log the result
    addLogEntry(`Current tab is ${isGoogleDocs ? '' : 'not '}a Google Docs document`);
    
    return { isGoogleDocs, tabId: currentTab.id };
  } catch (error) {
    statusElement.textContent = 'Error checking tab';
    statusElement.className = 'status-error';
    addLogEntry(`Error checking tab: ${error.message}`);
    return { isGoogleDocs: false, tabId: null };
  }
}

// Function to inject the script into the current tab
async function injectScript() {
  const { isGoogleDocs, tabId } = await checkCurrentTab();
  
  if (!isGoogleDocs || !tabId) {
    addLogEntry('Cannot inject script: Not a Google Docs document');
    return;
  }
  
  addLogEntry('Requesting script injection...');
  
  try {
    // Send a message to the background script to inject the script
    const response = await chrome.runtime.sendMessage({ 
      action: 'injectScript', 
      tabId 
    });
    
    if (response.success) {
      addLogEntry('Script injection successful');
    } else {
      addLogEntry(`Script injection failed: ${response.error || 'Unknown error'}`);
    }
  } catch (error) {
    addLogEntry(`Error sending injection request: ${error.message}`);
  }
}

// Function to check for selection in the current tab
async function checkSelection() {
  const { tabId } = await checkCurrentTab();
  
  if (!tabId) {
    addLogEntry('Cannot check selection: Invalid tab');
    return;
  }
  
  addLogEntry('Checking for text selection...');
  
  try {
    // Execute a script to check for selection
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const selection = window.getSelection();
        const text = selection ? selection.toString() : '';
        return {
          hasSelection: text.length > 0,
          text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
          length: text.length
        };
      }
    });
    
    const result = results[0].result;
    
    if (result.hasSelection) {
      addLogEntry(`Selection found: "${result.text}" (${result.length} chars)`);
    } else {
      addLogEntry('No text selection found');
    }
  } catch (error) {
    addLogEntry(`Error checking selection: ${error.message}`);
  }
}

// Function to clear logs
function clearLogs() {
  debugLogs.length = 0;
  updateLogDisplay();
  addLogEntry('Logs cleared');
}

// Set up event listeners when the popup is loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Check the current tab
  await checkCurrentTab();
  
  // Set up button event listeners
  document.getElementById('inject-button').addEventListener('click', injectScript);
  document.getElementById('check-selection-button').addEventListener('click', checkSelection);
  document.getElementById('clear-logs-button').addEventListener('click', clearLogs);
  
  // Add initial log
  addLogEntry('Popup opened');
}); 
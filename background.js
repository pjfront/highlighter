// Background script for Text Highlighter Stats extension

// Debug mode
const DEBUG = true;

function debugLog(...args) {
  if (DEBUG) {
    console.log('[Text Highlighter Stats - Background]', ...args);
  }
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab is a Google Docs document
  if (tab.url && tab.url.includes('docs.google.com/document') && changeInfo.status === 'complete') {
    debugLog('Google Docs document detected:', tab.url);
    
    // Inject the content script
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['google-docs-simple.js']
    }).then(() => {
      debugLog('Successfully injected Google Docs simple script');
    }).catch(err => {
      debugLog('Error injecting Google Docs script:', err);
    });
  }
});

// Log that the background script has loaded
debugLog('Background script loaded'); 
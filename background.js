// Listen for extension icon clicks
chrome.action.onClicked.addListener(async (tab) => {
  // Inject the content script into the current tab
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
  
  // Inject the CSS into the current tab
  await chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ['styles.css']
  });
}); 
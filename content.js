// Content script for Text Highlighter Counter extension

// Debug mode
const DEBUG = true;

function debugLog(...args) {
  if (DEBUG) {
    console.log('[Text Highlighter Counter - Content]', ...args);
  }
}

debugLog('Content script starting');

// Create the stats box
const statsBox = document.createElement('div');
statsBox.id = 'highlighter-stats-box';
statsBox.style.position = 'fixed';
statsBox.style.top = '20px';
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

debugLog('Stats box created and added to document');

// Function to count words
function countWords(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Function to update stats
function updateStats() {
  debugLog('Checking for selection');
  
  const selection = window.getSelection();
  const text = selection ? selection.toString() : '';
  
  debugLog('Selection text:', text ? text.substring(0, 20) + '...' : 'none');
  
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
  
  // Add a small Ko-fi link
  const supportDiv = document.createElement('div');
  supportDiv.style.marginTop = '8px';
  supportDiv.style.fontSize = '10px';
  supportDiv.style.textAlign = 'right';
  supportDiv.style.opacity = '0.7';
  supportDiv.style.pointerEvents = 'auto';
  supportDiv.style.cursor = 'pointer';
  supportDiv.textContent = '☕ Support';
  supportDiv.title = 'Support this extension on Ko-fi';
  supportDiv.onclick = function(e) {
    e.stopPropagation();
    window.open('https://ko-fi.com/appvibin', '_blank');
  };
  statsBox.appendChild(supportDiv);
  
  // Show the box
  statsBox.style.display = 'block';
  debugLog('Stats box updated and displayed');
}

// Function to check if the stats box exists
function checkStatsBox() {
  const boxExists = document.getElementById('highlighter-stats-box');
  
  debugLog('Stats box check:', boxExists ? 'exists' : 'MISSING');
  
  if (!boxExists) {
    debugLog('Recreating stats box');
    
    // Recreate stats box
    const newStatsBox = document.createElement('div');
    newStatsBox.id = 'highlighter-stats-box';
    newStatsBox.style.position = 'fixed';
    newStatsBox.style.top = '20px';
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
    
    // We need to update stats to recreate the content
    updateStats();
    
    debugLog('Stats box recreated');
  }
}

// Set up event listeners
document.addEventListener('mouseup', updateStats);
document.addEventListener('keyup', function(e) {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Shift'].includes(e.key)) {
    updateStats();
  }
});

// Check periodically for selection and stats box
setInterval(() => {
  updateStats();
  checkStatsBox();
}, 1000);

// Log that the script is running
debugLog('Content script loaded and running'); 
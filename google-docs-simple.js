// Google Docs script for Text Highlighter Stats extension

console.log('[Text Highlighter Stats - Google Docs] Script loaded');

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
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Function to update stats
function updateStats() {
  console.log('[Text Highlighter Stats - Google Docs] Checking for selection');
  
  // Try to get selection from the main window
  const selection = window.getSelection();
  const text = selection ? selection.toString() : '';
  
  console.log('[Text Highlighter Stats - Google Docs] Selection text:', text ? text.substring(0, 20) + '...' : 'none');
  
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

console.log('[Text Highlighter Stats - Google Docs] Script is running'); 
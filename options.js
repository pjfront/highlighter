// Default settings
const defaultSettings = {
  backgroundColor: '#000000',
  textColor: '#FFFFFF',
  backgroundOpacity: 0.7,
  textOpacity: 1.0,
  fontSize: 14,
  showWordCount: true,
  showCharCount: true,
  countSpaces: true
};

// DOM elements
const backgroundColorEl = document.getElementById('backgroundColor');
const textColorEl = document.getElementById('textColor');
const backgroundOpacityEl = document.getElementById('backgroundOpacity');
const backgroundOpacityValueEl = document.getElementById('backgroundOpacityValue');
const textOpacityEl = document.getElementById('textOpacity');
const textOpacityValueEl = document.getElementById('textOpacityValue');
const fontSizeEl = document.getElementById('fontSize');
const showWordCountEl = document.getElementById('showWordCount');
const showCharCountEl = document.getElementById('showCharCount');
const countSpacesEl = document.getElementById('countSpaces');
const previewEl = document.getElementById('preview');
const saveButton = document.getElementById('save');
const statusEl = document.getElementById('status');

// Load saved settings or use defaults
function loadSettings() {
  chrome.storage.sync.get(defaultSettings, (settings) => {
    // Apply loaded settings to form elements
    backgroundColorEl.value = settings.backgroundColor;
    textColorEl.value = settings.textColor;
    backgroundOpacityEl.value = settings.backgroundOpacity;
    backgroundOpacityValueEl.textContent = settings.backgroundOpacity;
    textOpacityEl.value = settings.textOpacity;
    textOpacityValueEl.textContent = settings.textOpacity;
    fontSizeEl.value = settings.fontSize;
    showWordCountEl.checked = settings.showWordCount;
    showCharCountEl.checked = settings.showCharCount;
    countSpacesEl.checked = settings.countSpaces;
    
    // Update preview
    updatePreview();
  });
}

// Save settings
function saveSettings() {
  const settings = {
    backgroundColor: backgroundColorEl.value,
    textColor: textColorEl.value,
    backgroundOpacity: parseFloat(backgroundOpacityEl.value),
    textOpacity: parseFloat(textOpacityEl.value),
    fontSize: parseInt(fontSizeEl.value),
    showWordCount: showWordCountEl.checked,
    showCharCount: showCharCountEl.checked,
    countSpaces: countSpacesEl.checked
  };
  
  chrome.storage.sync.set(settings, () => {
    // Show success message
    statusEl.textContent = 'Options saved!';
    statusEl.className = 'status success';
    statusEl.style.display = 'block';
    
    // Hide message after 2 seconds
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 2000);
  });
}

// Update preview based on current form values
function updatePreview() {
  // Update preview appearance
  const bgColor = backgroundColorEl.value;
  const textColor = textColorEl.value;
  const bgOpacity = backgroundOpacityEl.value;
  const textOpacity = textOpacityEl.value;
  const fontSize = fontSizeEl.value;
  
  previewEl.style.backgroundColor = hexToRgba(bgColor, bgOpacity);
  previewEl.style.color = hexToRgba(textColor, textOpacity);
  previewEl.style.fontSize = `${fontSize}px`;
  
  // Update preview content
  previewEl.innerHTML = '';
  
  if (showWordCountEl.checked) {
    const wordDiv = document.createElement('div');
    wordDiv.textContent = 'Words: 42';
    previewEl.appendChild(wordDiv);
  }
  
  if (showCharCountEl.checked) {
    const charDiv = document.createElement('div');
    charDiv.textContent = countSpacesEl.checked ? 
      'Characters: 256' : 
      'Characters (no spaces): 215';
    previewEl.appendChild(charDiv);
  }
  
  // If nothing is shown, display a message
  if (!showWordCountEl.checked && !showCharCountEl.checked) {
    const msgDiv = document.createElement('div');
    msgDiv.textContent = 'No stats selected to display';
    previewEl.appendChild(msgDiv);
  }
}

// Helper function to convert hex color to rgba
function hexToRgba(hex, opacity) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Event listeners
backgroundColorEl.addEventListener('input', updatePreview);
textColorEl.addEventListener('input', updatePreview);

backgroundOpacityEl.addEventListener('input', () => {
  backgroundOpacityValueEl.textContent = backgroundOpacityEl.value;
  updatePreview();
});

textOpacityEl.addEventListener('input', () => {
  textOpacityValueEl.textContent = textOpacityEl.value;
  updatePreview();
});

fontSizeEl.addEventListener('input', updatePreview);
showWordCountEl.addEventListener('change', updatePreview);
showCharCountEl.addEventListener('change', updatePreview);
countSpacesEl.addEventListener('change', updatePreview);

saveButton.addEventListener('click', saveSettings);

// Initialize
document.addEventListener('DOMContentLoaded', loadSettings); 
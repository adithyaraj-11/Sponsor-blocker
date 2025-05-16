document.addEventListener('DOMContentLoaded', () => {
  const toggleSponsored = document.getElementById('toggleSponsored');
  const toggleHighlight = document.getElementById('toggleHighlight');


  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const isFlipkart = tab?.url?.includes('flipkart.com');

    if (!isFlipkart) {
      toggleSponsored.disabled = true;
      toggleHighlight.disabled = true;
      return;
    }

    // Load saved toggle states
    chrome.storage.sync.get(['hideSponsored', 'highlightSponsored'], (result) => {
      const hide = !!result.hideSponsored;
      const highlight = !!result.highlightSponsored;

      toggleSponsored.checked = hide;
      toggleHighlight.checked = highlight;

      // Only enable highlight if hide is off
      toggleHighlight.disabled = hide;
    });

    toggleSponsored.addEventListener('change', () => {
      const hide = toggleSponsored.checked;
      chrome.storage.sync.set({ hideSponsored: hide });

      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'toggleSponsored',
        hide
      });

      // If hiding is ON, disable highlight
      toggleHighlight.disabled = hide;

      if (hide) {
        // Automatically turn off highlight when hide is ON
        toggleHighlight.checked = false;
        chrome.storage.sync.set({ highlightSponsored: false });
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleHighlight',
          highlight: false
        });
      }
    });

    toggleHighlight.addEventListener('change', () => {
      const highlight = toggleHighlight.checked;
      chrome.storage.sync.set({ highlightSponsored: highlight });
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'toggleHighlight',
        highlight
      });
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const toggleSponsored = document.getElementById('toggleSponsored');
  const toggleHighlight = document.getElementById('toggleHighlight');
  const pageInfo = document.getElementById('pageInfo');

  // Get current tab URL to detect page
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) return;

    const url = tab.url || '';
    let pageName = 'Unknown';

    const isFlipkart = url.includes('flipkart.');
    const isAmazon = url.includes('amazon.');

    if (isFlipkart) pageName = 'Flipkart';
    else if (isAmazon) pageName = 'Amazon';

    pageInfo.textContent = `Page: ${pageName}`;

    // Enable toggles only if on Flipkart or Amazon, else disable them
    if (!isFlipkart && !isAmazon) {
      toggleSponsored.disabled = true;
      toggleHighlight.disabled = true;
    } else {
      toggleSponsored.disabled = false;
      toggleHighlight.disabled = false;

      // Load saved states from storage and set toggle states
      chrome.storage.sync.get(['hideSponsored', 'highlightSponsored'], (result) => {
        toggleSponsored.checked = !!result.hideSponsored;
        toggleHighlight.checked = !!result.highlightSponsored;
      });
    }
  });

  toggleSponsored.addEventListener('change', () => {
    if (toggleSponsored.disabled) return;  // Just in case

    const hide = toggleSponsored.checked;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'toggleSponsored', hide },
        () => {
          chrome.storage.sync.set({ hideSponsored: hide });
        }
      );
    });
  });

  toggleHighlight.addEventListener('change', () => {
    if (toggleHighlight.disabled) return;  // Just in case

    const highlight = toggleHighlight.checked;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'toggleHighlight', highlight },
        () => {
          chrome.storage.sync.set({ highlightSponsored: highlight });
        }
      );
    });
  });
});

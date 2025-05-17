document.addEventListener('DOMContentLoaded', () => {
  const toggleSponsored = document.getElementById('toggleSponsored');
  const toggleHighlight = document.getElementById('toggleHighlight');
  const highlightColorInput = document.getElementById('highlightColor');
  const pageInfo = document.getElementById('pageInfo');

  let currentSite = null; // 'flipkart' or 'amazon'

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) return;

    const url = tab.url || '';

    if (url.includes('flipkart.')) currentSite = 'flipkart';
    else if (url.includes('amazon.')) currentSite = 'amazon';

    pageInfo.textContent = `Page: ${currentSite ? currentSite.charAt(0).toUpperCase() + currentSite.slice(1) : 'Unknown'}`;

    if (!currentSite) {
      toggleSponsored.disabled = true;
      toggleHighlight.disabled = true;
      highlightColorInput.disabled = true;
      return;
    }

    toggleSponsored.disabled = false;
    toggleHighlight.disabled = false;
    highlightColorInput.disabled = false;

    // Load stored config specific to site
    chrome.storage.sync.get([
      `${currentSite}_hideSponsored`,
      `${currentSite}_highlightSponsored`,
      `${currentSite}_highlightColor`
    ], (result) => {
      toggleSponsored.checked = !!result[`${currentSite}_hideSponsored`];
      toggleHighlight.checked = !!result[`${currentSite}_highlightSponsored`];
      highlightColorInput.value = result[`${currentSite}_highlightColor`] || '#ffff00';
    });
  });

  toggleSponsored.addEventListener('change', () => {
    if (toggleSponsored.disabled) return;
    const hide = toggleSponsored.checked;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;

      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'toggleSponsored', hide },
        () => {
          if (!currentSite) return;
          const key = `${currentSite}_hideSponsored`;
          chrome.storage.sync.set({ [key]: hide });
        }
      );
    });
  });

  toggleHighlight.addEventListener('change', () => {
    if (toggleHighlight.disabled) return;
    const highlight = toggleHighlight.checked;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;

      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'toggleHighlight', highlight },
        () => {
          if (!currentSite) return;
          const key = `${currentSite}_highlightSponsored`;
          chrome.storage.sync.set({ [key]: highlight });
        }
      );
    });
  });

  highlightColorInput.addEventListener('input', () => {
    if (highlightColorInput.disabled) return;
    const color = highlightColorInput.value;

    if (!currentSite) return;
    const key = `${currentSite}_highlightColor`;
    chrome.storage.sync.set({ [key]: color });

    // Send updated color to content script only if highlight is enabled for this site
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;

      chrome.storage.sync.get([`${currentSite}_highlightSponsored`], (result) => {
        if (result[`${currentSite}_highlightSponsored`]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'updateHighlightColor', color });
        }
      });
    });
  });
});

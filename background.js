chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = new URL(tab.url);
    const isFlipkart = url.hostname.includes('flipkart.com');

    chrome.action.setIcon({
      tabId: tabId,
      path: isFlipkart
        ? {
            "16": "icons/icon16.png",
            "48": "icons/icon48.png",
            "128": "icons/icon128.png"
          }
        : {
            "16": "icons/icon16_inactive.png",
            "48": "icons/icon48_inactive.png",
            "128": "icons/icon128_inactive.png"
          }
    });
  }
});

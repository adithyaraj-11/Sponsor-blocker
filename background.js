chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = new URL(tab.url);
    const hostname = url.hostname;

    const isFlipkart = hostname.includes('flipkart.com');
    const isAmazon = hostname.includes('amazon.');

    const isSupportedSite = isFlipkart || isAmazon;

    chrome.action.setIcon({
      tabId: tabId,
      path: isSupportedSite
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

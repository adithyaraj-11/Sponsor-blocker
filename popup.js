document.addEventListener('DOMContentLoaded', () => {
  const toggleSponsored = document.getElementById('toggleSponsored');
  const toggleHighlight = document.getElementById('toggleHighlight');
  const highlightColorInput = document.getElementById('highlightColor');
  const pageInfo = document.getElementById('pageInfo');

  let currentSite = null;

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
          chrome.storage.sync.set({ [`${currentSite}_hideSponsored`]: hide });
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
          chrome.storage.sync.set({ [`${currentSite}_highlightSponsored`]: highlight });
        }
      );
    });
  });

  highlightColorInput.addEventListener('input', () => {
    if (highlightColorInput.disabled) return;
    const color = highlightColorInput.value;

    if (!currentSite) return;
    chrome.storage.sync.set({ [`${currentSite}_highlightColor`]: color });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;

      chrome.storage.sync.get([`${currentSite}_highlightSponsored`], (result) => {
        if (result[`${currentSite}_highlightSponsored`]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'updateHighlightColor', color });
        }
      });
    });
  });

  // Support Me Button Logic
  const supportBtn = document.getElementById('supportBtn');
  const optionsMenu = document.getElementById('optionsMenu');
  const kofiBtn = document.getElementById('kofiBtn');
  const upiBtn = document.getElementById('upiBtn');
  const qrCodeContainer = document.getElementById('qrCodeContainer');

  if (supportBtn && optionsMenu && kofiBtn && upiBtn && qrCodeContainer) {
    supportBtn.addEventListener('click', () => {
      if (optionsMenu.style.display === 'none' || optionsMenu.style.display === '') {
        optionsMenu.style.display = 'block';
      } else {
        optionsMenu.style.display = 'none';
        qrCodeContainer.style.display = 'none';
      }
    });

    kofiBtn.addEventListener('click', () => {
      window.open('https://ko-fi.com/adithya11', '_blank', 'noopener');
    });

    upiBtn.addEventListener('click', () => {
      if (qrCodeContainer.style.display === 'none' || qrCodeContainer.style.display === '') {
        qrCodeContainer.style.display = 'block';
      } else {
        qrCodeContainer.style.display = 'none';
      }
    });
  }

  // Modal Image Viewer Logic
  const qrCodeImage = document.querySelector('#qrCodeContainer img');
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('fullImage');
  const closeBtn = document.querySelector('.close');

  if (qrCodeImage && modal && modalImg && closeBtn) {
    qrCodeImage.addEventListener('click', () => {
      modal.style.display = 'block';
      modalImg.src = qrCodeImage.src;
    });

    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
});

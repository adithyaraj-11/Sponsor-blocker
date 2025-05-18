document.addEventListener('DOMContentLoaded', () => {
  const toggleSponsored = document.getElementById('toggleSponsored');
  const toggleHighlight = document.getElementById('toggleHighlight');
  const pageInfo = document.getElementById('pageInfo');
  const colorBoxes = document.querySelectorAll('.color-box');

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
      colorBoxes.forEach(box => box.classList.add('disabled'));
      return;
    }

    toggleSponsored.disabled = false;
    toggleHighlight.disabled = false;

    chrome.storage.local.get([
      `${currentSite}_hideSponsored`,
      `${currentSite}_highlightSponsored`,
      `${currentSite}_highlightColor`
    ], (result) => {
      toggleSponsored.checked = !!result[`${currentSite}_hideSponsored`];
      toggleHighlight.checked = !!result[`${currentSite}_highlightSponsored`];

      const storedColor = result[`${currentSite}_highlightColor`] || '#ffff00';
      colorBoxes.forEach(box => {
        if (box.dataset.color.toLowerCase() === storedColor.toLowerCase()) {
          box.classList.add('selected');
        } else {
          box.classList.remove('selected');
        }
      });
    });
  });

  toggleSponsored.addEventListener('change', () => {
    if (toggleSponsored.disabled) return;
    const hide = toggleSponsored.checked;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;

      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleSponsored', hide }, () => {
        if (!currentSite) return;
        chrome.storage.local.set({ [`${currentSite}_hideSponsored`]: hide });
      });
    });
  });

  toggleHighlight.addEventListener('change', () => {
    if (toggleHighlight.disabled) return;
    const highlight = toggleHighlight.checked;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;

      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleHighlight', highlight }, () => {
        if (!currentSite) return;
        chrome.storage.local.set({ [`${currentSite}_highlightSponsored`]: highlight });
      });
    });
  });

  // Color box click handling
  colorBoxes.forEach(box => {
    box.addEventListener('click', () => {
      if (!currentSite) return;

      const selectedColor = box.dataset.color;

      // Update UI
      colorBoxes.forEach(b => b.classList.remove('selected'));
      box.classList.add('selected');

      // Save selected color
      chrome.storage.local.set({ [`${currentSite}_highlightColor`]: selectedColor });

      // Update highlight color if active
      chrome.storage.local.get([`${currentSite}_highlightSponsored`], (result) => {
        if (result[`${currentSite}_highlightSponsored`]) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]) return;
            chrome.tabs.sendMessage(tabs[0].id, { action: 'updateHighlightColor', color: selectedColor });
          });
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
      qrCodeContainer.style.display = qrCodeContainer.style.display === 'block' ? 'none' : 'block';
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

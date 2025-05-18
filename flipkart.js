export function initFlipkart(siteKey = 'flipkart') {
  const PRODUCT_CONTAINER_SELECTOR = '[data-id]';
  const ROW_CONTAINER_SELECTOR = '._75nlfW';

  function isSponsored(product) {
    return product.querySelector('rect');
  }

  function fadeOut(product) {
    product.classList.add('grayscale-fade-out');
    product.addEventListener('animationend', function handler() {
      product.style.display = 'none';
      product.setAttribute('data-sponsored-hidden', 'true');
      product.classList.remove('grayscale-fade-out');
      product.removeEventListener('animationend', handler);
    }, { once: true });
  }

  function fadeIn(product) {
    product.style.display = '';
    product.classList.add('grayscale-fade-in');
    product.addEventListener('animationend', function handler() {
      product.removeAttribute('data-sponsored-hidden');
      product.classList.remove('grayscale-fade-in');
      product.removeEventListener('animationend', handler);
    }, { once: true });
  }

  function hideSponsored() {
    const rows = document.querySelectorAll(ROW_CONTAINER_SELECTOR);
    rows.forEach(row => {
      row.querySelectorAll(PRODUCT_CONTAINER_SELECTOR).forEach(product => {
        if (isSponsored(product) && product.style.display !== 'none' && !product.hasAttribute('data-sponsored-hidden')) {
          fadeOut(product);
        }
      });
    });
  }

  function showSponsored() {
    document.querySelectorAll('[data-sponsored-hidden="true"]').forEach(product => {
      fadeIn(product);
    });
  }

  function highlightSponsored() {
    const rows = document.querySelectorAll(ROW_CONTAINER_SELECTOR);
    rows.forEach(row => {
      row.querySelectorAll(PRODUCT_CONTAINER_SELECTOR).forEach(product => {
        if (isSponsored(product)) {
          product.classList.add('highlight-sponsored');
        }
      });
    });
  }

  function removeHighlight() {
    document.querySelectorAll('.highlight-sponsored').forEach(el => el.classList.remove('highlight-sponsored'));
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleSponsored') {
      request.hide ? hideSponsored() : showSponsored();
      sendResponse({ status: request.hide ? 'hidden' : 'shown' });
    } else if (request.action === 'toggleHighlight') {
      request.highlight ? highlightSponsored() : removeHighlight();
      sendResponse({ status: request.highlight ? 'highlighted' : 'unhighlighted' });
    } else if (request.action === 'updateHighlightColor' && request.color) {
      document.documentElement.style.setProperty('--highlight-color', request.color);
      sendResponse({ status: 'color-updated' });
    }
    return true;
  });

  // Watch for new content and apply per-site stored settings
  const observer = new MutationObserver(() => {
    chrome.storage.local.get([`${siteKey}_hideSponsored`, `${siteKey}_highlightSponsored`, `${siteKey}_highlightColor`], result => {
      if (result[`${siteKey}_hideSponsored`]) hideSponsored();
      else showSponsored();

      if (result[`${siteKey}_highlightSponsored`]) highlightSponsored();
      else removeHighlight();

      if (result[`${siteKey}_highlightColor`]) {
        document.documentElement.style.setProperty('--highlight-color', result[`${siteKey}_highlightColor`]);
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Initial run
  chrome.storage.local.get([`${siteKey}_hideSponsored`, `${siteKey}_highlightSponsored`, `${siteKey}_highlightColor`], result => {
    if (result[`${siteKey}_hideSponsored`]) hideSponsored();
    else showSponsored();

    if (result[`${siteKey}_highlightSponsored`]) highlightSponsored();
    else removeHighlight();

    if (result[`${siteKey}_highlightColor`]) {
      document.documentElement.style.setProperty('--highlight-color', result[`${siteKey}_highlightColor`]);
    }
  });
}

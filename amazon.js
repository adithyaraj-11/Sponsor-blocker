  export function initAmazon(siteKey = 'amazon') {
const PRODUCT_SELECTOR = '[role="listitem"], div[data-cel-widget^="MAIN-VIDEO_SINGLE_PRODUCT-"], div[id*="feature_div"], div[data-cel-widget^="MAIN-FEATURED_ASINS_LIST"], [class^="_octopus-search-result-"], div.s-result-item, li[class*="product-grid__grid-item"], div[id*="-sponsored-products"]';

    function isSponsored(product) {
      const textMatch = Array.from(product.querySelectorAll('span')).some(span =>
        span.textContent.trim().toLowerCase() === 'sponsored'
      );
      const labelMatch = product.querySelector('span[aria-label="View Sponsored information or leave ad feedback"]');
      return labelMatch || textMatch;
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
      document.querySelectorAll(PRODUCT_SELECTOR).forEach(product => {
        if (isSponsored(product) && product.style.display !== 'none' && !product.hasAttribute('data-sponsored-hidden')) {
          fadeOut(product);
        }
      });
    }

    function showSponsored() {
      document.querySelectorAll('[data-sponsored-hidden="true"]').forEach(product => {
        fadeIn(product);
      });
    }

    function highlightSponsored() {
      document.querySelectorAll(PRODUCT_SELECTOR).forEach(product => {
        if (isSponsored(product)) product.classList.add('highlight-sponsored');
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

    // Observe DOM changes and apply settings
    const observer = new MutationObserver(() => {
      chrome.storage.sync.get([`${siteKey}_hideSponsored`, `${siteKey}_highlightSponsored`, `${siteKey}_highlightColor`], result => {
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
    chrome.storage.sync.get([`${siteKey}_hideSponsored`, `${siteKey}_highlightSponsored`, `${siteKey}_highlightColor`], result => {
      if (result[`${siteKey}_hideSponsored`]) hideSponsored();
      else showSponsored();

      if (result[`${siteKey}_highlightSponsored`]) highlightSponsored();
      else removeHighlight();

      if (result[`${siteKey}_highlightColor`]) {
        document.documentElement.style.setProperty('--highlight-color', result[`${siteKey}_highlightColor`]);
      }
    });
  }

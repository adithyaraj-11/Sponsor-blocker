// == SponsorSnap content.js ==

// Common CSS for fade animations and highlight
const style = document.createElement('style');
style.textContent = `
  @keyframes grayscale-fade-out {
    0% {
      opacity: 1;
      filter: grayscale(0%) blur(0px);
    }
    50% {
      filter: grayscale(70%) blur(1px);
    }
    100% {
      opacity: 0;
      filter: grayscale(100%) blur(2px);
    }
  }

  @keyframes grayscale-fade-in {
    0% {
      opacity: 0;
      filter: grayscale(100%) blur(2px);
    }
    50% {
      filter: grayscale(30%) blur(1px);
    }
    100% {
      opacity: 1;
      filter: grayscale(0%) blur(0px);
    }
  }

  .grayscale-fade-out {
    animation: grayscale-fade-out 2s ease-in-out forwards;
    pointer-events: none;
  }

  .grayscale-fade-in {
    animation: grayscale-fade-in 2s ease-in-out forwards;
  }

  .highlight-sponsored {
    background-color: rgba(255, 0, 0, 0.3) !important;
    transition: background-color 0.5s ease;
  }
`;
document.head.appendChild(style);

// Detect which site we are on
const url = window.location.href;

if (url.includes('flipkart.com')) {
  runFlipkartLogic();
} else if (url.includes('amazon.com') || url.includes('amazon.in') || url.includes('amazon.co.uk')) {
  runAmazonLogic();
} else {
  console.log('SponsorSnap: Unsupported site');
}

// --- FLIPKART LOGIC ---
function runFlipkartLogic() {
  const PRODUCT_CONTAINER_SELECTOR = '[data-id]';
  const ROW_CONTAINER_SELECTOR = '._75nlfW';

  function grayscaleFadeOut(product) {
    product.classList.add('grayscale-fade-out');
    product.addEventListener('animationend', function handler() {
      product.style.display = 'none';
      product.setAttribute('data-sponsored-hidden', 'true');
      product.classList.remove('grayscale-fade-out');
      product.removeEventListener('animationend', handler);
    }, { once: true });
  }

  function grayscaleFadeIn(product) {
    product.style.display = '';
    product.classList.add('grayscale-fade-in');
    product.addEventListener('animationend', function handler() {
      product.removeAttribute('data-sponsored-hidden');
      product.classList.remove('grayscale-fade-in');
      product.removeEventListener('animationend', handler);
    }, { once: true });
  }

  function hideSponsoredProducts() {
    const rows = document.querySelectorAll(ROW_CONTAINER_SELECTOR);
    rows.forEach(row => {
      const products = row.querySelectorAll(PRODUCT_CONTAINER_SELECTOR);
      products.forEach(product => {
        // Flipkart sponsored detection: presence of <rect> element inside product container
        if (product.querySelector('rect') &&
          product.style.display !== 'none' &&
          !product.hasAttribute('data-sponsored-hidden')) {
          grayscaleFadeOut(product);
        }
      });
    });
  }

  function showSponsoredProducts() {
    const hiddenProducts = document.querySelectorAll('[data-sponsored-hidden="true"]');
    hiddenProducts.forEach(product => {
      grayscaleFadeIn(product);
    });
  }

  function highlightSponsoredProducts() {
    const rows = document.querySelectorAll(ROW_CONTAINER_SELECTOR);
    rows.forEach(row => {
      const products = row.querySelectorAll(PRODUCT_CONTAINER_SELECTOR);
      products.forEach(product => {
        if (product.querySelector('rect')) {
          product.classList.add('highlight-sponsored');
        }
      });
    });
  }

  function removeHighlightSponsoredProducts() {
    document.querySelectorAll('.highlight-sponsored').forEach(el => {
      el.classList.remove('highlight-sponsored');
    });
  }

  // Listen to popup.js messages
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleSponsored') {
      if (request.hide) {
        hideSponsoredProducts();
        sendResponse({ status: 'hidden' });
      } else {
        showSponsoredProducts();
        sendResponse({ status: 'shown' });
      }
    } else if (request.action === 'toggleHighlight') {
      if (request.highlight) {
        highlightSponsoredProducts();
        sendResponse({ status: 'highlighted' });
      } else {
        removeHighlightSponsoredProducts();
        sendResponse({ status: 'unhighlighted' });
      }
    }
    return true;
  });

  // MutationObserver for dynamic content loading
  const observer = new MutationObserver(() => {
    chrome.storage.sync.get(['hideSponsored', 'highlightSponsored'], result => {
      if (result.hideSponsored) hideSponsoredProducts();
      if (result.highlightSponsored) highlightSponsoredProducts();
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // On initial load, apply stored settings
  chrome.storage.sync.get(['hideSponsored', 'highlightSponsored'], result => {
    if (result.hideSponsored) {
      hideSponsoredProducts();
    } else {
      showSponsoredProducts();
    }
    if (result.highlightSponsored) {
      highlightSponsoredProducts();
    } else {
      removeHighlightSponsoredProducts();
    }
  });
}

// --- AMAZON LOGIC ---
function runAmazonLogic() {
  // Amazon product containers are role=listitem
  // Sponsored items have spans with aria-label = "View Sponsored information" or "leave ad feedback"
  // Also hide if aria-label includes "Sponsored video"

const PRODUCT_SELECTOR = '[role="listitem"], div[data-cel-widget^="MAIN-VIDEO_SINGLE_PRODUCT-"]';

  function isSponsored(product) {
  // Match aria-labels related to sponsorship
  const labelMatches = product.querySelector('span[aria-label="View Sponsored information or leave ad feedback"]');


  // Also check for spans that say "Sponsored" text content
  const textMatch = Array.from(product.querySelectorAll('span')).some(span =>
    span.textContent.trim().toLowerCase() === 'sponsored'
  );

  return labelMatches || textMatch;
}



  function grayscaleFadeOut(product) {
    product.classList.add('grayscale-fade-out');
    product.addEventListener('animationend', function handler() {
      product.style.display = 'none';
      product.setAttribute('data-sponsored-hidden', 'true');
      product.classList.remove('grayscale-fade-out');
      product.removeEventListener('animationend', handler);
    }, { once: true });
  }

  function grayscaleFadeIn(product) {
    product.style.display = '';
    product.classList.add('grayscale-fade-in');
    product.addEventListener('animationend', function handler() {
      product.removeAttribute('data-sponsored-hidden');
      product.classList.remove('grayscale-fade-in');
      product.removeEventListener('animationend', handler);
    }, { once: true });
  }

  function hideSponsoredProducts() {
    const products = document.querySelectorAll(PRODUCT_SELECTOR);
    products.forEach(product => {
      if (isSponsored(product) &&
        product.style.display !== 'none' &&
        !product.hasAttribute('data-sponsored-hidden')) {
        grayscaleFadeOut(product);
      }
    });
  }

  function showSponsoredProducts() {
    const hiddenProducts = document.querySelectorAll('[data-sponsored-hidden="true"]');
    hiddenProducts.forEach(product => {
      grayscaleFadeIn(product);
    });
  }

  function highlightSponsoredProducts() {
    const products = document.querySelectorAll(PRODUCT_SELECTOR);
    products.forEach(product => {
      if (isSponsored(product)) {
        product.classList.add('highlight-sponsored');
      }
    });
  }

  function removeHighlightSponsoredProducts() {
    document.querySelectorAll('.highlight-sponsored').forEach(el => {
      el.classList.remove('highlight-sponsored');
    });
  }

  // Listen to popup.js messages
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleSponsored') {
      if (request.hide) {
        hideSponsoredProducts();
        sendResponse({ status: 'hidden' });
      } else {
        showSponsoredProducts();
        sendResponse({ status: 'shown' });
      }
    } else if (request.action === 'toggleHighlight') {
      if (request.highlight) {
        highlightSponsoredProducts();
        sendResponse({ status: 'highlighted' });
      } else {
        removeHighlightSponsoredProducts();
        sendResponse({ status: 'unhighlighted' });
      }
    }
    return true;
  });

  // MutationObserver for dynamic content loading
  const observer = new MutationObserver(() => {
    chrome.storage.sync.get(['hideSponsored', 'highlightSponsored'], result => {
      if (result.hideSponsored) hideSponsoredProducts();
      if (result.highlightSponsored) highlightSponsoredProducts();
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // On initial load, apply stored settings
  chrome.storage.sync.get(['hideSponsored', 'highlightSponsored'], result => {
    if (result.hideSponsored) {
      hideSponsoredProducts();
    } else {
      showSponsoredProducts();
    }
    if (result.highlightSponsored) {
      highlightSponsoredProducts();
    } else {
      removeHighlightSponsoredProducts();
    }
  });
}

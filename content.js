// Selectors for products and rows on Flipkart
const PRODUCT_CONTAINER_SELECTOR = '[data-id]';
const ROW_CONTAINER_SELECTOR = '._75nlfW';

// CSS for grayscale fade animations
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
    background-color: rgba(255, 0, 0, 0.5) !important;
    transition: background-color 0.5s ease;
  }
`;
document.head.appendChild(style);

// Fade out with grayscale over 2s
function grayscaleFadeOut(product) {
  product.classList.add('grayscale-fade-out');

  product.addEventListener('animationend', function handler() {
    product.style.display = 'none';
    product.setAttribute('data-sponsored-hidden', 'true');
    product.classList.remove('grayscale-fade-out');
    product.removeEventListener('animationend', handler);
  }, { once: true });
}

// Fade in with grayscale over 2s
function grayscaleFadeIn(product) {
  product.style.display = '';
  product.classList.add('grayscale-fade-in');

  product.addEventListener('animationend', function handler() {
    product.removeAttribute('data-sponsored-hidden');
    product.classList.remove('grayscale-fade-in');
    product.removeEventListener('animationend', handler);
  }, { once: true });
}

// Hide sponsored products
function hideSponsoredProducts() {
  const rows = document.querySelectorAll(ROW_CONTAINER_SELECTOR);

  rows.forEach(row => {
    const products = row.querySelectorAll(PRODUCT_CONTAINER_SELECTOR);

    products.forEach(product => {
      if (
        product.querySelector('rect') && // sponsored detection
        product.style.display !== 'none' &&
        !product.hasAttribute('data-sponsored-hidden')
      ) {
        grayscaleFadeOut(product);
      }
    });
  });
}

// Show sponsored products
function showSponsoredProducts() {
  const hiddenProducts = document.querySelectorAll('[data-sponsored-hidden="true"]');

  hiddenProducts.forEach(product => {
    grayscaleFadeIn(product);
  });
}

// Highlight sponsored products (red background)
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

// Remove highlight from sponsored products
function removeHighlightSponsoredProducts() {
  document.querySelectorAll('.highlight-sponsored').forEach(el => {
    el.classList.remove('highlight-sponsored');
  });
}

// MutationObserver for dynamic content
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.addedNodes.length > 0) {
      chrome.storage.sync.get(['hideSponsored', 'highlightSponsored'], result => {
        if (result.hideSponsored) hideSponsoredProducts();
        if (result.highlightSponsored) highlightSponsoredProducts();
      });
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial load - read storage and apply states
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

// Listen to messages from popup.js
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

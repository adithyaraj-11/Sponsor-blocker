export function injectHighlightStyles() {
  if (document.getElementById('sponsorsnap-style')) return;

  const style = document.createElement('style');
  style.id = 'sponsorsnap-style';
  style.textContent = `
    .highlight-sponsored {
      background-color: var(--highlight-color, yellow) !important;
      transition: background-color 0.3s ease;
    }

    .grayscale-fade-out {
      animation: grayscaleFadeOut 0.7s forwards;
    }
    .grayscale-fade-in {
      animation: grayscaleFadeIn 0.7s forwards;
    }

    @keyframes grayscaleFadeOut {
      to {
        filter: grayscale(100%);
        opacity: 0;
      }
    }
    @keyframes grayscaleFadeIn {
      from {
        filter: grayscale(100%);
        opacity: 0;
      }
      to {
        filter: none;
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}

export function initHighlightColor() {
  const url = window.location.href;
  let siteKey = null;
  if (url.includes('flipkart.com')) siteKey = 'flipkart';
  else if (url.includes('amazon.com') || url.includes('amazon.in') || url.includes('amazon.co.uk')) siteKey = 'amazon';

  if (!siteKey) return;

  chrome.storage.local.get(`${siteKey}_highlightColor`, result => {
    const color = result[`${siteKey}_highlightColor`] || '#ffff00';
    document.documentElement.style.setProperty('--highlight-color', color);
  });
}

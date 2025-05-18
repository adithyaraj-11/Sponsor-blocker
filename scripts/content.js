// Inject shared styles (highlight, animations, etc.)
import('./colorpicker.js').then(({ injectHighlightStyles, initHighlightColor }) => {
  injectHighlightStyles();
  initHighlightColor(); // will load saved color from storage depending on site
});

const url = window.location.href;

let currentSite = null;
if (url.includes('flipkart.com')) currentSite = 'flipkart';
else if (url.includes('amazon.com') || url.includes('amazon.in') || url.includes('amazon.co.uk')) currentSite = 'amazon';

if (currentSite === 'flipkart') {
  import('./flipkart.js').then(mod => mod.initFlipkart(currentSite));
} else if (currentSite === 'amazon') {
  import('./amazon.js').then(mod => mod.initAmazon(currentSite));
} else {
  console.log('SponsorSnap: Unsupported site');
}

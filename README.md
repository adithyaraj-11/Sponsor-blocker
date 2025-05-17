# SponsorSnap

**Snap your sponsored clutter away!**

SponsorSnap is a lightweight Chrome extension that gives you control over sponsored product listings on shopping websites like Flipkart. With simple toggle options, you can **hide** or **highlight** sponsored results — making it easier to browse only the content that matters to you.

---

## ✨ Features

- 🛑 **Hide Sponsored Products**: Remove clutter and distractions from your shopping experience.
- 🎯 **Highlight Sponsored Products**: Want to identify what's sponsored without hiding it? Just highlight them.
- 💡 **User-Friendly Interface**: Simple toggle controls in the popup.

---

## 📦 Installation

1. Clone or download this repository.

   ```bash
   git clone https://github.com/adithyaraj-11/SponsorSnap.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`.

3. Enable **Developer Mode** (top right corner).

4. Click **Load unpacked** and select the project directory.

---

## 🔧 Project Structure

```bash
SponsorSnap/
├── popup.html         # Extension popup UI
├── popup.js           # Popup behavior (toggle logic)
├── content.js         # Injected into shopping sites to hide/highlight sponsored content
├── background.js      # Optional: background service worker
├── manifest.json      # Extension configuration
└── icons/             # Extension icons (16x, 48x, 128x)

```

---

## ⚠️ Permissions

This extension uses the following permissions:

- `activeTab`, `tabs`: To access current page content.
- `storage`: To save toggle preferences.
- `scripting`: To inject content scripts dynamically.

---

## 🛡️ Privacy

SponsorSnap **does not collect or store** any user data.

---

> Feel free to fork, contribute, or suggest improvements.  
> Happy browsing! 🚀

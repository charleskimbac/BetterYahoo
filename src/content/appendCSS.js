/* global clog */

// todo: eventually should move all css stuff in content.js to here
main();
async function main() {
  const settings = await chrome.storage.sync.get();

  if (Object.keys(settings).length === 0) {
    clog("appendCSS", "no settings found");
    return;
  }

  // apply dark theme; disable for settings page (text is same color as background)
  if (settings.useDarkTheme && !settings.backToOldUI && !location.href.includes("https://mail.yahoo.com/b/settings/")) {
    const path = "src/content/css/darkTheme.css";
    applyCSS(path);
  }

  if (settings.removeComingSoonBar) {
    const path = "src/content/css/removeComingSoonBar.css";
    applyCSS(path);
  }

  if (settings.oldHideAds) {
    const path = "src/content/css/oldHideAds.css";
    applyCSS(path);
  }
}

function applyCSS(pathToCSS) {
  const css = chrome.runtime.getURL(pathToCSS);
  const link = document.createElement("link");
  link.href = css;
  link.rel = "stylesheet";
  link.type = "text/css";
  document.documentElement.append(link);
  clog(`appended ${pathToCSS}`);
}
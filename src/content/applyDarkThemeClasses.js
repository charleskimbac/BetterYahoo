/* global clog */

main();
async function main() {
  const response = await chrome.storage.sync.get();
  const useDarkTheme = response && response.useDarkTheme;

  if (!useDarkTheme) {
    clog("dark theme not applied");
    return;
  }

  appendDarkTheme();
  clog("dark theme applied");
}

function appendDarkTheme() {
  const css = chrome.runtime.getURL("src/content/darkTheme.css");
  const link = document.createElement("link");
  link.href = css;
  link.rel = "stylesheet";
  link.type = "text/css";
  document.documentElement.append(link);
}
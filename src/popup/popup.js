/* global clog */

main();
async function main() {
  const settings = await getSettings();

  // check if no settings
  if (Object.keys(settings).length === 0) {
    return;
  }

  // hide warning, show content
  const h4 = document.querySelector("#initialWarning");
  h4.style.display = "none";
  const content = document.querySelector("#content");
  content.style.display = "block";

  const checkboxDiv = document.getElementById("checkbox-div");

  // make checkbox for each setting
  for (const setting in settings) {
    let [ div, input ] = createInputAndLabelCheckboxDiv(setting);
    input.checked = settings[setting];
    checkboxDiv.append(div);
  }

  const saveButton = document.getElementById("save-button");
  saveButton.addEventListener("click", saveSettings);

  /*
  const resetButton = document.getElementById("reset-button");
  resetButton.addEventListener("click", resetSettings);
  */
}

async function getSettings() {
  const settings = await chrome.storage.sync.get();
  return settings;
}

function saveSettings() {
  const settings = {};
  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  for (const checkbox of checkboxes) {
    settings[checkbox.id] = checkbox.checked;
  }

  chrome.storage.sync.set(settings, () => {
    clog("settings saved", settings);
  });

  const p = document.querySelector("#save-message");
  p.style.display = "block";
}

/*
function resetSettings() {
  chrome.storage.sync.set(defaultSettings, () => {
    console.log("default settings saved");
  });
}
*/

function createInputAndLabelCheckboxDiv(name) {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = name;

  const label = document.createElement("label");
  label.htmlFor = name;
  label.innerHTML = name;

  const div = document.createElement("div");
  div.append(input, label);

  return [ div, input ];
}
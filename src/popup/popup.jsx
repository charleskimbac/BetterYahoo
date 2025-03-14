import clog from "../globals/clog.js";

const settingToText = {
  backToOldUI: "Go back to the old UI",
  sortByUnreadAlways: "Always sort by unread",
  hideAds: "Hide ads",
  deleteBottomControlBar: "Delete bottom control bar",
  makeEmailContentScrollable: "Make email content scrollable",
  makeMailboxSectionScrollable: "Make mailbox section scrollable",
  applyBetterEmailHeaderSpacing: "Apply better email header spacing",
  makeEmailsSectionScrollable: "Make emails section scrollable",
  enlargeCheckboxes: "Enlarge checkboxes",
  addEmailDayLabels: "Add email receive day labels",
  useDarkTheme: "Use dark theme",
  showFullNewMailCircleIndicator: "Show full new mail circle indicator",
  autoConfirmSelections: "Auto confirm selections"
};

const oldUISettings = ["backToOldUI"];
const basicUISettings = ["sortByUnreadAlways", "hideAds", "deleteBottomControlBar", "makeEmailContentScrollable", "makeMailboxSectionScrollable", "applyBetterEmailHeaderSpacing", "makeEmailsSectionScrollable", "enlargeCheckboxes", "addEmailDayLabels", "useDarkTheme", "showFullNewMailCircleIndicator", "autoConfirmSelections"];

let settings;

main();
async function main() {
  settings = await getSettings();

  // check if no settings
  if (Object.keys(settings).length === 0) {
    return;
  }
  // hideWarningAndShowContent();

  loadCheckboxes();


//make a warning if enabling old ui
// note that ext only works for basic or old ui
//donate

  /*
  const resetButton = document.getElementById("reset-button");
  resetButton.addEventListener("click", resetSettings);
  */
}

function loadCheckboxes() {
  const oldUiDiv = document.querySelector("#old-ui");
  oldUISettings.forEach(setting => {
    const div = createInputAndLabelCheckbox(setting);
    oldUiDiv.append(div);
  });

  const basicUiDiv = document.querySelector("#basic-ui");
  basicUISettings.forEach(setting => {
    const div = createInputAndLabelCheckbox(setting);
    basicUiDiv.append(div);
  });
}

function hideWarningAndShowContent() {
  const h4 = document.querySelector("#initialWarning");
  h4.style.display = "none";
  const content = document.querySelector("#content");
  content.style.display = "block";
}

async function getSettings() {
  const settings = await chrome.storage.sync.get();

  clog("settings", settings);
  return settings;
}

/*
function resetSettings() {
  chrome.storage.sync.set(defaultSettings, () => {
    console.log("default settings saved");
  });
}
*/

function createInputAndLabelCheckbox(name) {
  const div = document.createElement("div");
  div.classList.add("text-left");

  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = name;
  input.classList.add("mr-1");

  const label = document.createElement("label");
  label.htmlFor = name;
  label.innerHTML = settingToText[name];

  if (settings[name] == true) {
    input.checked = true;
  }

  const dropdown = createDropdown("lool!@!@!# !#!@#!@#!@");

  div.append(input, label, dropdown);

  return div;
}


function createDropdown(desc) {
  /*

<div class="dropdown">
  <div tabindex="0" role="button" class="btn m-1" style="width: 50px; height: 50px; transform: scale(.3); background-color: white;">
    
    <img src="https://www.svgrepo.com/show/37175/down-arrow-black-triangular-variant-symbol.svg" style="width: 100px; height: 100px;"/>
  </div>
  <div
    tabindex="0"
    class="dropdown-content card card-sm bg-base-100 z-1 w-64 shadow-md">
    <div class="card-body">
      <p>This is a card. You can use any element as a dropdown.</p>
    </div>
  </div>
</div>

*/

  const dropdownDiv = document.createElement("div");
  dropdownDiv.classList.add("dropdown");
  dropdownDiv.style = "max-width: 20px; max-height: 20px;";

  const buttonDiv = document.createElement("div");
  buttonDiv.setAttribute("tabindex", "0");
  buttonDiv.setAttribute("role", "button");
  buttonDiv.classList.add("btn", "btn-xs", "btn-square");
  buttonDiv.style = "background-color: white;";

  buttonDiv.innerHTML = "?";
  // const img = document.createElement("img");
  // const path = chrome.runtime.getURL("images/downTriangleArrow.svg");
  // img.src = path;
  // img.style = "width: 100px; height: 100px;";

  const dropdownContentDiv = document.createElement("div");
  dropdownContentDiv.setAttribute("tabindex", "0");
  dropdownContentDiv.classList.add("dropdown-content", "card", "card-sm", "bg-base-100", "z-1", "w-64", "shadow-md");

  const cardBodyDiv = document.createElement("div");
  cardBodyDiv.classList.add("card-body");
  cardBodyDiv.innerHTML = desc;

  dropdownContentDiv.append(cardBodyDiv);
  //buttonDiv.append(img);
  dropdownDiv.append(buttonDiv, dropdownContentDiv);

  return dropdownDiv;
}


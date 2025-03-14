import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import clog from '../globals/clog.js'
import App from './App.jsx'

const userSettings = {
  sortByUnreadAlways: false,
  hideAds: true,
  deleteBottomControlBar: true,
  makeEmailContentScrollable: true,
  makeMailboxSectionScrollable: true,
  applyBetterEmailHeaderSpacing: true,
  makeEmailsSectionScrollable: true,
  enlargeCheckboxes: true,
  addEmailDayLabels: true,
  backToOldUI: false,
  useDarkTheme: false,
  showFullNewMailCircleIndicator: true,
  autoConfirmSelections: true
};

const OLD_UI_SETTINGS = ["backToOldUI"];
const BASIC_UI_SETTINGS = ["sortByUnreadAlways", "hideAds", "enlargeCheckboxes", "addEmailDayLabels", "useDarkTheme", "autoConfirmSelections"];
const MINOR_BASIC_UI_SETTINGS = ["deleteBottomControlBar", "makeEmailContentScrollable", "makeMailboxSectionScrollable", "applyBetterEmailHeaderSpacing", "makeEmailsSectionScrollable", "enlargeCheckboxes", "showFullNewMailCircleIndicator"];

const SETTING_TO_LABEL_TEXT = {
  sortByUnreadAlways: "Always sort mail by unread",
  hideAds: "Hide ads",
  deleteBottomControlBar: "Delete bottom control bar",
  makeEmailContentScrollable: "Improve page scrollability",
  makeMailboxSectionScrollable: "Make mailbox section scrollable",
  applyBetterEmailHeaderSpacing: "Improve email header spacing",
  makeEmailsSectionScrollable: "Improve page scrollability",
  enlargeCheckboxes: "Enlarge checkboxes",
  addEmailDayLabels: "Bring back email receive day labels",
  backToOldUI: "Go back to the old UI",
  useDarkTheme: "Use dark theme",
  showFullNewMailCircleIndicator: "Show full new mail circle indicator",
  autoConfirmSelections: "Auto confirm selections"
};

const SETTING_TO_MODAL_TEXT = {
  // sortByUnreadAlways: "Sort mail by unread",
  // hideAds: "Hide ads",
  deleteBottomControlBar: "XD!",
  // makeEmailContentScrollable: "Make email content scrollable",
  // makeMailboxSectionScrollable: "Make mailbox section scrollable",
  // applyBetterEmailHeaderSpacing: "Apply better email header spacing",
  // makeEmailsSectionScrollable: "Make emails section scrollable",
  enlargeCheckboxes: "xDDDDD",
  addEmailDayLabels: "Bring back the \"Today\", \"Yesterday\", \"Last Week\" labels in your inbox.",
  backToOldUI: "Please note that this feature may break at any time, should Yahoo choose to fix this workaround.",
  // useDarkTheme: "Use dark theme",
  // showFullNewMailCircleIndicator: "Show full new mail circle indicator",
  autoConfirmSelections: "LOOOO"
};

// PRESETS END HERE

let displayContent = false;


const userOldUISettings = [];
const userBasicUISettings = [];
const userMinorBasicUISettings = [];
for (let userSetting in userSettings) {
  const obj = {
    key: userSetting,
    labelText: SETTING_TO_LABEL_TEXT[userSetting],
    modalText: SETTING_TO_MODAL_TEXT[userSetting],
    enabled: userSettings[userSetting]
  };

  if (OLD_UI_SETTINGS.includes(userSetting)) {
    userOldUISettings.push(obj);
  } else if (BASIC_UI_SETTINGS.includes(userSetting)) {
    userBasicUISettings.push(obj);
  } else if (MINOR_BASIC_UI_SETTINGS.includes(userSetting)) {
    userMinorBasicUISettings.push(obj);
  } else {
    clog("Unknown setting", userSetting);
  }
}

clog("userSettings", userSettings);
clog("userOldUISettings", userOldUISettings);
clog("userBasicUISettings", userBasicUISettings);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App oldSettings={userOldUISettings} basicSettings={userBasicUISettings} minorBasicSettings={userMinorBasicUISettings} displayContent={displayContent}/>
  </StrictMode>
);

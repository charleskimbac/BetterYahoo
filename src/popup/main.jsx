import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import clog from '../globals/clog.js'
import App from './components/App.jsx'

main();
async function main() {
  // PRESETS START HERE

  const OLD_UI_SETTINGS = ["backToOldUI", "sortByUnreadAlwaysOldUI"];
  const BASIC_UI_SETTINGS = ["sortByUnreadAlways", "hideAds", "enlargeCheckboxes", "addEmailDayLabels", "useDarkTheme", "autoConfirmSelections"];
  const MINOR_BASIC_UI_SETTINGS = ["deleteBottomControlBar", "makeEmailContentScrollable", "makeMailboxSectionScrollable", "applyBetterEmailHeaderSpacing", "makeEmailsSectionScrollable", "enlargeCheckboxes", "showFullNewMailCircleIndicator"];

  const SETTING_TO_LABEL_TEXT = {
    sortByUnreadAlways: "Always sort mail by unread",
    hideAds: "Hide ads",
    deleteBottomControlBar: "Delete bottom control bar",
    makeEmailContentScrollable: "Make email content section scrollable",
    makeMailboxSectionScrollable: "Make mailbox section scrollable",
    applyBetterEmailHeaderSpacing: "Improve email header spacing",
    makeEmailsSectionScrollable: "Make email inbox section scrollable",
    enlargeCheckboxes: "Enlarge checkboxes",
    addEmailDayLabels: "Add 'email receive day' labels",
    backToOldUI: "Go back to the old UI",
    useDarkTheme: "Use dark theme",
    showFullNewMailCircleIndicator: "Show full new mail circle indicator",
    autoConfirmSelections: "Auto confirm selections",
    sortByUnreadAlwaysOldUI: "Always sort mail by unread"
  };

  const SETTING_TO_MODAL_TEXT = {
    // sortByUnreadAlways: "Sort mail by unread",
    // hideAds: "Hide ads",
    deleteBottomControlBar: 'Remove the toolbar at the bottom of the page since it is already at the top.',
    // makeEmailContentScrollable: "Make email content scrollable",
    // makeMailboxSectionScrollable: "Make mailbox section scrollable",
    // applyBetterEmailHeaderSpacing: "Apply better email header spacing",
    // makeEmailsSectionScrollable: "Make emails section scrollable",
    enlargeCheckboxes: "Makes selecting individual emails easier.",
    addEmailDayLabels: "Bring back the \"Today\", \"Yesterday\", \"Last Week\", and day labels in your inbox.\nThis feature will not work if the \"Always sort mail by unread\" setting is also enabled.",
    backToOldUI: "Please note that this feature may break at any time, should Yahoo choose to fix this workaround.\nBasic UI settings will be disabled while this setting is on.",
    // useDarkTheme: "Use dark theme",
    // showFullNewMailCircleIndicator: "Show full new mail circle indicator",
    autoConfirmSelections: "Auto apply and submit your selection for the \"Actions\", \"Account Info\", and \"Sort By\" buttons."
  };

  // PRESETS END HERE

/* uncomment/comment the below 2 sections to use `run dev` vs prod */
/* force user settings (dev) */
  // const userSettings = {
  //   sortByUnreadAlwaysOldUI: false,
  //   sortByUnreadAlways: false,
  //   hideAds: true,
  //   deleteBottomControlBar: true,
  //   makeEmailContentScrollable: true,
  //   makeMailboxSectionScrollable: true,
  //   applyBetterEmailHeaderSpacing: true,
  //   makeEmailsSectionScrollable: true,
  //   enlargeCheckboxes: true,
  //   addEmailDayLabels: true,
  //   backToOldUI: false,
  //   useDarkTheme: false,
  //   showFullNewMailCircleIndicator: true,
  //   autoConfirmSelections: true
  // };
  // let displayContent = true;
  // clog("RESETTING USER SETTINGS");

/* get user settings (prod) */
  const userSettings = await chrome.storage.sync.get();
  let displayContent
  if (Object.keys(userSettings).length === 0) {
    displayContent = false;
  } else {
    displayContent = true;
  }
/*  */

  const userOldUISettings = [];
  const userBasicUISettings = [];
  const userMinorBasicUISettings = [];
  for (let userSetting in userSettings) {
    const settingObj = {
      name: userSetting,
      labelText: SETTING_TO_LABEL_TEXT[userSetting],
      modalText: SETTING_TO_MODAL_TEXT[userSetting],
      enabled: userSettings[userSetting]
    };

    if (OLD_UI_SETTINGS.includes(userSetting)) {
      userOldUISettings.push(settingObj);
    } else if (BASIC_UI_SETTINGS.includes(userSetting)) {
      userBasicUISettings.push(settingObj);
    } else if (MINOR_BASIC_UI_SETTINGS.includes(userSetting)) {
      userMinorBasicUISettings.push(settingObj);
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
}
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import clog from '../globals/clog.js'
import App from './components/App.jsx'

main();
async function main() {
  // btw we actually "add" new settings in content.js instead of here (to notify users too)
  const OLD_UI_SETTINGS = ["backToOldUI", "sortByUnreadAlwaysOldUI", "removeComingSoonBar", "oldHideAds", "sortByNewAlwaysNonInbox"];
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
    sortByUnreadAlwaysOldUI: "Always sort mail by unread",
    removeComingSoonBar: "Remove the \"Coming Soon...\" bar",
    oldHideAds: "Hide ads",
    sortByNewAlwaysNonInbox: "Always sort mail by new, except Inbox"
  };

  const SETTING_TO_MODAL_TEXT = {
    deleteBottomControlBar: 'Remove the toolbar at the bottom of the page since it is already at the top.',
    enlargeCheckboxes: "Makes selecting individual emails easier.",
    addEmailDayLabels: "Bring back the \"Today\", \"Yesterday\", \"Last Week\", and day labels in your inbox.\nThis feature will not work if the \"Always sort mail by unread\" setting is also enabled.",
    backToOldUI: "Please note that this feature may break at any time, should Yahoo choose to fix this workaround.\nBasic UI settings will be disabled while this setting is on.",
    autoConfirmSelections: "Auto apply and submit your selection for the \"Actions\", \"Account Info\", and \"Sort By\" buttons.",
    removeComingSoonBar: "Remove the Yahoo ad at the top of the page promoting a garbage new UI.",
    sortByNewAlwaysNonInbox: "Always sort mail by new when in folders like Drafts, Sent, Spam, and Trash.",
    sortByUnreadAlwaysOldUI: "Always sort mail by unread. To only sort mail by unread while in Inbox, turn on the \"Always sort mail by new, except Inbox\" setting."
  };

  const DEFAULT_SETTINGS = {
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
    autoConfirmSelections: true,
    sortByUnreadAlwaysOldUI: false,
    removeComingSoonBar: false,
    oldHideAds: false,
    sortByNewAlwaysNonInbox: false
};

  // get user settings
  let userSettings = await chrome.storage.sync.get();

  let showInitializedModal = false;
  if (Object.keys(userSettings).length === 0) {
    chrome.storage.sync.set(DEFAULT_SETTINGS);
    userSettings = DEFAULT_SETTINGS;
    showInitializedModal = true;
    clog(userSettings)
  }

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
      <App oldSettings={userOldUISettings} basicSettings={userBasicUISettings} minorBasicSettings={userMinorBasicUISettings} showInitializedModal={showInitializedModal}/>
    </StrictMode>
  );
}
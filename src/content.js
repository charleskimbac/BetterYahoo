/* global waitForElement clog*/ // these are executed first in manifest, so are global everywhere

/*
let mailboxesParentElement;
let mailboxElementsArr; // all children elems of mailboxesParentElement
const addressToMailboxElement = {}; // address: mailbox
*/


/* to do:
global search
RYM in basic ui
DOING RN: APPLY CSS DARK THEME BEFORE LOAD. SEE MANIFEST!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        {
            "matches": ["*://mail.yahoo.com/*"],
            "js": ["src/applyDarkTheme.js"],
            "run_at": "document_start"
        }
*/

// enums
const UI = Object.freeze({
    OLD: Symbol("old"),
    NEW: Symbol("new"),
    BASIC: Symbol("basic")
});

const Page = Object.freeze({
    EMAIL_CONTENT: Symbol("emailContent"),
    ALL_EMAILS: Symbol("allEmails"),
    SETTINGS: Symbol("settings")
});

let settings;

let currentUI;
let currentPage;
let maxHeightVH = 77; // this is changed if we remove bottom control bar

const defaultSettings = {
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

main();
async function main() {
    // const onNewUI = isOnNewUI();
    // if (onNewUI) {
    //     window.alert("Reorder Yahoo Mailboxes will not work if you are using the new Yahoo Mail. Please go back to the old Yahoo Mail by pressing the button at the top right of the page.");
    //     return;
    // }

    await getSettings();
    checkCurrentUI();

    // isOnAllEmailsPage() must be checked last, addEmailDayLabels() should be after sortByUnreadAlways()
    if (currentUI === UI.BASIC) {
        if (isOnEmailContentPage()) {
            currentPage = Page.EMAIL_CONTENT;

            if (settings.backToOldUI)
                backToOldUI();

            if (settings.hideAds)
                applyHideAdStyles();

            if (settings.deleteBottomControlBar)
                deleteBottomControlBar();

            if (settings.makeEmailContentScrollable)
                makeEmailContentScrollable(1);

            if (settings.makeMailboxSectionScrollable)
                makeMailboxSectionScrollable();

            if (settings.applyBetterEmailHeaderSpacing)
                applyBetterEmailHeaderSpacing();

            if (settings.useDarkTheme)
                useDarkTheme(Page.EMAIL_CONTENT);

            if (settings.showFullNewMailCircleIndicator)
                showFullNewMailCircleIndicator();

            if (settings.autoConfirmSelections)
                autoConfirmSelections();

            if (settings.sortByUnreadAlways)
                updateMailboxLinksToUnread();

        } else if (isOnSettingsPage()) {
            
        } else if (isOnAllEmailsPage()) { // must be checked last
            currentPage = Page.ALL_EMAILS;

            if (settings.sortByUnreadAlways)
                sortByUnreadAlways();

            if (settings.deleteBottomControlBar)
                deleteBottomControlBar();

            if (settings.hideAds)
                applyHideAdStyles();

            if (settings.makeMailboxSectionScrollable)
                makeMailboxSectionScrollable();

            if (settings.makeEmailsSectionScrollable)
                makeEmailsSectionScrollable();

            if (settings.enlargeCheckboxes)
                enlargeCheckboxes();

            if (settings.useDarkTheme)
                useDarkTheme();

            // only add labels if not on sort unread
            if (!isSortedByUnread()) {
                addEmailDayLabels();
            }

            if (settings.showFullNewMailCircleIndicator)
                showFullNewMailCircleIndicator();

            if (settings.autoConfirmSelections)
                autoConfirmSelections();
        }
    }

    if (location.href.startsWith("https://mail.yahoo.com/b/compose?")) { // fixes for now
        makeMailboxSectionScrollable();
        deleteBottomControlBar();
    }

    if (settings.backToOldUI || (settings.backToOldUI && location.href.startsWith("https://mail.yahoo.com/d/settings/"))) {
        backToOldUI();
    }
}

/*
function searchFromAllMailboxes() {
    const ids = [];

    const mailboxes = Array.from(document.querySelectorAll("li.P_2aKN71.o_h]"));

    // get account id
    const input = document.querySelector("input[type=hidden][name=ACCOUNT_ID]");
    const accountID = input.value;
    
}
*/

function applyHideAdStyles() {
    const style = document.createElement("style");
    style.id = "hideAdsStyle";
    style.innerHTML = `
        #google_ads_iframe_/22888152279/us/ymail/ros/dt/us_ymail_ros_dt_empty_folder_0__container__ { /* ad in spam/sent folder if no emails there */
            display: none;
        }

        div[data-test-id=gam-iframe-basic-mail] { /* right panel ads */
            visibility: hidden;
        }

        div[data-test-id=pencil-ad] { /* top bar ad */
            display: none;
        }
    `;

    document.head.append(style);
}

function replaceDarkCheckboxes() {
    // css for custom checkbox
    const style = document.createElement("style");
    style.innerHTML = `
        /* unchecked */
        .checkbox-label {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 1px solid #717171;
            border-radius: 4px;
            background-color: #0f2336;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            vertical-align: middle;
        }

        /* checked */
        input[type=checkbox].customInputCheckbox:checked + .checkbox-label::after {
            content: "✔";
            font-size: 12px;
            color: white;
            background-color: rgb(0, 0, 0);
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }
    `;
    document.head.append(style);

    const oldCheckboxes = document.querySelectorAll("input[type=checkbox][name='mids[]']");
    const checkboxParent = document.querySelectorAll("td[data-test-id=icon-btn-checkbox]");

    for (let i = 0; i < oldCheckboxes.length; i++) {
        const parent = checkboxParent[i];
        const oldCheckbox = oldCheckboxes[i];
        
        // input
        const customCheckbox = document.createElement("input");
        customCheckbox.type = "checkbox";
        customCheckbox.className = "customInputCheckbox";
        customCheckbox.id = "customCheck" + i;
        customCheckbox.style.display = "none";

        // label
        const customLabel = document.createElement("label");
        customLabel.htmlFor = "customCheck" + i;
        customLabel.className = "checkbox-label";

        // if old checkbox alr checked, set to checked (eg "select all" pressed)
        if (oldCheckbox.checked) {
            customCheckbox.click();
        }

        // connect label to old checkbox
        customLabel.addEventListener("click", () => {
            oldCheckbox.click();
        });

        parent.insertBefore(customCheckbox, oldCheckbox);
        parent.insertBefore(customLabel, oldCheckbox);

        oldCheckbox.style.display = "none";
    }
}

function showFullNewMailCircleIndicator() {
    const style = document.createElement("style");
    style.innerHTML = `
        .f_r.t_r.o_h {
            overflow: visible !important;
        }
    `;
    document.head.append(style);
}

function useDarkTheme(page = Page.ALL_EMAILS) {
    const style = document.createElement("style");
        
    const ICON_IMAGE_LINK = chrome.runtime.getURL("images/darkThemeIcons.png");

    const hoverColor = "#19344F";
    const centerColor = "rgb(15, 32, 48)";
    const sidebarColor = "rgb(19 40 62)";

    style.innerHTML = `
        .sidebar-theme {
            background-color: ${sidebarColor} !important;
        }

        .q_ZW7CQC { /* yahoo top page color */
            background: linear-gradient(60deg, #350090, #2b3567, #211e45) !important;
        }

        .center-view-theme {
            background-color: ${centerColor} !important;
        }

        a:link, a:visited { /* all (a) text, not !important */
            color: white;
        }

        .f_l { /* "Folders" text on left sidebar */
            color: white;
        }

        tr.i_6UHk.A_6EqO.I4_ZnMI27:hover { /* hover email color on allemail view */
            background-color: ${hoverColor} !important;
        }

        .A_6EWk.P_2jIBWi.o_h.I4_ZrEPFE:hover { /* mailbox hover */
            background-color: ${hoverColor} !important;
        }

        .A_6EqO.P_2jIBWi.o_h.I4_ZrEPFE:hover { /* main folders (inbox, etc) hover */
            background-color: ${hoverColor} !important;
        }

        a.A_6EqO.Q_6DEy.o_h.G_e.P_3LQ7g.D_B.I_T.I4_ZrEPFE:hover { /* "New folder" hover in sidebar */
            background-color: ${hoverColor} !important;
        }

        .u_b { /* unread emails bolder */
            font-weight: 750 !important;
        }

        body {
            scrollbar-color: #32485e #1e1e1e; /* scrollbar color */
        }

        button[value=markAsSpam] { /* Spam in allemail view */
            color: white !important;
        }

        button[value=moveToFolder] { /* Delete text in allemail view */
            color: white !important;
        }

        button[value=markAsNotSpam] { /* Not Spam in all spam view */
            color: white !important;
        }

        .q_ZsN8VL { /* current folder highlight */
            background: ${hoverColor} !important;
        }

        span[data-test-id=pageNumber] { /* page number in allemail view */
            color: white;
        }

        .c26zcWk_I { /* Reply, Reply All, Forward in content page */
            color: white !important;
        }

        .M_Z4bbOy.P_0.A_6FsP.t_l.C_Z281SGl.Y_fq7.U_6Eb4.I_ZkbNhI.W_6D6F {
            color: white !important;
            background-color: ${centerColor} !important;
        }

        span#nodin-inbox-pill { /* unread mail number in inbox left panel */
            color: white !important;
        }

        .email-received-label {
            color: white;
        }
    `;

    // update icons to dark theme
    style.innerHTML += `
        #Atom .q_Z1dv4XS {
        background: url(${ICON_IMAGE_LINK}) 0 -220px no-repeat !important
        }

        #Atom .q4_Z2pwHDv:hover {
        background: url(${ICON_IMAGE_LINK}) 0 -240px no-repeat !important
        }

        #Atom .q_1sCMuN {
        background: url(${ICON_IMAGE_LINK}) 0 -260px no-repeat !important
        }

        #Atom .q4_gB9Pb:hover {
        background: url(${ICON_IMAGE_LINK}) 0 -280px no-repeat !important
        }

        #Atom .q_19TPEI {
        background: url(${ICON_IMAGE_LINK}) 0 -1360px no-repeat !important
        }

        #Atom .q4_1rFlMJ:hover {
        background: url(${ICON_IMAGE_LINK}) 0 -1400px no-repeat !important
        }

        #Atom .q_Z26LYT {
        background: url(${ICON_IMAGE_LINK}) 0 -1380px no-repeat !important
        }

        #Atom .q_ZtaR9B {
        background: url(${ICON_IMAGE_LINK}) 0 -20px no-repeat !important
        }

        #Atom .q4_24NiRX:hover,#Atom .q_24NiRX {
        background: url(${ICON_IMAGE_LINK}) 0 -120px no-repeat !important
        }

        #Atom .q_23tTMg {
        background: url(${ICON_IMAGE_LINK}) 0 -380px no-repeat !important
        }

        #Atom .q_Z1vgA6T {
        background: url(${ICON_IMAGE_LINK}) 0 -180px no-repeat !important
        }

        #Atom .q4_Z1trjg:hover {
        background: url(${ICON_IMAGE_LINK}) 0 -200px no-repeat !important
        }

        #Atom .q_RLFdl {
        background: url(${ICON_IMAGE_LINK}) 0 -140px no-repeat !important
        }

        #Atom .q4_ZjeWrh:hover {
        background: url(${ICON_IMAGE_LINK}) 0 -160px no-repeat !important
        }

        #Atom .q_Z1gsXbI {
        background: url(${ICON_IMAGE_LINK}) 0 -700px no-repeat !important
        }

        #Atom .q4_dDgCl:hover {
        background: url(${ICON_IMAGE_LINK}) 0 -760px no-repeat !important
        }

        #Atom .q_ZFBPTg {
        background: url(${ICON_IMAGE_LINK}) 0 -820px no-repeat !important
        }

        #Atom .q4_NunTN:hover {
        background: url(${ICON_IMAGE_LINK}) 0 -880px no-repeat !important
        }

        #Atom .q_Z2suAQl {
        background: url(${ICON_IMAGE_LINK}) 0 -720px no-repeat !important
        }

        #Atom .q4_ZXnm2h:hover {
        background: url(${ICON_IMAGE_LINK}) 0 -780px no-repeat !important
        }

        #Atom .q_Z1RDtyS {
        background: url(${ICON_IMAGE_LINK}) 0 -840px no-repeat !important
        }

        #Atom .q4_2ihwHr:hover {
        background: url(${ICON_IMAGE_LINK}) 0 -900px no-repeat !important
        }

        #Atom .q_1pEThX {
        background: url(${ICON_IMAGE_LINK}) 0 -740px no-repeat !important
        }

        #Atom .q4_voLKm:hover {
        background: url(${ICON_IMAGE_LINK}) 0 -800px no-repeat !important
        }

        #Atom .q_20w1zq {
        background: url(${ICON_IMAGE_LINK}) 0 -860px no-repeat !important
        }

        #Atom .q4_16fT2O:hover {
        background: url(${ICON_IMAGE_LINK}) 0 -920px no-repeat !important
        }

        #Atom .q_Z2tNYW3 {
        background: url(${ICON_IMAGE_LINK}) 0 -980px no-repeat !important
        }

        #Atom .q4_Z1MF8Qh:hover {
        background: url(${ICON_IMAGE_LINK}) 0 -1020px no-repeat !important
        }

        #Atom .q_SsICp {
        background: url(${ICON_IMAGE_LINK}) 0 -1060px no-repeat !important
        }

        #Atom .q_ZADvbE {
        background: url(${ICON_IMAGE_LINK}) 0 -1000px no-repeat !important
        }

        #Atom .q4_25umi2:hover {
        background: url(${ICON_IMAGE_LINK}) 0 -1040px no-repeat !important
        }

        #Atom .q_ZixT2d {
        background: url(${ICON_IMAGE_LINK}) 0 -1080px no-repeat !important
        }

        #Atom .q_ONM0v {
        background: url(${ICON_IMAGE_LINK}) 0 -620px no-repeat !important
        }

        #Atom .q4_Z1yetjJ:hover {
        background: url(${ICON_IMAGE_LINK}) 0 -660px no-repeat !important
        }

        #Atom .q_ZmcPE7 {
        background: url(${ICON_IMAGE_LINK}) 0 -640px no-repeat !important
        }

        #Atom .q4_2jV1Oz:hover {
        background: url(${ICON_IMAGE_LINK}) 0 -680px no-repeat !important
        }

        #Atom .q4_21PpF8:hover,#Atom .q_21PpF8 {
        background: url(${ICON_IMAGE_LINK}) 0 -600px no-repeat !important
        }

        #Atom .q4_Z1eOt4A:hover,#Atom .q_Z1eOt4A {
        background: url(${ICON_IMAGE_LINK}) 0 -480px no-repeat !important
        }

        #Atom .q_ZW3WVz {
        background: url(${ICON_IMAGE_LINK}) 0 -520px no-repeat !important
        }

        #Atom .q_Z1wU5e2 {
        background: url(${ICON_IMAGE_LINK}) 0 -400px no-repeat !important
        }

        #Atom .q4_x3gRu:hover,#Atom .q_x3gRu {
        background: url(${ICON_IMAGE_LINK}) 0 -580px no-repeat !important
        }

        #Atom .q4_Z2MPoX:hover,#Atom .q_Z2MPoX {
        background: url(${ICON_IMAGE_LINK}) 0 -460px no-repeat !important
        }

        #Atom .q_eWEI3 {
        background: url(${ICON_IMAGE_LINK}) 0 -500px no-repeat !important
        }

        #Atom .q_ymEXc {
        background: url(${ICON_IMAGE_LINK}) 0 -320px no-repeat !important
        }

        #Atom .q4_Z1OFAm3:hover {
        background: url(${ICON_IMAGE_LINK}) 0 -360px no-repeat !important
        }

        #Atom .q_Z1cO1yO {
        background: url(${ICON_IMAGE_LINK}) 0 -1140px no-repeat !important
        }

        #Atom .q_z3Ing {
        background: url(${ICON_IMAGE_LINK}) 0 -1240px no-repeat !important
        }

        #Atom .q_ZBWThm {
        background: url(${ICON_IMAGE_LINK}) 0 -1260px no-repeat !important
        }

        #Atom .q_1tjPTR {
        background: url(${ICON_IMAGE_LINK}) 0 -1180px no-repeat !important
        }
        `;

    document.head.append(style);

    // left side bar
    // const leftBarParent = document.querySelector(".V_GM.I_Z1sX2Gk.x_Z14vXdP.W_3rdfm");
    // leftBarParent.classList.add("sidebar-theme");

    const defaultFoldersChildren = Array.from(document.querySelector("ul[data-test-id=system-folder-list]").children);
    const customFoldersChildren = Array.from(document.querySelector("ul[data-test-id=custom-folder-list]").children);

    defaultFoldersChildren.forEach((elem) => {
        elem.classList.add("sidebar-theme");
    });
    customFoldersChildren.forEach((elem) => {
        elem.classList.add("sidebar-theme");
    });

    // right side bar
    // const rightBarParent = document.querySelector(".V_GM.I_Z1sX2Gk.n_Z14vXdP");
    // if (rightBarParent) {
    //     rightBarParent.classList.add("sidebar-theme");
    // } else {
    //     clog("no right bar parent found");
    // }

    // main center view
    const centerTopView = document.querySelectorAll("tr.W_6D6F")[10];
    if (centerTopView) {
        centerTopView.classList.add("center-view-theme");
    } else {
        clog("no center top view found");
    }

    if (page === Page.ALL_EMAILS) { // in email content screen, let it be all white (normal) to ensure all content visible
        const centerMainView = document.querySelectorAll(".W_6D6F.H_6D6F.p_R.bo_BA.ku_f")[2];
        centerMainView.classList.add("center-view-theme");
    }

    replaceDarkCheckboxes();
}

async function getSettings() {
    settings = await chrome.storage.sync.get();
    
    if (!settings || Object.keys(settings).length === 0) {
        settings = defaultSettings;
        chrome.storage.sync.set(settings);
        clog("settings not found, set to default");
    }

    clog("settings", settings);
}

// check if sorted alr, we dont use and check location.href for "sortOrder=unread" since
// we could be sorted without that in the url
// should be same as first few lines of sortByUnreadAlways()
function isSortedByUnread() {
    const select = document.querySelector("select[name='sort_option[top]'");

    if (!select) {
        clog("select not found");
        return false;
    }

    // get unreadOptionIndex
    const unreadOptionElem = Array.from(select.options).find((elem) => {
        if (elem.innerHTML === "Unread") {
            return true;
        }
    });

    let unreadOptionIndex;
    if (!unreadOptionElem) {
        clog("unreadOptionElem not found");
        return false;
    }

    unreadOptionIndex = unreadOptionElem.index;

    if (select.selectedIndex === unreadOptionIndex) {
        return true;
    }
}

function sortByUnreadAlways() {
    updateMailboxLinksToUnread();

    // these first few lines should be same as isSortedByUnread() but lol
    const select = document.querySelector("select[name='sort_option[top]'");

    // get unreadOptionIndex
    const unreadOptionElem = Array.from(select.options).find((elem) => {
        if (elem.innerHTML === "Unread") {
            return true;
        }
    });
    const unreadOptionIndex = unreadOptionElem.index;

    // check if sorted alr, we dont use and check location.href for "sortOrder=unread" since
    // we could be sorted without that in the url
    if (select.selectedIndex === unreadOptionIndex) {
        clog("already sorted by unread");
        return;
    }

    select.selectedIndex = unreadOptionIndex;

    // submit
    const applyButton = select.parentNode.children[1];
    applyButton.click();
}

function updateMailboxLinksToUnread() {
    const ul = document.querySelector("ul[data-test-id=account-list]");
    const liElems = Array.from(ul.children);

    // https://mail.yahoo.com/b/folders/33?.src=ym&reason=myc&folderType=INBOX  : original href
    // https://mail.yahoo.com/b/folders/folders=33&sortOrder=unread?.src=ym&reason=myc&folderType=INBOX   : new href
    const beforeFolderNum = "https://mail.yahoo.com/b/folders/";

    liElems.forEach((elem) => {
        const a = elem.children[0];
        const originalHref = a.href;
        
        // get foldernum
        const indexEnd = originalHref.indexOf("?");
        const folderNum = originalHref.substring(beforeFolderNum.length, indexEnd);

        a.href = "/b/folders/folders=" + folderNum + "&sortOrder=unread?.src=ym&reason=basic_mail&folderType=INBOX";
    });
}

function enlargeCheckboxes() {
    const checkboxElems = Array.from(document.querySelectorAll("input[type=checkbox][name='mids[]']"));
    checkboxElems.forEach((elem) => {
        elem.style = "transform: scale(1.25); margin-left: 5px;";
    });
}

function applyBetterEmailHeaderSpacing() {
    const h2 = document.querySelector(".A_6FsP.a_eBt.D_X.mq_AQ");
    h2.style = "max-height: 80%;"; // better, at least while maximized lol
}

function autoConfirmSelections() {
    const toolbarSelect = document.querySelector("select[name='toolbar_option[top]']");
    const sortSelect = document.querySelector("select[name='sort_option[top]']");
    const jumpToSelect = document.querySelector("select[name=jumpTo]");

    const toolbarSubmit = document.querySelector("button[name=toolbar_action]");
    const sortSubmit = document.querySelector("button[name=sort_action]");
    const jumpToSubmit = document.querySelector("#headerGoButton");

    const selects = [toolbarSelect, sortSelect, jumpToSelect];
    const buttons = [toolbarSubmit, sortSubmit, jumpToSubmit];

    for (let i = 0; i < buttons.length; i++) {
        if (!selects[i] || !buttons[i]) {
            clog("select or button not found");
            continue;
        }

        buttons[i].style.display = "none";
        selects[i].onchange = () => {
            buttons[i].click();
        };
    }
}

function deleteBottomControlBar() {
    maxHeightVH += 5; // size of control bar to add
    const div = document.querySelector(".D_B.P_1Eu6qC.z_2wc7QY");

    if (div) {
        div.remove();
    } else {
        clog("no control bar to remove");
    }
}

/**
 * this needs to be checked last, ie before isOnEmailContentPage(), isOnSettingsPage()
 */
function isOnAllEmailsPage() {
    const url = location.href;
    if (url.startsWith("https://mail.yahoo.com/b/folders/") ||
        url.startsWith("https://mail.yahoo.com/b/?") ||
        url === "https://mail.yahoo.com/b/") {
            return true;
    }
    
    return false;
}

function isOnEmailContentPage() {
    const url = location.href;
    if (url.indexOf("/messages/") !== -1) {
        return true;
    }
    return false;
}

function isOnSettingsPage() {
    const url = location.href;
    if (url.indexOf("/settings/") !== -1) {
        return true;
    }
    return false;
}

function makeEmailContentScrollable(offset) { // +1 offset for when in emailcontent page
    const div = document.createElement("div");
    div.style = `overflow-y: auto; max-height: ${maxHeightVH + offset}vh`;


    const contentTD = document.querySelectorAll(".V_GM.H_6D6F")[1];
    Array.from(contentTD.children).forEach((elem) => {
        div.append(elem);
    });

    contentTD.append(div);
}

function makeEmailsSectionScrollable() {
    const mailListDiv = document.querySelector(".P_5xpcy");
    mailListDiv.style = `overflow-y: auto; max-height: ${maxHeightVH}vh;`;
}

function makeMailboxSectionScrollable() {
    const div = document.createElement("div");
    div.style = "overflow-y: auto; max-height: 77vh;";
    const mailboxSectionTD = document.querySelector(".V_GM.W_3r5Ku.H_6D6F");

    Array.from(mailboxSectionTD.children).forEach((elem) => {
        if (elem === div) {
            return;
        }
        div.append(elem);
    });

    mailboxSectionTD.append(div);

    // if scrollable (and scrollbar present), edit maxwidth to align with UI
    const hasVerticalScrollbar = div.scrollHeight > div.clientHeight;
    if (hasVerticalScrollbar) {
        Array.from(div.children).forEach((elem) => {
            elem.style = "max-width: 195px;";
        });
    }
}

function checkCurrentUI() {
    const url = location.href;
    if (url.startsWith("https://mail.yahoo.com/n/")) {
        currentUI = UI.NEW;
    } else if (url.startsWith("https://mail.yahoo.com/d/")) {
        currentUI = UI.OLD;
    } else if (url.startsWith("https://mail.yahoo.com/b/")) {
        currentUI = UI.BASIC;
    } else {
        alert("uCI");
    }
}

// THIS ONLY WORKS IF IN DEFAULT ORDER (sorted by received date)
// Today, Yesterday, Thursday, Monday, (other days), Last week; NOT SUPPORTED: last month, year, etc
function addEmailDayLabels() {
    const todaysDate = new Date();
    const todaysDayIndex = todaysDate.getDay();

    const mailElems = Array.from(document.querySelectorAll("tr[data-test-id=message-list-item]"));

    // we use Dates for easy comparing later, esp across months
    const receivedDatesToElement = {};
    const receivedDates = mailElems.map((elem) => { // for each email, get Date object of received date
        const td = elem.children[6];
        const a = td.children[0];
        const span = a.children[0];

        // if recieved this year, timestamp is Mon dd
        // otherwise, timestamp is mm/dd/yyyy
        const timestamp = span.innerHTML;

        let date;
        if (timestamp.indexOf("/") !== -1) { // not this yr
            // check what format
            const locale = navigator.languages[0];
           
            let mm, dd, yyyy;
            if (locale == "en-US") {
                [mm, dd, yyyy] = timestamp.split("/");
            } else {
                [dd, mm, yyyy] = timestamp.split("/"); // tbh no clue if this is shown
            }

            dd = parseInt(dd);
            mm = parseInt(mm) - 1; // 0-based
            yyyy = parseInt(yyyy);

            date = new Date(yyyy, mm, dd);
        } else if (timestamp.indexOf(":") !== -1) { // today
            date = todaysDate; // it's in time format (bc received today), change to todays date
        } else {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            let [mon, dd] = timestamp.split(" ");
            let monthIndex = months.indexOf(mon); // 0-based
            let day = parseInt(dd);

            date = new Date(todaysDate.getFullYear(), monthIndex, day);
        }

        // since we cant use Dates as index bc they are objects
        const YYYYMMDD = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        if (!receivedDatesToElement[YYYYMMDD]) { // save only first element of this date
            receivedDatesToElement[YYYYMMDD] = elem;
        }
        return date;
    });
    clog("receivedDates", receivedDates);

    const weekFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let lastDateAdded;
    for (let i = 0; i < receivedDates.length; i++) {
        let date = receivedDates[i];

        if (lastDateAdded && date.getTime() === lastDateAdded.getTime()) { // alr added
            continue;
        }

        let label = "";

        const timeDiff = todaysDate.getTime() - date.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

        if (daysDiff === 0) {
            label = "Today";
        } else if (daysDiff === 1) {
            label = "Yesterday";
        } else if (daysDiff >= 2 && daysDiff <= 6) {
            label = weekFull.at(todaysDayIndex - daysDiff); // may have neg vals
        } else if (daysDiff >= 7 && daysDiff < 14) {
            label = "Last week";
        } else {
            continue;
        }

        lastDateAdded = date;

        // add label
        const tr = document.createElement("tr");
        tr.className = "H_0 i_0 email-received-label";

        const td = document.createElement("td");
        td.className = "H_0 i_0";
        td.style = "line-height: 2;";
        td.setAttribute("colspan", "8");

        const p = document.createElement("p");
        p.style = "font-weight: bold; margin-top: 3px;";
        p.innerHTML = label;

        td.append(p);
        tr.append(td);
        
        const YYYYMMDD = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const elem = receivedDatesToElement[YYYYMMDD];
        elem.parentNode.insertBefore(tr, elem);

        if (label === "Last week") { // stop after this label added once
            return;
        }

        clog("label added", label);
    }
}

function alert(message) {
    window.alert(message);
}

async function backToOldUI() {
    // from new UI > basic UI > /d/ settings link > back to inbox
    if (location.href.startsWith("https://mail.yahoo.com/n/")) { // from new UI to basic UI
        const optoutBaseLink = "https://mail.yahoo.com/d/optout?crumb=";
        const crumb = getCrumb();
        const optoutLink = optoutBaseLink + crumb;
        window.location.replace(optoutLink);
    } else if (location.href.startsWith("https://mail.yahoo.com/b/")) { // from basic to /d/
        window.location.replace("https://mail.yahoo.com/d/settings/1");
    } else if (location.href.startsWith("https://mail.yahoo.com/d/settings/")) { // from /d/ settings to press back
        const backButton = await waitForElement(".P_2jztU.D_F.F_n");
        backButton.click();
    }

    /** 
     * where crumb is given as: \"crumb\":\"sAOaMa3ktnl\"
     * in a script[nonce] element
    */
    function getCrumb() {
        const allScriptNonceElems = Array.from(document.querySelectorAll("script[nonce]"));
        const stringToLook = '"crumb":"';
        let indexStart;
        let text;
        const scriptNonce = allScriptNonceElems.find((elem) => {
            text = elem.textContent;
            indexStart = text.indexOf(stringToLook);
            
            if (indexStart != -1) {
                return true;
            }
        });

        if (scriptNonce == undefined) {
            throw new Error("couldnt find crumb");
        }

        indexStart = indexStart + stringToLook.length; // ignore "crumb":"
        const indexEnd = text.indexOf("\"", indexStart + stringToLook.length);
        const crumb = text.substring(indexStart, indexEnd);

        return crumb;
    }
}

/*
async function stuffidk() {
    // let a "mailbox" be a given LI element under the UL element of class ".M_0.P_0.hd_n"
    mailboxesParentElement = document.querySelector(".M_0.P_0.hd_n"); // class "M_0 P_0 hd_n", ul element

    while (!mailboxesParentElement.isConnected) {
        mailboxesParentElement = await waitForElement(".M_0.P_0.hd_n", 400);
        clog("mailboxesParentElement1: timed out");
    }

    mailboxElementsArr = Array.from(mailboxesParentElement.children);

    // fill addressToMailboxElement
    mailboxElementsArr.forEach((mailbox) => {
        const address = mailbox.children[0].getAttribute("data-test-account-email");
        addressToMailboxElement[address] = mailbox;
    });

    // get saved data
    const storedObj = await chrome.storage.sync.get("addresses"); // obj
    const savedAddressOrderArr = storedObj && storedObj.addresses;
    clog("got stored data", savedAddressOrderArr);

    if (savedAddressOrderArr) { // if has stored order
        loadSavedOrder(savedAddressOrderArr);
    } else { // set new storage
        const addresses = Object.keys(addressToMailboxElement);
        chrome.storage.sync.set({"addresses": addresses});
        clog("set new, initial storage", addresses);
    }

    // set sort by unread
    const response = await chrome.storage.sync.get("sortByUnreadAlways");
    if (!response) {
        chrome.storage.sync.set({"sortByUnreadAlways": false}); // off by def
    } else if (response.sortByUnreadAlways) {
        window.addEventListener("locationchange", onLocationChange);
        setsortByUnreadAlways(); // on initial load
    }

    setListeners();
}

function loadSavedOrder(savedAddressOrderArr) {
    // load sort
    clog("sorting with savedAddressOrderArr", savedAddressOrderArr);
    savedAddressOrderArr.forEach((address) => {
        const mailboxElement = addressToMailboxElement[address];
        mailboxesParentElement.append(mailboxElement);
    });

    mailboxElementsArr = Array.from(mailboxesParentElement.children); // update changes
}

function onLocationChange() {
    // check if current page is a mailbox (eg not in a specific email or search). should be https://mail.yahoo.com/d/folders/[a number] ... nothing after
    const url = location.href;
    const rootUrl = "https://mail.yahoo.com/d/folders/";
    if (url.startsWith(rootUrl)) {
        const after = url.substring(rootUrl.length);
        if (after.includes("/")) { // mailbox page shouldnt have / after root
            return;
        }
        setsortByUnreadAlways();
    }
}

function setListeners() {
    chrome.runtime.onMessage.addListener(async (message, sender, sendRequest) => {
        if (message.task === "getAddresses") {
            sendRequest(Object.keys(addressToMailboxElement));
        } else if (message.task === "updateAddresses") {
            // storage already updated in App.jsx

            // active=from over=to
            const activeIndex = message.activeIndex;
            const overIndex = message.overIndex;
            
            // change
            clog("from, to", activeIndex, overIndex);

            while (!mailboxesParentElement.isConnected) { // make sure list element still connected
                mailboxesParentElement = await waitForElement(".M_0.P_0.hd_n", 1000);
                clog("mailboxesParentElement2: timed out");
            }

            if (activeIndex > overIndex) {
                mailboxesParentElement.insertBefore(mailboxElementsArr[activeIndex], mailboxElementsArr[overIndex]);
            } else {
                mailboxesParentElement.insertBefore(mailboxElementsArr[activeIndex], mailboxElementsArr[overIndex].nextSibling);
            }
        
            mailboxElementsArr = Array.from(mailboxesParentElement.children); // update
            clog("updated order", mailboxElementsArr);

        } else if (message.task === "sortByUnreadAlways") {
            if (message.sortByUnreadAlways) { // turned on
                window.addEventListener("locationchange", onLocationChange);
                setsortByUnreadAlways(); // set now
            } else {
                window.removeEventListener("locationchange", onLocationChange);
            }
        }
    });
}

async function setsortByUnreadAlways() {
    // click unread button after sortby is clicked (observer to wait for button to open)
    // start observing before clicking sortby
    clog("setting sort by unread...");
    const sortByButtonQuery = "button[data-test-id='toolbar-sort-menu-button']";
    let sortByButton = document.querySelector(sortByButtonQuery);
    if (sortByButton) { // if already loaded, sometimes not loaded if just exiting an email
        clog("got sortByButton", sortByButton);
        sortByButton.click();

        clickUnread();
    } else {
        clog("waiting for sortByButton");
        sortByButton = await waitForElement(sortByButtonQuery, 400);
        if (!sortByButton) {
            clog("sortByButton: timed out");
            setsortByUnreadAlways();
            return;
        }
        clog("got sortByButton");
        sortByButton.click();
        clickUnread();
    }

    async function clickUnread() {
        const unreadButtonQuery = "button[data-test-id='sort-by-unread']";
        let unreadButton = document.querySelector(unreadButtonQuery);

        if (unreadButton) {
            unreadButton.click();
        } else {
            clog("waiting for unreadButton");
            unreadButton = await waitForElement(unreadButtonQuery, 400);
            if (!unreadButton) {
                clog("unreadButton: timed out");
                setsortByUnreadAlways();
                return;
            }
            clog("got unreadButton");
            unreadButton.click();
        }
        clog("set by unread successfully");
    }
}
*/
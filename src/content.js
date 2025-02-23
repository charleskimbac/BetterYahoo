/* global waitForElement clog*/ // these are executed first in manifest, so are global everywhere


// "action": {
//     "default_popup": "dist/index.html"
// }

let mailboxesParentElement;
let mailboxElementsArr; // all children elems of mailboxesParentElement
const addressToMailboxElement = {}; // address: mailbox

// enums
const UI = Object.freeze({
    OLD:   Symbol("old"),
    NEW:  Symbol("new"),
    BASIC: Symbol("basic")
});

const Screen = Object.freeze({
    EMAIL_CONTENT:   Symbol("emailContent"),
    ALL_EMAILS:  Symbol("allEmails"),
    SETTINGS: Symbol("settings")
});

let settings;
let currentUI;
let currentScreen;
let maxHeightVH = 77; // this is changed if we remove bottom control bar

const defaultSettings = {
    sortByUnread: true,
    hideRightPanelAds: true,
    deleteBottomControlBar: true,
    makeEmailContentScrollable: true,
    makeMailboxSectionScrollable: true,
    applyBetterEmailHeaderSpacing: true,
    removeTopAdBanner: true,
    makeEmailsSectionScrollable: true,
    enlargeCheckboxes: true,
    addEmailDayLabels: true,
    backToOldUI: false
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
    if (currentUI === UI.BASIC) {
        if (isOnEmailContentPage()) { // must check this before isonallmailpage
            currentScreen = Screen.EMAIL_CONTENT;
            hideRightPanelAds();
            deleteBottomControlBar();
            makeEmailContentScrollable(1);
            makeMailboxSectionScrollable();
            applyBetterEmailHeaderSpacing();

        } else if (isOnAllEmailsPage()) {
            currentScreen = Screen.ALL_EMAILS;
            sortByUnread();
            deleteBottomControlBar();
            hideRightPanelAds();
            removeTopAdBanner();
            makeMailboxSectionScrollable();
            makeEmailsSectionScrollable();
            enlargeCheckboxes();
            changeBackgroundColor();

            // only add labels if not on sort unread
            if (!isOnUnreadSort()) {
                addEmailDayLabels();
            }
        }
    }
    
    //backToOldUI();
}

function changeBackgroundColor() {
    const table = document.querySelectorAll(".W_6D6F.H_6D6F.p_R.bo_BA")[3];
    table.style = "background-color:rgb(223, 223, 223);";

    // const td = document.querySelector(".V_GM.I_Z1sX2Gk.x_Z14vXdP.W_3rdfm");
    // td.style = "background-color: #e7e7e7;";
}

async function getSettings() {
    settings = chrome.storage.sync.get();
    
    if (!settings) {
        settings = defaultSettings;
        chrome.storage.sync.set(settings);
    }
}

function isOnUnreadSort() {
    const select = document.querySelector("select[name='sort_option[top]'");
    // where 3 means unread selected rn; we cant check url.includes("sortOrder=unread") bc link only updates 
    // if apply is pressed twice consecutively, ie if user going from unread to else, we will fail to check correctly
    return select.selectedIndex === 3;
}

function sortByUnread() {
    const select = document.querySelector("select[name='sort_option[top]'");

    if (isOnUnreadSort()) {
        clog("sorted by unread", true);
        return;
    }

    select.selectedIndex = 3;

    // submit
    const applyButton = select.parentNode.children[1];
    applyButton.click();
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

function hideRightPanelAds() {
    const td = document.querySelector(".V_GM.I_Z1sX2Gk.n_Z14vXdP");
    td.style = "visibility: hidden;";
}

function removeRightPanelAds() {
    const td = document.querySelector(".V_GM.I_Z1sX2Gk.n_Z14vXdP");
    td.remove();
}

function isOnEmailContentPage() { // must be checked before isonallmailpage
    const url = location.href;
    if (url.indexOf("/messages/") !== -1) {
        return true;
    }
    return false;
}

function deleteBottomControlBar() {
    maxHeightVH += 5; // size of control bar to add
    const div = document.querySelector(".D_B.P_1Eu6qC.z_2wc7QY");
    div.remove();
}

function isOnAllEmailsPage() {
    const url = location.href;
    if (url.startsWith("https://mail.yahoo.com/b/folders/") ||
        url.startsWith("https://mail.yahoo.com/b/?") ||
        url === "https://mail.yahoo.com/b/") {
            return true;
    }
    
    return false;
}

// removes inbox, contacts, notepad, calendar tabs; this also removes "switch to standard version" button!
// since this pushes everything up, theres white space at the bottom now we need to chagne the maxheight props below if this is enabled. do this latatatatatatatata!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function deleteSmallNavBar() {
    const td = document.querySelector(".V_GM.o_h.I_Z26KQwA.q_ZS20W8");
    td.remove();
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
    const dateObj = new Date();
    const todaysDateDD = dateObj.getDate();
    const todaysMonth = dateObj.toLocaleString("default", { month: "short" });
    const todaysDayIndex = dateObj.getDay();

    const mailElems = Array.from(document.querySelectorAll("tr[data-test-id=message-list-item]"));

    const receivedDatesToElement = {};
    const receivedDates = mailElems.map((elem) => { // MM DD
        const td = elem.children[6];
        const a = td.children[0];
        const span = a.children[0];
        let date = span.innerHTML;

        if (date.includes(":")) {
            date = todaysMonth + " " + todaysDateDD; // it's in time format (bc received today), change to todays date
        }

        if (!receivedDatesToElement[date]) { // only first element for where label to put before
            receivedDatesToElement[date] = elem;
        }
        return date;
    });
    clog("receivedDates", receivedDates);

    const weekFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // if recieved this year, date is Mon dd
    // if recieved last year, date is mm/dd/yyyy, but we're not supporting this
    let lastDate = "";
    for (let i = 0; i < receivedDates.length; i++) {
        let date = receivedDates[i];

        if (date.includes(":")) { // date in time format eg 2:00 AM = recieved today
            date = todaysMonth + " " + todaysDateDD;
        }

        if (date === lastDate) {
            continue;
        }

        if (date.includes("/")) { // check if in mm/dd/yyyy format
            continue;
        }

        let label = "";

        const dateMonth = date.substring(0, 3);
        const dateDD = date.substring(4, date.length);

        if (dateMonth === todaysMonth) { // same month
            const diff = todaysDateDD - dateDD;

            if (diff === 0) {
                label = "Today";
            } else if (diff === 1) {
                label = "Yesterday";
            } else if (diff >= 2 && diff <= 6) {
                label = weekFull[todaysDayIndex - diff];
            } else if (diff >= 7 && diff < 14) {
                label = "Last week";
            }
        } else {
            continue; // dont handle not same month tags ig
        }
        lastDate = date;

        // add labels
        // make elems
        const tr = document.createElement("tr");
        tr.className = "H_0 i_0";

        const td = document.createElement("td");
        td.className = "H_0 i_0";
        td.style = "line-height: 2;";
        td.setAttribute("colspan", "8");

        const p = document.createElement("p");
        p.style = "font-weight: bold;";
        p.innerHTML = label;

        // appends
        td.append(p);
        tr.append(td);
        const elem = receivedDatesToElement[date];
        elem.parentNode.insertBefore(tr, elem);

        if (label === "Last week") { // stop after this label added once
            return;
        }

        clog("label added", label);
    }
}

function removeTopAdBanner() {
    const div = document.querySelector("div[data-test-id=pencil-ad]");
    div.remove();
}

function alert(message) {
    window.alert(message);
}

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
    const response = await chrome.storage.sync.get("sortByUnread");
    if (!response) {
        chrome.storage.sync.set({"sortByUnread": false}); // off by def
    } else if (response.sortByUnread) {
        window.addEventListener("locationchange", onLocationChange);
        setSortByUnread(); // on initial load
    }

    setListeners();
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
        currentUI = UI.OLD;
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
        setSortByUnread();
    }
}

function isOnNewUI() {
    return location.href.includes("/n/"); // new UI format: "mail.yahoo.com/n/folders/[mailboxNumber]"; old: "mail.yahoo.com/d/folders/[mailboxNumber]"
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

        } else if (message.task === "sortByUnread") {
            if (message.sortByUnread) { // turned on
                window.addEventListener("locationchange", onLocationChange);
                setSortByUnread(); // set now
            } else {
                window.removeEventListener("locationchange", onLocationChange);
            }
        }
    });
}

async function setSortByUnread() {
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
            setSortByUnread();
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
                setSortByUnread();
                return;
            }
            clog("got unreadButton");
            unreadButton.click();
        }
        clog("set by unread successfully");
    }
}
/* global waitForElement clog*/ // these are executed first in manifest, so are global everywhere

let mailboxesParentElement;
let mailboxElementsArr; // all children elems of mailboxesParentElement
const addressToMailboxElement = {}; // address: mailbox

// for some reason (or to the best of my troubleshooting), yahoo reloads/replaces elements from 
// before the page is not visible vs visible, and we need to make sure the elements we're using weren't replaced
// this is why we check isConnected and use waitForElement with a timeout later
if (document.visibilityState === "visible") {
    clog("called since visible");
    main();
} else {
    document.addEventListener("visibilitychange", runMain);

    function runMain() {
        clog("called by visibility change");
        main();
        document.removeEventListener("visibilitychange", runMain);
    }
}

async function main() {
    const onNewUI = isOnNewUI();
    if (onNewUI) {
        window.alert("Reorder Yahoo Mailboxes will not work if you are using the new Yahoo Mail. Please go back to the old Yahoo Mail by pressing the button at the top right of the page.");
        return;
    }

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
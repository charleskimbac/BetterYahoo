/* global waitForElement */

let mailboxesParentElement;
let mailboxElementsArr;
const addressToMailboxElement = {}; // address: mailbox

(async () => {
    try {
        await main();
    } catch (error) {
        console.log(error);
        alert(error);
    }
})();
async function main() {
    // for testing
    // chrome.storage.sync.remove("addresses");
    chrome.storage.sync.set({"addresses": ["charleskimbac@yahoo.com", "baccharleskim@gmail.com"]});
    // -----------

    const onNewUI = isOnNewUI();
    if (onNewUI) {
        window.alert("Reorder Yahoo Mailboxes will not work if you are using the new Yahoo Mail. Please go back to the old Yahoo Mail by pressing the button at the top right of the page.");
        return;
    }

    // let a "mailbox" be a given LI element under the UL element of class ".M_0.P_0.hd_n"
    mailboxesParentElement = document.querySelectorAll(".M_0.P_0.hd_n")[0]; // first of class "M_0 P_0 hd_n", ul element
    mailboxElementsArr = Array.from(mailboxesParentElement.children);

    // fill addressToMailboxElement
    mailboxElementsArr.forEach((mailbox) => {
        const address = mailbox.children[0].getAttribute("data-test-account-email");
        addressToMailboxElement[address] = mailbox;
    });

    // get saved data
    const storedObj = await chrome.storage.sync.get("addresses"); // obj
    const savedAddressOrderArr = storedObj && storedObj.addresses;
    console.log("RYM - got stored data:", savedAddressOrderArr);

    if (savedAddressOrderArr) { // if has stored order
        loadSavedOrder(savedAddressOrderArr);
    } else { // set new storage
        const addresses = Object.keys(addressToMailboxElement);
        chrome.storage.sync.set({"addresses": addresses});
        console.log("RYM - set new, initial storage:", addresses);
    }

    // set sort by unread
    const response = await storageSyncGet("sortByUnread");
    if (!response) {
        chrome.storage.sync.set({"sortByUnread": false});
    } else if (response.sortByUnread) {
        window.addEventListener("locationchange", onLocationChange);
        setSortByUnread(); // on initial load
    }
    setListeners();
}

function loadSavedOrder(savedAddressOrderArr) {
    // check if new mailboxes added, not accounted for
    // NEED TO REDO THIS PART!!! CHECK IF MAILBOXES HAVE BEEN REMOVED / ADDED !!!!!!!!!!!!!!!!!!!!!!!!
    const numNewMailboxes = mailboxElementsArr.length - savedAddressOrderArr.length;
    console.log("RYM - number of all mailboxes:", mailboxElementsArr.length);
    console.log("RYM - number of new mailboxes:", numNewMailboxes);
    if (numNewMailboxes > 0) {
        const newMailboxElementsArr = mailboxElementsArr.slice(mailboxElementsArr.length - numNewMailboxes + 1, mailboxElementsArr.length);

        newMailboxElementsArr.forEach((element) => {
            const address = element.children[0].getAttribute("data-test-account-email");
            savedAddressOrderArr.push(address);
            clog("added to storage", address, element);
        });

        chrome.storage.sync.set({"addresses": savedAddressOrderArr});
    }

    // load sort
    console.log("RYM - sorting with savedAddressOrderArr:", savedAddressOrderArr);
    savedAddressOrderArr.forEach((address) => {
        const mailboxElement = addressToMailboxElement[address];
        mailboxesParentElement.appendChild(mailboxElement);
    });

    mailboxElementsArr = Array.from(mailboxesParentElement.children); // update changes
}

function onLocationChange() {
    // check if current page is a mailbox (eg not in a specific email or search). eg: https://mail.yahoo.com/d/folders/[a number] ... nothing after
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
    chrome.runtime.onMessage.addListener((message, sender, sendRequest) => {
        if (message.task === "getAddresses") {
            sendRequest(Object.keys(addressToMailboxElement));
            // console.log("RYM-sent:", addressToMailboxElement);
        } else if (message.task === "updateAddresses") {
            // active=from over=to
            const activeIndex = message.activeIndex;
            const overIndex = message.overIndex;
            
            if (activeIndex > overIndex) {
                mailboxesParentElement.insertBefore(mailboxElementsArr[activeIndex], mailboxElementsArr[overIndex]);
            } else {
                mailboxesParentElement.insertBefore(mailboxElementsArr[activeIndex], mailboxElementsArr[overIndex].nextSibling);
            }
        
            mailboxElementsArr = Array.from(mailboxesParentElement.children); // update changes
            chrome.storage.sync.set({"addresses": mailboxElementsArr});
        } else if (message.task === "sortByUnread") {
            if (message.sortByUnread) { // turned on
                window.addEventListener("locationchange", onLocationChange);
                setSortByUnread(); // set now
            } else {
                window.removeEventListener("locationchange", onLocationChange);
            }
        } else {
            throw new Error("Unknown task");
        }
    });
}

async function setSortByUnread() {
    // click unread button after sortby is clicked (observer to wait for button to open)
    // start observing before clicking sortby
    console.log("RYM-setSortByUnread");
    const sortByButtonQuery = "button[data-test-id='toolbar-sort-menu-button']";
    let sortByButton = document.querySelector(sortByButtonQuery);
    if (sortByButton) { // if already loaded, sometimes not loaded if just exiting an email
        sortByButton.click();
        clickUnread();
    } else {
        sortByButton = await waitForElement(sortByButtonQuery);
        sortByButton.click();
        clickUnread();
    }

    async function clickUnread() {
        const unreadButtonQuery = "button[data-test-id='sort-by-unread']";
        let unreadButton = document.querySelector(unreadButtonQuery);

        if (unreadButton) {
            unreadButton.click();
        } else {
            unreadButton = await waitForElement(unreadButtonQuery);
            unreadButton.click();
        }
    }
}

// from FirefoxMV2WebAPIChromeNamespace.js
// keys = string or string[]
// no stored data found: in chrome- returns empty object; in FF- returns undefined
// BUT here, null will be returned if no stored data found
async function storageSyncGet(keys) {
    return new Promise((resolve) => {
        chrome.storage.sync.get(keys, (response) => {
            if (response === undefined || Object.keys(response).length === 0) {
                resolve(null);
            } else {
                resolve(response);
            }
        });
    });
}

function clog(purpose, ...values) {
    console.log("[RYM]", purpose, "-", ...values);
}
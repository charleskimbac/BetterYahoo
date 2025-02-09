/* global waitForElement clog*/ // these are executed first in manifest, so are global everywhere

let mailboxesParentElement;
let mailboxElementsArr; // all children elems of mailboxesParentElement
const addressToMailboxElement = {}; // address: mailbox
let alreadyRun = false;
let sorted = false;

// (async () => {
//     try {
//         window.addEventListener("load", main);
//         if (document.readyState == "complete") {
//             await main();
//         }
//     } catch (error) {
//         alert(error);
//         clog("ERROR!", error);
//     }
// })();
main();

async function main() {
    clog(document.readyState, window.location);
    if (alreadyRun) {
        return;
    }
    alreadyRun = true;
    window.removeEventListener("load", main);

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
        chrome.storage.sync.set({"sortByUnread": false});
    } else if (response.sortByUnread) {
        window.addEventListener("locationchange", onLocationChange);
        setSortByUnread(); // on initial load
    }

    document.addEventListener("visibilitychange", () => {
        clog("sorted?", sorted);
        console.log("WHAAA");
    });
    setListeners();
}

function loadSavedOrder(savedAddressOrderArr) {
    // check if new mailboxes added, not accounted for
    // NEED TO REDO THIS PART!!! CHECK IF MAILBOXES HAVE BEEN REMOVED / ADDED !!!!!!!!!!!!!!!!!!!!!!!!
    

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
    chrome.runtime.onMessage.addListener((message, sender, sendRequest) => {
        if (message.task === "getAddresses") {
            sendRequest(Object.keys(addressToMailboxElement));
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

            // storage updated in App.jsx
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

/*
for some reason when you open a new Yahoo tab and you immediately switch to a different tab before the Yahoo tab finishes loading, the sortByButton can be queried and stored but not pressed. i think the button is like removed and replaced, idk why (i've spent/wasted days on this bug). so we have to run this on tab active status change
*/
async function setSortByUnread() {
    // click unread button after sortby is clicked (observer to wait for button to open)
    // start observing before clicking sortby
    clog("setting sort by unread...");
    const sortByButtonQuery = "button[data-test-id='toolbar-sort-menu-button']";
    let sortByButton = document.querySelector(sortByButtonQuery);
    clog(sortByButton.isConnected);
    if (sortByButton) { // if already loaded, sometimes not loaded if just exiting an email
        clog("got sortByButton", sortByButton);
        sortByButton.click();
        clickUnread();
    } else {
        clog("waiting for sortByButton");
        sortByButton = await waitForElement(sortByButtonQuery);
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
            unreadButton = await waitForElement(unreadButtonQuery);
            clog("got unreadButton");
            unreadButton.click();

            //setSortByUnread();
        }
        sorted = true;
        clog("set by unread successfully");
    }
}
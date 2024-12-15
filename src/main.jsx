import { React } from 'react';
import ReactDOM from 'react-dom/client';
import App from './popup/App.jsx';
import "bootstrap/dist/css/bootstrap.min.css";
import { tabsSendMessage, tabsQuery, storageSyncGet } from "../firefox/FirefoxMV2WebAPIChromeNamespace.js";

const root = ReactDOM.createRoot(document.getElementById("root"));
let warning = ""; // to show with <App>. wrap warning in <></>

async function main() {
    const [tabIDs, activeTabIDs, tabURLs] = await getTabsData();

    let addresses = await getAddresses(tabIDs, activeTabIDs);

    const response1 = await storageSyncGet("sortByUnread");
    const sortByUnread = response1.sortByUnread;

    setWarningIfOnNewUI(tabURLs);

    // console.log("main", addresses);
    root.render(
        <App initialAddresses={addresses} initialSortByUnread={sortByUnread} tabIDs={tabIDs} warning={warning} /> // pass all IDs so all tabs can be updated
    );
}
main();

function setWarningIfOnNewUI(tabURLs) {
    for (let i = 0; i < tabURLs.length; i++) {
        const url = tabURLs[i];
        if (url.includes("/n/")) { // new UI format: "mail.yahoo.com/n/folders/[mailboxNumber]"; old: "mail.yahoo.com/d/folders/[mailboxNumber]"
            warning = <>Reorder Yahoo Mailboxes will not work if you are using the new Yahoo Mail. Please go back to the old Yahoo Mail.</>;
                /*<br/>
                <button onClick={() => optOutNewUI(tabIDs)}>Opt out</button>*/
            break;
        }
    }
}

/*
function optOutNewUI(tabIDs) {
    tabIDs.forEach((tabID) => {
        tabsSendMessage(tabID, {"task": "optOutNewUI"});
    });
}
*/

// we just use tabIDs[0]
async function getAddresses(tabIDs, activeTabIDs) {
    const response = await storageSyncGet("addresses"); // an array
    // console.log(response);

    if (!response) { // if storage empty
        // console.log("no addresses");
        if (tabIDs.length == 0) { // no yahoo tabs open
            showError("Please open a new Yahoo Mail tab and/or try again.");
        } else if (tabIDs.length > 1) { // multiple yahoo tabs open
            warning = <>If a recently added mailbox is not shown, please close all other Yahoo Mail tabs, reset order, and try again.</>;
        }

        let tabID = tabIDs[0];
        if (activeTabIDs.length > 0) { // use active tab (focused tab in a window) if avail
            tabID = activeTabIDs[0]; 
        }
        return await getAddressesFromPage(tabID);
    } else {
        return response.addresses;
    }
}

function showError(error) {
    root.render(
        <p class="m-2" style={{"width": "70%", "position": "relative", "left": "13%"}}>{error}</p>
    );
    throw new Error(error); // stop
}

async function getAddressesFromPage(tabID) {
    console.log("getAddressesFromPage");

    let addresses = null;
    try {
        addresses = await tabsSendMessage(tabID, {"task": "getAddresses"}, true);
    } catch (error) { // content script not loaded
        showError("Please open a new Yahoo Mail tab and/or try again.");
    }

    if (!addresses) { // tab not loaded
        showError("Please open a new Yahoo Mail tab and/or try again.");
    }
    
    return addresses;
}

// returns null if no tabs
async function getTabsData() {
    let tabs = await tabsQuery({url: "https://mail.yahoo.com/*"});
    // console.log(tabs);

    const activeTabIDs = [];
    const tabIDs = [];
    const tabURLs = [];
    tabs.forEach((tab) => {
        if (tab.active) {
            activeTabIDs.push(tab.id);
        }
        tabIDs.push(tab.id);
        tabURLs.push(tab.url);
    });

    return [tabIDs, activeTabIDs, tabURLs];
}
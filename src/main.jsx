import { React } from 'react';
import ReactDOM from 'react-dom/client';
import App from './popup/App.jsx';
import "bootstrap/dist/css/bootstrap.min.css";
import { tabsQuery, storageSyncGet } from "../firefox/FirefoxMV2WebAPIChromeNamespace.js";

const root = ReactDOM.createRoot(document.getElementById("root"));
let warning = ""; // to show with <App>. wrap warning in <></>

async function main() {
    const [tabIDs, activeTabIDs, tabURLs] = await getTabsData();

    let addresses = await getAddresses(tabIDs, activeTabIDs);
    console.log("RYM - addresses:", addresses);

    const response1 = await storageSyncGet("sortByUnread");
    const sortByUnread = response1.sortByUnread;

    setWarningIfOnNewUI(tabURLs);

    root.render(
        <App initialAddresses={addresses} initialSortByUnread={sortByUnread} tabIDs={tabIDs} warning={warning} /> // pass all IDs so all tabs can be updated
    );
}
main();

function setWarningIfOnNewUI(tabURLs) {
    for (let i = 0; i < tabURLs.length; i++) {
        const url = tabURLs[i];
        if (url.includes("/n/")) { // new UI format: "mail.yahoo.com/n/folders/[mailboxNumber]"; old: "mail.yahoo.com/d/folders/[mailboxNumber]"
            warning = <>Reorder Yahoo Mailboxes will not work if you are using the new Yahoo Mail. Please go back to the old Yahoo Mail by pressing the button at the top right of the page.</>;
                /*<br/>
                <button onClick={() => optOutNewUI(tabIDs)}>Opt out</button>*/
            break;
        }
    }
}

// we just use tabIDs[0]
async function getAddresses() {
    const response = await chrome.storage.sync.get("addresses");
    console.log(response);

    if (!response) { // if storage empty
        showError("Please open a new Yahoo Mail tab and/or try again.");
    } else {
        return response.addresses;
    }
}

function showError(error) {
    root.render(
        <p className="m-2" style={{"width": "70%", "position": "relative", "left": "13%"}}>{error}</p>
    );
    throw new Error(error); // stop
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
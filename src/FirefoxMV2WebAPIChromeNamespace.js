/*  UX for MV3 extensions in Firefox is not great if your extensions needs permissions (users need to manually enable permissions and crucial permissions needed can be disabled).
    Therefore, MV2 is used for Firefox. MV3 must be used for Chrome. 
    However, Promise returns in the WebAPI in Firefox with the chrome namespace (to only write code once/prevent needing to check if the browser is Firefox) are only supported in MV3, 
    so this file will hold bridge functions to allow for this.
*/

// send message to content script
async function tabsSendMessage(tabID, message, responseNeeded) {
    if (responseNeeded) {
        return new Promise(resolve => {
            chrome.tabs.sendMessage(tabID, message, undefined, (response) => {
                resolve(response);
            });
        });
    } else {
        chrome.tabs.sendMessage(tabID, message);
    }
}

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

// {} = all tabs
async function tabsQuery(queryInfo) {
    return new Promise(resolve => {
        chrome.tabs.query(queryInfo, (tabs) => {
            resolve(tabs);
        });
    });
}

// {} = all tabs
async function tabsGet(tabID) {
    return new Promise(resolve => {
        chrome.tabs.get(tabID, (tab) => {
            resolve(tab);
        });
    });
}

export { tabsSendMessage, storageSyncGet, tabsQuery, tabsGet };
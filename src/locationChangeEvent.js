/* 
    from https://github.com/charleskimbac/common-files

    whenever url changes, send "locationchange" event
    
    add '"world": "MAIN"' in the content_script key in manifest. this is to access the "history" world object.
*/

(() => {
    const oldPushState = history.pushState;
    history.pushState = function(...args) {
        const ret = oldPushState.apply(this, args);
        window.dispatchEvent(new Event("locationchange"));
        return ret;
    };

    const oldReplaceState = history.replaceState;
    history.replaceState = function(...args) {
        const ret = oldReplaceState.apply(this, args);
        window.dispatchEvent(new Event("locationchange"));
        return ret;
    };

    if (!window._locationChangeListenerAttached) {
        window.addEventListener("popstate", () => {
            window.dispatchEvent(new Event("locationchange"));
        });
        window._locationChangeListenerAttached = true;
    }
})();
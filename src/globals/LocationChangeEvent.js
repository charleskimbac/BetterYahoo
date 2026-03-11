/*  v2025.2.9 from https://github.com/charleskimbac/common-files
    whenever url changes, send "locationchange" event.
    
    add `"world": "MAIN"` in the content_script key in manifest.json. this is to access the "history" world object.
*/

(() => {
    let lastHref = window.location.href;

    function dispatchIfHrefChanged() {
        const currentHref = window.location.href;
        if (currentHref !== lastHref) {
            lastHref = currentHref;
            window.dispatchEvent(new Event("locationchange"));
        }
    }

    const oldPushState = history.pushState;
    history.pushState = function(...args) {
        const old = oldPushState.apply(this, args);
        dispatchIfHrefChanged();
        return old;
    };

    const oldReplaceState = history.replaceState;
    history.replaceState = function(...args) {
        const old = oldReplaceState.apply(this, args);
        dispatchIfHrefChanged();
        return old;
    };

    if (!window._locationChangeListenerAttached) {
        window.addEventListener("popstate", () => {
            dispatchIfHrefChanged();
        });

        window.addEventListener("hashchange", () => {
            dispatchIfHrefChanged();
        });

        window._locationChangeListenerAttached = true;
    }
})();
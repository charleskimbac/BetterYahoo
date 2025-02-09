/* eslint-disable no-unused-vars */

/*
    from https://github.com/charleskimbac/common-files

    wait for an element to appear in the DOM, or return it if already present. 

    selector: query selector string
    timeoutDuration: time (ms) until function will timeout and return null
    parent (default: document.body): Node to watch

    this is run first in the manifest, so just call the function as needed, no imports needed
*/
async function waitForElement(selector, timeoutDuration, parent = document.body) {
    const element = parent.querySelector(selector);
    if (element) {
        return element;
    }

    return new Promise((resolve) => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(() => {
                const element = parent.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });
        });
        observer.observe(parent, {childList: true, subtree: true});

        if (timeoutDuration) {
            setTimeout(() => {
                observer.disconnect();
                resolve(null);
            }, timeoutDuration);
        }
    });
}
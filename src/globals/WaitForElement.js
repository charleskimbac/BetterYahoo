/* eslint-disable no-unused-vars */

/*  v2025.3.9 from https://github.com/charleskimbac/common-files
    wait for an element to appear in the DOM, or return it if already present. 

    selector: query selector string
    timeoutDuration: time (ms) until function will timeout and return null
    parent: Node to watch (default: document.body)
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

export default waitForElement;
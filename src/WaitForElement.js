// wait for an element to appear in the DOM, or return it if already present. 
// selector: query string, parent: Node to watch
async function waitForElement(selector, parent) {
    if (!parent) {
        parent = document.body;
    }

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
    });
}

export default waitForElement;
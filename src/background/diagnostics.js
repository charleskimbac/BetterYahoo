// A single writer keeps logs from different tabs from overwriting each other.
let pending = Promise.resolve();
const LOG_KEY = 'diagnosticLogs';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!['BY_LOG', 'BY_LOG_EXPORT', 'BY_LOG_CLEAR'].includes(message?.type)) return;

    pending = pending.then(async () => {
        if (message.type === 'BY_LOG_CLEAR') {
            await chrome.storage.local.set({ [LOG_KEY]: [] });
        } else {
            const stored = await chrome.storage.local.get(LOG_KEY);
            const entries = stored[LOG_KEY] || [];
            if (message.type === 'BY_LOG_EXPORT') {
                sendResponse({ ok: true, entries });
                return;
            }
            // Bound both entry count and entry size.
            if (!message.entry || JSON.stringify(message.entry).length > 4096) {
                sendResponse({ ok: false });
                return;
            }
            entries.push({ ...message.entry, tabId: sender.tab?.id ?? null });
            await chrome.storage.local.set({ [LOG_KEY]: entries.slice(-500) });
        }
        sendResponse({ ok: true });
    }).catch(() => {
        console.warn('[BY] Could not save diagnostic logs.');
        sendResponse({ ok: false });
    });
    // Keep the message alive until storage is committed, including before redirects.
    return true;
});

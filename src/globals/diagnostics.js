(() => {
    const pageId = crypto.randomUUID();
    const version = chrome.runtime.getManifest().version;
    const settingNames = new Set([
        'backToOldUI', 'sortByUnreadAlwaysOldUI', 'removeComingSoonBar', 'oldHideAds',
        'sortByNewAlwaysNonInbox', 'sortByUnreadAlways', 'hideAds', 'enlargeCheckboxes',
        'addEmailDayLabels', 'useDarkTheme', 'autoConfirmSelections', 'deleteBottomControlBar',
        'makeEmailContentScrollable', 'makeMailboxSectionScrollable', 'applyBetterEmailHeaderSpacing',
        'makeEmailsSectionScrollable', 'showFullNewMailCircleIndicator'
    ]);

    /** Return only a known route, excluding folder IDs, queries, and fragments. */
    function route(href = location.href) {
        const url = new URL(href);
        if (url.hostname !== 'mail.yahoo.com') return 'extension';
        const match = url.pathname.match(/^\/(c\/)?(n|d|b)(?:\/(folders|messages|settings|search|compose|optout)(?:\/|$)|\/?$)/);
        return match ? match[0].replace(/\/$/, '') || '/' : '/unknown';
    }

    function settings(values) {
        return Object.fromEntries(Object.entries(values).filter(([key, value]) => settingNames.has(key) && typeof value === 'boolean'));
    }

    async function log(event, details = {}) {
        let timeout;
        try {
            const response = await Promise.race([
                chrome.runtime.sendMessage({ type: 'BY_LOG', entry: {
                    time: new Date().toISOString(), version, pageId, route: route(), event, ...details
                } }),
                new Promise(resolve => { timeout = setTimeout(() => resolve(null), 1000); })
            ]);
            if (!response?.ok) throw new Error('Log not saved');
            return true;
        } catch {
            console.warn('[BY] Diagnostic logging unavailable.');
            return false;
        } finally {
            clearTimeout(timeout);
        }
    }

    /** Record error type and extension source locations without arbitrary error text. */
    function error(error, source) {
        const name = ['Error', 'TypeError', 'ReferenceError', 'SyntaxError', 'RangeError', 'SecurityError'].includes(error?.name) ? error.name : 'Error';
        const frames = String(error?.stack || '').split('\n').filter(line => line.includes(chrome.runtime.getURL('')))
            .map(line => line.match(/(?:src|assets)\/[\w./-]+:\d+(?::\d+)?/)?.[0]).filter(Boolean).slice(0, 6);
        return log('extension-error', { source, name, frames });
    }

    globalThis.BYDiagnostics = { log, route, settings, error };
    window.addEventListener('error', event => {
        if (event.filename?.startsWith(chrome.runtime.getURL(''))) error(event.error, 'uncaught');
    });
    window.addEventListener('unhandledrejection', event => {
        if (String(event.reason?.stack || '').includes(chrome.runtime.getURL(''))) error(event.reason, 'unhandled-rejection');
    });
    window.addEventListener('locationchange', () => { void log('location-change'); });
    void log('page-start');
})();

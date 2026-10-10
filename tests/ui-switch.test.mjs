import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setImmediate } from 'node:timers/promises';
import vm from 'node:vm';
import test from 'node:test';

const content = readFileSync(new URL('../src/content/content.js', import.meta.url), 'utf8');

async function loadPage(path, { enabled = true, crumb = 'test-crumb', backButton = true } = {}) {
    const redirects = [];
    const logs = [];
    const errors = [];
    let backClicks = 0;
    const location = {
        href: 'https://mail.yahoo.com' + path,
        pathname: new URL('https://mail.yahoo.com' + path).pathname,
        replace: target => redirects.push(target),
    };
    const context = vm.createContext({
        location,
        chrome: { storage: { sync: {
            get: async () => ({
                backToOldUI: enabled,
                sortByUnreadAlwaysOldUI: false,
                removeComingSoonBar: false,
                oldHideAds: false,
                sortByNewAlwaysNonInbox: false,
            }),
        } } },
        document: {
            querySelector: () => null,
            querySelectorAll: selector => selector === 'script[nonce]'
                ? (crumb === null ? [] : [{ textContent: JSON.stringify({ crumb, next: 'other-value' }) }]) : [],
        },
        waitForElement: async () => backButton ? { click: () => backClicks++ } : null,
        clog: () => {},
        BYDiagnostics: {
            log: async (event, details) => logs.push({ event, ...details }),
            error: error => errors.push(error),
        },
    });
    context.window = context;
    vm.runInContext(content, context);
    await setImmediate();
    assert.deepEqual(errors.map(error => error.message), crumb === null ? ['couldnt find crumb'] : [],
        'content script should only report expected errors');
    return { redirects, logs, backClicks };
}

for (const prefix of ['', '/c']) {
    test(`switches ${prefix || 'standard'} routes through Basic and old UI`, async () => {
        const start = await loadPage(`${prefix}/n/folders/1`);
        assert.deepEqual(start.redirects, ['https://mail.yahoo.com/d/optout?crumb=test-crumb']);

        const basic = await loadPage(`${prefix}/b/folders/1`);
        assert.deepEqual(basic.redirects, [`https://mail.yahoo.com${prefix}/d/settings/1`]);

        const settings = await loadPage(`${prefix}/d/settings/1`);
        assert.equal(settings.backClicks, 1);
        assert.deepEqual(settings.redirects, []);

        const inbox = await loadPage(`${prefix}/d/folders/1`);
        assert.deepEqual(inbox.redirects, []);
        assert.equal(inbox.backClicks, 0);
    });

    test(`direct ${prefix}/b visits always attempt the switch`, async () => {
        for (let visit = 0; visit < 3; visit++) {
            const page = await loadPage(`${prefix}/b`);
            assert.deepEqual(page.redirects, [`https://mail.yahoo.com${prefix}/d/settings/1`]);
        }
    });
}

test('does not switch interfaces when the setting is disabled', async () => {
    for (const path of ['/b', '/c/b', '/n/folders/1', '/c/n/folders/1']) {
        const page = await loadPage(path, { enabled: false });
        assert.deepEqual(page.redirects, []);
    }
});

test('does not reload old settings when the back button is missing', async () => {
    const page = await loadPage('/c/d/settings/1', { backButton: false });
    assert.deepEqual(page.redirects, []);
    assert.equal(page.backClicks, 0);
    assert.ok(page.logs.some(log => log.event === 'settings-back-button-missing'));
});

test('reports a missing crumb without redirecting', async () => {
    const page = await loadPage('/c/n/folders/1', { crumb: null });
    assert.deepEqual(page.redirects, []);
});

test('preserves short crumbs and encodes reserved query characters', async () => {
    for (const crumb of ['x', 'a&b+c/=']) {
        const page = await loadPage('/c/n/folders/1', { crumb });
        const url = new URL(page.redirects[0]);
        assert.equal(url.searchParams.get('crumb'), crumb);
        assert.deepEqual([...url.searchParams.keys()], ['crumb']);
    }
});

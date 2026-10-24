import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setImmediate } from 'node:timers/promises';
import vm from 'node:vm';
import test from 'node:test';

const content = readFileSync(new URL('../src/content/content.js', import.meta.url), 'utf8');

function createState(enabled = true) {
    return {
        settings: {
            backToOldUI: enabled,
            sortByUnreadAlwaysOldUI: false,
            removeComingSoonBar: false,
            oldHideAds: false,
            sortByNewAlwaysNonInbox: false,
        },
        session: new Map(),
    };
}

async function loadPage(path, { enabled = true, crumb = 'test-crumb', backButton = true, backTarget = null, state = createState(enabled) } = {}) {
    const redirects = [];
    const logs = [];
    const errors = [];
    const listeners = new Set();
    let backClicks = 0;
    const location = {
        href: 'https://mail.yahoo.com' + path,
        pathname: new URL('https://mail.yahoo.com' + path).pathname,
        replace: target => redirects.push(target),
    };
    const navigate = target => {
        location.href = 'https://mail.yahoo.com' + target;
        location.pathname = new URL(location.href).pathname;
        for (const listener of listeners) listener();
    };
    const context = vm.createContext({
        location,
        addEventListener: (event, listener) => {
            if (event === 'locationchange') listeners.add(listener);
        },
        removeEventListener: (event, listener) => {
            if (event === 'locationchange') listeners.delete(listener);
        },
        sessionStorage: {
            getItem: key => state.session.get(key) ?? null,
            setItem: (key, value) => state.session.set(key, value),
            removeItem: key => state.session.delete(key),
        },
        chrome: { storage: { sync: {
            get: async () => structuredClone(state.settings),
            set: async values => Object.assign(state.settings, structuredClone(values)),
        } } },
        document: {
            querySelector: () => null,
            querySelectorAll: selector => selector === 'script[nonce]'
                ? (crumb === null ? [] : [{ textContent: JSON.stringify({ crumb, next: 'other-value' }) }]) : [],
        },
        waitForElement: async () => backButton ? { click: () => {
            backClicks++;
            if (backTarget) navigate(backTarget);
        } } : null,
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
    return { redirects, logs, backClicks, navigate };
}

for (const prefix of ['', '/c']) {
    test(`switches ${prefix || 'standard'} routes through Basic and old UI`, async () => {
        const state = createState();
        const start = await loadPage(`${prefix}/n/folders/1`, { state });
        assert.deepEqual(start.redirects, ['https://mail.yahoo.com/d/optout?crumb=test-crumb']);

        const basic = await loadPage(`${prefix}/b/folders/1`, { state });
        assert.deepEqual(basic.redirects, [`https://mail.yahoo.com${prefix}/d/settings/1`]);

        const settings = await loadPage(`${prefix}/d/settings/1`, { state });
        assert.equal(settings.backClicks, 1);
        assert.deepEqual(settings.redirects, []);

        const inbox = await loadPage(`${prefix}/d/folders/1`, { state });
        assert.deepEqual(inbox.redirects, []);
        assert.equal(inbox.backClicks, 0);
        assert.equal(state.settings.backToOldUI, true);
        assert.equal(state.session.size, 0);
    });

    test(`disables the option after three failed ${prefix}/b switches`, async () => {
        const state = createState();
        for (let visit = 0; visit < 3; visit++) {
            const page = await loadPage(`${prefix}/b`, { state });
            assert.deepEqual(page.redirects, [`https://mail.yahoo.com${prefix}/d/settings/1`]);
            assert.equal(state.settings.backToOldUI, true);
            assert.notEqual(state.settings.backToOldUIFailed, true);
        }
        for (let visit = 0; visit < 2; visit++) {
            const page = await loadPage(`${prefix}/b`, { state });
            assert.deepEqual(page.redirects, []);
            assert.equal(state.settings.backToOldUI, false);
            assert.equal(state.settings.backToOldUIFailed, true);
        }
    });

    test(`clears failures on a successful ${prefix || 'standard'} SPA return to inbox`, async () => {
        const state = createState();
        for (let visit = 0; visit < 3; visit++) await loadPage(`${prefix}/b`, { state });
        const page = await loadPage(`${prefix}/d/settings/1`, {
            state, backTarget: `${prefix}/d/folders/1`,
        });
        assert.equal(page.backClicks, 1);
        assert.equal(state.session.size, 0);
        assert.equal((await loadPage(`${prefix}/b`, { state })).redirects.length, 1);
        assert.equal(state.settings.backToOldUI, true);
    });

    test(`preserves pending retries until ${prefix || 'standard'} SPA navigation reaches inbox`, async () => {
        const state = createState();
        const page = await loadPage(`${prefix}/d/settings/1`, { state });
        const pending = state.session.get('betterYahoo.oldUISwitch');
        assert.ok(pending);
        for (const path of [`${prefix}/d/settings/2`, `${prefix}/n/folders/1`, `${prefix}/b/folders/1`]) {
            page.navigate(path);
            assert.equal(state.session.get('betterYahoo.oldUISwitch'), pending);
        }
        page.navigate(`${prefix}/d/folders/1`);
        assert.equal(state.session.size, 0);
    });
}

test('stops an optout loop after three failures', async () => {
    const state = createState();
    for (let attempt = 0; attempt < 3; attempt++) {
        const page = await loadPage('/n/folders/1', { state });
        assert.equal(page.redirects.length, 1);
    }
    const page = await loadPage('/n/folders/1', { state });
    assert.deepEqual(page.redirects, []);
    assert.equal(state.settings.backToOldUI, false);
});

test('counts complete failed flows rather than intermediate redirects', async () => {
    const state = createState();
    for (let attempt = 0; attempt < 3; attempt++) {
        assert.equal((await loadPage('/c/n/folders/1', { state })).redirects.length, 1);
        assert.equal((await loadPage('/c/b/folders/1', { state })).redirects.length, 1);
        assert.equal((await loadPage('/c/d/settings/1', { state })).backClicks, 1);
        assert.equal(state.settings.backToOldUI, true);
    }
    const page = await loadPage('/c/n/folders/1', { state });
    assert.deepEqual(page.redirects, []);
    assert.equal(state.settings.backToOldUI, false);
});

test('successful switches reset earlier failures', async () => {
    const state = createState();
    for (let visit = 0; visit < 3; visit++) await loadPage('/b', { state });
    await loadPage('/d/settings/1', { state });
    await loadPage('/d/folders/1', { state });
    assert.equal(state.session.size, 0);
    assert.equal((await loadPage('/b', { state })).redirects.length, 1);
    assert.equal(state.settings.backToOldUI, true);
});

test('can be manually enabled again after automatic disabling', async () => {
    const state = createState();
    for (let visit = 0; visit < 4; visit++) await loadPage('/b', { state });
    assert.equal(state.settings.backToOldUI, false);
    state.settings.backToOldUI = true;
    assert.equal((await loadPage('/b', { state })).redirects.length, 1);
});

test('stops clicking back after three failed settings returns', async () => {
    const state = createState();
    for (let attempt = 0; attempt < 3; attempt++) {
        assert.equal((await loadPage('/d/settings/1', { state })).backClicks, 1);
    }
    assert.equal((await loadPage('/d/settings/1', { state })).backClicks, 0);
    assert.equal(state.settings.backToOldUI, false);
});

test('turning the option off clears earlier failures', async () => {
    const state = createState();
    for (let visit = 0; visit < 3; visit++) await loadPage('/b', { state });
    state.settings.backToOldUI = false;
    await loadPage('/b', { state });
    assert.equal(state.session.size, 0);
    state.settings.backToOldUI = true;
    assert.equal((await loadPage('/b', { state })).redirects.length, 1);
});

for (const [path, options] of [
    ['/n/folders/1', { crumb: null }],
    ['/d/settings/1', { backButton: false }],
]) {
    test(`disables after three immediate failures on ${path}`, async () => {
        const state = createState();
        for (let attempt = 0; attempt < 3; attempt++) {
            const page = await loadPage(path, { ...options, state });
            assert.deepEqual(page.redirects, []);
            assert.equal(page.backClicks, 0);
            assert.equal(state.settings.backToOldUI, attempt < 2);
            assert.equal(state.settings.backToOldUIFailed === true, attempt === 2);
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

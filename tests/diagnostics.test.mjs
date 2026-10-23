import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setImmediate } from 'node:timers/promises';
import vm from 'node:vm';
import test from 'node:test';

const readSource = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

function loadDiagnostics(sendMessage) {
    const messages = [];
    const timers = new Map();
    let timerId = 0;
    const context = vm.createContext({
        crypto: { randomUUID: () => 'test-page' },
        URL,
        location: { href: 'https://mail.yahoo.com/c/n/messages/private-id?crumb=secret#private', pathname: '/c/n/messages/private-id' },
        sessionStorage: {
            getItem: () => null,
            setItem() {},
            removeItem() {},
        },
        console: { warn() {}, log() {} },
        setTimeout(callback, delay) {
            assert.equal(delay, 1000);
            timers.set(++timerId, callback);
            return timerId;
        },
        clearTimeout: id => timers.delete(id),
        chrome: { runtime: {
            getManifest: () => ({ version: '2.4.0' }),
            getURL: () => 'chrome-extension://test/',
            sendMessage: message => {
                messages.push(message);
                return sendMessage ? sendMessage(message) : Promise.resolve({ ok: true });
            },
        } },
    });
    context.window = context;
    context.addEventListener = () => {};
    vm.runInContext(readSource('src/globals/diagnostics.js'), context);
    return {
        context, messages, timers,
        expire() {
            const callbacks = [...timers.values()];
            timers.clear();
            callbacks.forEach(callback => callback());
        },
    };
}

test('sanitizes routes and persisted console values', async () => {
    const { context, messages, timers } = loadDiagnostics();
    const diagnostics = context.BYDiagnostics;
    for (const [href, expected] of [
        ['https://mail.yahoo.com/c/n/messages/private-id?crumb=secret#private', '/c/n/messages'],
        ['https://mail.yahoo.com/d/folders/private-folder', '/d/folders'],
        ['https://mail.yahoo.com/b/compose?to=private', '/b/compose'],
        ['https://mail.yahoo.com/unrecognized/private', '/unknown'],
        ['chrome-extension://test/dist/index.html', 'extension'],
    ]) {
        assert.equal(diagnostics.route(href), expected);
    }
    assert.equal(JSON.stringify(diagnostics.settings({ hideAds: true, useDarkTheme: 'secret', email: 'private' })), '{"hideAds":true}');
    // Both console wrappers must omit arbitrary values from saved entries.
    for (const path of ['src/globals/content-clog.js', 'src/globals/clog.js']) {
        const source = readSource(path).replace("import './diagnostics.js';", '').replace('export default clog;', '');
        vm.runInContext(`(() => { ${source}\nclog('settings', { hideAds: true, email: 'private' });\nclog('receivedDates', ['private-date']); })()`, context);
    }
    await setImmediate();
    assert.equal(messages.some(message => /private|secret/.test(JSON.stringify(message))), false);
    assert.equal(messages.filter(message => message.entry.settings?.hideAds === true).length, 2);
    assert.equal(timers.size, 0, 'completed writes release their timeout');
});

test('records error locations without arbitrary error text or page stack frames', async () => {
    const { context, messages } = loadDiagnostics();
    await context.BYDiagnostics.error({
        name: 'TypeError',
        stack: 'TypeError: private-email\n at feature (chrome-extension://test/src/content/content.js:10:2)\n at page (https://mail.yahoo.com/private:4:5)',
    }, 'content-main');
    const entry = messages.at(-1).entry;
    assert.equal(entry.name, 'TypeError');
    assert.equal(JSON.stringify(entry.frames), '["src/content/content.js:10:2"]');
    assert.equal(JSON.stringify(entry).includes('private'), false);
});

test('times out stalled writes and handles late rejection', async () => {
    const rejects = [];
    const { context, expire, timers } = loadDiagnostics(() => new Promise((resolve, reject) => rejects.push(reject)));
    const logged = context.BYDiagnostics.log('test');
    expire();
    assert.equal(await logged, false);
    rejects.forEach(reject => reject(new Error('late failure')));
    await setImmediate();
    assert.equal(timers.size, 0);
});

test('returns false for rejected or unsuccessful diagnostic writes', async () => {
    for (const sendMessage of [() => Promise.reject(new Error('unavailable')), () => Promise.resolve({ ok: false })]) {
        const { context, timers } = loadDiagnostics(sendMessage);
        assert.equal(await context.BYDiagnostics.log('test'), false);
        assert.equal(timers.size, 0);
    }
});

test('content startup and UI redirects continue when diagnostic writes stall', async () => {
    const { context, expire } = loadDiagnostics(() => new Promise(() => {}));
    const redirects = [];
    context.location.replace = target => redirects.push(target);
    context.chrome.storage = { sync: { get: async () => ({
        backToOldUI: true, sortByUnreadAlwaysOldUI: false, removeComingSoonBar: false,
        oldHideAds: false, sortByNewAlwaysNonInbox: false,
    }) } };
    context.document = {
        querySelector: () => null,
        querySelectorAll: () => [{ textContent: '{"crumb":"test-crumb"}' }],
    };
    context.clog = () => {};
    vm.runInContext(readSource('src/content/content.js'), context);
    expire();
    await setImmediate();
    expire();
    await setImmediate();
    assert.deepEqual(redirects, ['https://mail.yahoo.com/d/optout?crumb=test-crumb']);
});

test('persists safe retry counts while sorting', async () => {
    const { context, messages } = loadDiagnostics();
    context.chrome.storage = { sync: { get: async () => ({ backToOldUI: false }) } };
    context.document = { querySelector: () => ({ click() {} }), querySelectorAll: () => [] };
    context.clog = () => {};
    vm.runInContext(readSource('src/content/content.js'), context);
    await setImmediate();
    await vm.runInContext('setSortOldUI("button[data-test-id=sort-by-unread]", 3)', context);
    assert.equal(messages.find(message => message.entry.event === 'sort-attempt').entry.remainingAttempts, 3);
});

test('stylesheets record actual load outcomes and reference existing files', async () => {
    const { context, messages } = loadDiagnostics();
    const links = [];
    context.chrome.storage = { sync: { get: async () => ({ useDarkTheme: true, removeComingSoonBar: true, oldHideAds: true }) } };
    context.chrome.runtime.getURL = path => 'chrome-extension://test/' + path;
    context.document = {
        createElement: () => {
            const listeners = {};
            return { listeners, addEventListener: (event, callback) => { listeners[event] = callback; } };
        },
        documentElement: { append: link => links.push(link) },
    };
    context.clog = () => {};
    vm.runInContext(readSource('src/content/appendCSS.js'), context);
    await setImmediate();
    assert.equal(links.length, 3);
    assert.equal(links[0].href, 'chrome-extension://test/src/content/css/basicDarkTheme.css');
    links.forEach(link => assert.doesNotThrow(() => readSource(link.href.replace('chrome-extension://test/', ''))));
    assert.equal(messages.some(message => message.entry.event.startsWith('stylesheet-')), false);
    links[0].listeners.load();
    links[1].listeners.error();
    await setImmediate();
    const outcomes = messages.map(message => message.entry).filter(entry => entry.event.startsWith('stylesheet-'));
    assert.equal(JSON.stringify(outcomes.map(({ event, stylesheet }) => ({ event, stylesheet }))), JSON.stringify([
        { event: 'stylesheet-loaded', stylesheet: 'src/content/css/basicDarkTheme.css' },
        { event: 'stylesheet-failed', stylesheet: 'src/content/css/removeComingSoonBar.css' },
    ]));
});

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setImmediate } from 'node:timers/promises';
import vm from 'node:vm';
import test from 'node:test';

const diagnostics = readFileSync(new URL('../src/background/diagnostics.js', import.meta.url), 'utf8');

function loadDiagnostics() {
    let listener;
    let entries = [];
    let failWrite = false;
    const warnings = [];
    const context = vm.createContext({
        console: { warn: message => warnings.push(message) },
        chrome: {
            runtime: { onMessage: { addListener: callback => { listener = callback; } } },
            storage: { local: {
                get: async key => {
                    await setImmediate();
                    assert.equal(key, 'diagnosticLogs');
                    return { diagnosticLogs: structuredClone(entries) };
                },
                set: async values => {
                    await setImmediate();
                    if (failWrite) {
                        failWrite = false;
                        throw new Error('Storage unavailable');
                    }
                    entries = structuredClone(values.diagnosticLogs);
                },
            } },
        },
    });
    vm.runInContext(diagnostics, context);
    return {
        send: (message, sender = {}) => new Promise(resolve => {
            assert.equal(listener(message, sender, response => resolve(structuredClone(response))), true);
        }),
        failNextWrite: () => { failWrite = true; },
        warnings,
    };
}

test('serializes concurrent logs and records the originating tab', async () => {
    const { send } = loadDiagnostics();
    const responses = await Promise.all(Array.from({ length: 20 }, (_, index) => send({
        type: 'BY_LOG', entry: { event: `event-${index}`, tabId: -1 },
    }, { tab: { id: index } })));
    assert.ok(responses.every(response => response.ok));
    await send({ type: 'BY_LOG', entry: { event: 'background' } });
    const exported = await send({ type: 'BY_LOG_EXPORT' });
    assert.deepEqual(exported.entries, [
        ...Array.from({ length: 20 }, (_, index) => ({ event: `event-${index}`, tabId: index })),
        { event: 'background', tabId: null },
    ]);
});

test('retains the most recent 500 entries', async () => {
    const { send } = loadDiagnostics();
    await Promise.all(Array.from({ length: 505 }, (_, index) => send({
        type: 'BY_LOG', entry: { event: index },
    })));
    const { entries } = await send({ type: 'BY_LOG_EXPORT' });
    assert.deepEqual(entries.map(entry => entry.event), Array.from({ length: 500 }, (_, index) => index + 5));
});

test('rejects oversized entries without changing stored logs', async () => {
    const { send } = loadDiagnostics();
    await send({ type: 'BY_LOG', entry: { event: 'kept' } });
    assert.deepEqual(await send({ type: 'BY_LOG', entry: { event: 'x'.repeat(4096) } }), { ok: false });
    const { entries } = await send({ type: 'BY_LOG_EXPORT' });
    assert.deepEqual(entries, [{ event: 'kept', tabId: null }]);
});

test('exports and clears logs in message order', async () => {
    const { send } = loadDiagnostics();
    const responses = await Promise.all([
        send({ type: 'BY_LOG', entry: { event: 'before-clear' } }),
        send({ type: 'BY_LOG_EXPORT' }),
        send({ type: 'BY_LOG_CLEAR' }),
        send({ type: 'BY_LOG_EXPORT' }),
        send({ type: 'BY_LOG', entry: { event: 'after-clear' } }),
        send({ type: 'BY_LOG_EXPORT' }),
    ]);
    assert.deepEqual(responses, [
        { ok: true },
        { ok: true, entries: [{ event: 'before-clear', tabId: null }] },
        { ok: true },
        { ok: true, entries: [] },
        { ok: true },
        { ok: true, entries: [{ event: 'after-clear', tabId: null }] },
    ]);
});

test('continues processing queued messages after a storage failure', async () => {
    const { send, failNextWrite, warnings } = loadDiagnostics();
    failNextWrite();
    const responses = await Promise.all([
        send({ type: 'BY_LOG', entry: { event: 'failed' } }),
        send({ type: 'BY_LOG', entry: { event: 'recovered' } }),
        send({ type: 'BY_LOG_EXPORT' }),
    ]);
    assert.deepEqual(responses, [
        { ok: false },
        { ok: true },
        { ok: true, entries: [{ event: 'recovered', tabId: null }] },
    ]);
    assert.equal(warnings.length, 1);
});

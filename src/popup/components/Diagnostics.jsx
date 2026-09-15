import { useState } from 'react';
import '../../globals/diagnostics.js';

function Diagnostics() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  async function handleLogs(clear) {
    setBusy(true);
    setStatus('');
    try {
      const result = await chrome.runtime.sendMessage({ type: clear ? 'BY_LOG_CLEAR' : 'BY_LOG_EXPORT' });
      if (!result?.ok) throw new Error('Logs unavailable');
      if (clear) {
        setStatus('Logs cleared. New activity will be recorded.');
      } else {
        const report = {
          exportedAt: new Date().toISOString(),
          extensionVersion: chrome.runtime.getManifest().version,
          browser: navigator.userAgent,
          settings: globalThis.BYDiagnostics.settings(await chrome.storage.sync.get()),
          entries: result.entries
        };
        const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `betteryahoo-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setStatus('Logs exported. Attach the JSON file to your bug report.');
      }
    } catch {
      setStatus('Could not access logs. Reopen the extension popup and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section mt-15 mb-15">
      <h3 className="settingHeader">Troubleshooting</h3>
      <p className="text-sm mb-10">Export or clear diagnostic logs to help troubleshoot issues when reporting <a href="https://github.com/charleskimbac/BetterYahoo#something-not-working-or-have-a-feature-request" target="_blank">here</a>.</p>
      <div className="flex gap-10 justify-center">
        <button className="btn btn-sm" disabled={busy} onClick={() => handleLogs(false)}>Export logs</button>
        <button className="btn btn-sm" disabled={busy} onClick={() => handleLogs(true)}>Clear logs</button>
      </div>
      <p className="text-sm mt-10" role="status">{status}</p>
    </section>
  );
}

export default Diagnostics;

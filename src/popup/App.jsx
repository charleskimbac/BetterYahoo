import { useEffect, useState } from 'react';
import './App.css';
import SettingRow from './components/SettingRow';
import clog from '../globals/clog.js';

function App({ oldSettings, basicSettings, minorBasicSettings, displayContent }) {
  const [showBasicSettings, setShowBasicSettings] = useState(false);

  let basicUIClass = "section";
  useEffect(() => { // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    basicUIClass = showBasicSettings ? "section" : "section pointer-events-none text-[rgba(0,0,0,.5)]";
  }, [showBasicSettings]);

  return (
    <>
      <h1 className="mb-5 text-center text-xl font-bold">BetterYahoo</h1>
      <h2 className="text-sm" id="initialWarning" style={{display: displayContent ? "none" : "block"}}>Please open a Yahoo Mail page first.</h2>

    <div id="content" style={{display: displayContent ? "block" : "none"}}>
      <hr></hr>

      <div className="section">
        <h3 className="settingHeader">Old UI</h3>
        {oldSettings.map(setting => <SettingRow key={setting.key} enabled={setting.enabled} labelText={setting.labelText} modalText={setting.modalText} /> )}
      </div>


      <div className={basicUIClass}>
        <h3 className="settingHeader">Basic UI</h3>
        {basicSettings.map(setting => <SettingRow key={setting.key} enabled={setting.enabled} labelText={setting.labelText} modalText={setting.modalText} /> )}

        <details className="text-left">
        <summary>Minor changes</summary>

        {minorBasicSettings.map(setting => <SettingRow key={setting.key} enabled={setting.enabled} labelText={setting.labelText} modalText={setting.modalText} /> )}
      </details>
      </div>

      <div id="button-div">
        <button className="btn btn-xs" id="save-Button" onClick={saveSettings}>Save</button>
        <p id="save-message" style={{color: "green", display: "none"}}>Saved! Reload the page.</p>
      </div>

    </div>

    <script type="module" src="enableModals.js"></script>
    <script type="module" src="popup.jsx"></script>
    </>
  );
}

function saveSettings() {
  const settings = {};
  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  for (const checkbox of checkboxes) {
    settings[checkbox.id] = checkbox.checked;
  }

  chrome.storage.sync.set(settings, () => {
    clog("settings saved", settings);
  });

  const p = document.querySelector("#save-message");
  p.style.display = "block";
}

export default App;
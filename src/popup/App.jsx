import { useEffect, useState, useRef, useCallback } from 'react';
import './App.css';
import SettingRow from './components/SettingRow';
import clog from '../globals/clog.js';

function App({ oldSettings, basicSettings, minorBasicSettings, displayContent }) {
  const [basicUISectionClass, setBasicUISectionClass] = useState("");

  let setOldUIEnabled = useCallback((enabled) => {
    // disable basic ui settings if oldui enabled
    enabled ? setBasicUISectionClass("pointer-events-none text-[rgba(0,0,0,.2)]") : setBasicUISectionClass("");

    // show warning if old ui enabled
    
  }, []);

  return (
    <>
      <h1 className="mb-5 text-center text-xl font-bold">BetterYahoo</h1>
      <h2 className="text-sm" id="initialWarning" style={{display: displayContent ? "none" : "block"}}>Please open a Yahoo Mail page first.</h2>

    <div id="content" style={{display: displayContent ? "block" : "none"}}>
      <hr></hr>

      <div className="section">
        <h3 className="settingHeader">Old UI</h3>
        {oldSettings.map(setting => 
          <SettingRow key={setting.key} 
            enabled={setting.enabled} 
            labelText={setting.labelText} 
            modalText={setting.modalText} 
            setOldUIEnabled={setOldUIEnabled}
          /> )}
      
      </div>


      <div className={`section ${basicUISectionClass}`}>
        <h3 className="settingHeader">Basic UI</h3>
        {basicSettings.map(setting => <SettingRow key={setting.key} enabled={setting.enabled} labelText={setting.labelText} modalText={setting.modalText} /> )}

        <details className="text-left">
        <summary>
          <i className="cursor-pointer" 
            onMouseOver={(event) => event.target.classList.add("underline")}
            onMouseOut={(event) => event.target.classList.remove("underline")}>
            Additional minor changes
          </i>
        </summary>

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

// i will convert n make this func better one day
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
import { useState, useCallback, useEffect, useRef, React } from 'react';
import './App.css';
import Modal from './Modal.jsx';
import SettingRow from './SettingRow.jsx';
import clog from '../../globals/clog.js';

function App({ oldSettings, basicSettings, minorBasicSettings, displayContent }) {
  const [basicUISectionClass, setBasicUISectionClass] = useState("");

  const backToOldUIConfirmModal = useRef(null);

  const basicUISectionClassIfEnabled = "pointer-events-none text-[rgba(0,0,0,.2)]";
  let setOldUIEnabled = useCallback((enabled) => {
    // disable basic ui settings if oldui enabled
    enabled ? setBasicUISectionClass(basicUISectionClassIfEnabled) : setBasicUISectionClass("");

    // show warning if old ui enabled
    if (enabled)
      backToOldUIConfirmModal.current.showModal();
  }, []);

  useEffect(() => {
    if (oldSettings[0] && oldSettings[0].enabled === true) { // oldSettings[0] = backToOldUI settingObj
      setBasicUISectionClass(basicUISectionClassIfEnabled);
    }
  }, [oldSettings]);

   // ill fix this func one day
  const saveSettings = useCallback(() => {
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
    p.scrollIntoView();
  }, []);

  return (
    <>
      <h1 className="mb-5 text-center text-xl font-bold mt-[-6px]">BetterYahoo</h1>
      <h2 className="text-sm" id="initialWarning" style={{display: displayContent ? "none" : "block"}}>Please open a Yahoo Mail page first.</h2>

    <div id="content" style={{display: displayContent ? "block" : "none"}}>
      <hr></hr>

      <div className="section">
        <h3 className="settingHeader">Old UI</h3>
        {oldSettings.map(setting => 
          <SettingRow key={setting.name} 
            settingName={setting.name} 
            enabled={setting.enabled} 
            labelText={setting.labelText} 
            modalText={setting.modalText} 
            setOldUIEnabled={setting.name === "backToOldUI" ? setOldUIEnabled : null}
          /> )}
      
      </div>

      <div className={`section ${basicUISectionClass}`}>
        <h3 className="settingHeader">Basic UI</h3>
        {basicSettings.map(setting => 
          <SettingRow key={setting.name} 
            settingName={setting.name} 
            enabled={setting.enabled} 
            labelText={setting.labelText} 
            modalText={setting.modalText} 
          /> )}

        <details className="text-left">
        <summary>
          <i className="cursor-pointer" 
            onMouseOver={(event) => event.target.classList.add("underline")}
            onMouseOut={(event) => event.target.classList.remove("underline")}>
            Additional minor changes
          </i>
        </summary>

        {minorBasicSettings.map(setting => 
          <SettingRow key={setting.name} 
            settingName={setting.name} 
            enabled={setting.enabled} 
            labelText={setting.labelText} 
            modalText={setting.modalText} 
          /> )}
      </details>
      </div>

      <div id="button-div">
        <button className="btn btn-sm mt-5" id="save-Button" onClick={saveSettings}>Save settings</button>
        <p id="save-message" className="text-green-700 hidden mt-10">Saved! Reload the page.</p>
      </div>
    </div>

    <div class="fixed w-[100%] bottom-0 left-0 bg-gray-100">
      <p><a color="blue" href="https://github.com/charleskimbac/BetterYahoo" target="_blank">BetterYahoo</a> by charleskimbac. <a href="https://ko-fi.com/charleskimbac" target="_blank">Support me!</a></p>
    </div>

    <Modal ref={backToOldUIConfirmModal} closeTypes="onBRButton" BRButtonText="Continue" modalTitle="Go back to the old UI" modalText={"Please note that this feature may break at any time, should Yahoo choose to fix this workaround.\nBasic UI settings will be disabled while this setting is on."} />

    <br></br>
    <script type="module" src="enableModals.js"></script>
    <script type="module" src="popup.jsx"></script>
    </>
  );
}

export default App;
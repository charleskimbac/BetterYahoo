import InfoButtonAndModal from "./InfoButtonAndModal";

function SettingRow({ settingName, enabled, labelText, modalText, setOldUIEnabled, failed = false}) {
  return (
    <div className="text-left">
      <input className="mr-5" type="checkbox" defaultChecked={enabled} id={settingName} onChange={setOldUIEnabled ? (event) => setOldUIEnabled(event.target.checked) : null}></input>
      <label className="text-base" htmlFor={settingName}>{labelText}</label>
      { modalText && <InfoButtonAndModal modalTitle={labelText} modalText={modalText} /> }
      { failed && <span className="ml-2 text-sm font-bold text-red-700" role="status" title="Could not switch to the old UI after 3 attempts.">FAILED</span> }
    </div>
  )
}

export default SettingRow;

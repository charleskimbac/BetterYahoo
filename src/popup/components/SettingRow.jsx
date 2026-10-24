import InfoButtonAndModal from "./InfoButtonAndModal";

function SettingRow({ settingName, enabled, labelText, modalText, onEnabledChange, failed = false, className = ""}) {
  return (
    <div className={`text-left ${className}`}>
      <input className="mr-5" type="checkbox" defaultChecked={enabled} id={settingName} onChange={onEnabledChange ? (event) => onEnabledChange(event.target.checked) : null}></input>
      <label className="text-base" htmlFor={settingName}>{labelText}</label>
      { modalText && <InfoButtonAndModal modalTitle={labelText} modalText={modalText} /> }
      { failed && <span className="ml-2 text-sm font-bold text-red-700" role="status" title={`${labelText}: failed after 3 attempts.`}>FAILED</span> }
    </div>
  )
}

export default SettingRow;

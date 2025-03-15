import InfoButtonAndModal from "./InfoButtonAndModal";

function SettingRow({ enabled, labelText, modalText, setOldUIEnabled}) {
  return (
    <div className="text-left">
      <input className="mr-5" type="checkbox" defaultChecked={enabled} id={labelText} onChange={setOldUIEnabled ? (event) => setOldUIEnabled(event.target.checked) : null}></input>
      <label className="text-base" htmlFor={labelText}>{labelText}</label>
      { modalText && <InfoButtonAndModal modalTitle={labelText} modalText={modalText} /> }
    </div>
  )
}

export default SettingRow;
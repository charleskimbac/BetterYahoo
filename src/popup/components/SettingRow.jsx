import ButtonAndModal from "./ButtonAndModal";

function SettingRow({ enabled, labelText, modalText }) {
  return (
    <div className="text-left">
      <input className="mr-5" type="checkbox" defaultChecked={enabled} id={labelText}></input>
      <label className="text-base" htmlFor={labelText}>{labelText}</label>
      { modalText && <ButtonAndModal modalTitle={labelText} modalText={modalText} /> }
    </div>
  )
}

export default SettingRow;
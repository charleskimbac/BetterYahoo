import { useRef } from 'react';

function ButtonAndModal({ modalTitle, modalText }) {
  const ref = useRef(null);
  const showModal = () => {
    ref.current.showModal();
  };
  
  return ( 
  <>
    <button className="btn btn-xs btn-circle scale-[.8] text-[.9rem] mt-[-4px] ml-3" onClick={showModal}>?</button>

    <dialog ref={ref} id="my_modal_3" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 className="text-lg font-bold">{modalTitle}</h3>
        <p className="py-4">{modalText}</p>
      </div>
      
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </>
  );
}

export default ButtonAndModal;
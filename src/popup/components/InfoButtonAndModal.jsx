import { useRef } from 'react';
import Modal from './Modal';

function InfoButtonAndModal({ modalTitle, modalText }) {
  const ref = useRef(null);
  const showModal = () => {
    ref.current.showModal();
  };
  
  return ( 
  <>
    <button className="btn btn-xs btn-circle scale-[.8] text-[.9rem] mt-[-4px] ml-3" onClick={showModal}>?</button>

    <Modal ref={ref} closeTypes={["onOutsideClick", "onTRButton"]} buttonText="Close" modalText={modalText} modalTitle={modalTitle} />
  </>
  );
}

export default InfoButtonAndModal;
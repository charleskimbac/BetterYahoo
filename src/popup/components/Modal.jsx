import { forwardRef } from "react";

/** 
 * props: closeTypes, BRButtonText, modalText, modalTitle  
 * closeTypes: [ onOutsideClick, onBRButton, onTRButton ]; BR = bottom right, TR = top right  
 * BRButtonText default: "Continue"
 */
const Modal = forwardRef(function Modal({ closeTypes, BRButtonText, modalText, modalTitle }, ref) {
  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box">
        { closeTypes.includes("onTRButton") &&
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
        }

        <h3 className="text-lg font-bold">{modalTitle}</h3>
        <p className="py-4 text-sm">{modalText}</p>

        { closeTypes.includes("onBRButton") &&
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-sm">{BRButtonText || "Continue"}</button>
            </form>
          </div>
        }
      </div>
      
      { closeTypes.includes("onOutsideClick") &&
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      }
    </dialog>
  );
});

export default Modal;
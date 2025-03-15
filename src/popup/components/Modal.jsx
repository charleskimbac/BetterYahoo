import { useEffect, useRef } from "react";

/** 
 * closeTypes: [ onOutsideClick, onBRButton, onTRButton ]  
 * BR = bottom right, TR = top right
 */
function Modal({ setRef, closeTypes, BRButtonText, modalText, modalTitle }) {
  const ref = useRef(null);

  useEffect(() => {
    setRef(ref.current);
  }, [setRef]);

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box">
        { closeTypes.includes("onTRButton") &&
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
        }

        <h3 className="text-lg font-bold">{modalTitle}</h3>
        <p className="py-4">{modalText}</p>

        { closeTypes.includes("onBRButton") &&
          <div class="modal-action">
            <form method="dialog">
              <button class="btn btn-sm">{BRButtonText || "Close"}</button>
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
}

export default Modal;
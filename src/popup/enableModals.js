// where modal open buttons have class "modal-open-button and id of the modal to open"

document.querySelectorAll(".modal-open-button[open]").forEach(button => {
  button.addEventListener("click", () => {
    const modalId = button.getAttribute("open");
    const modal = document.getElementById(modalId);
    modal.showModal();
  });
});
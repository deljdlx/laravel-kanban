/**
 * Lightweight reusable Popup/Modal utility.
 * Usage:
 *  const popup = new Popup();
 *  popup.open({ title: 'Details', content: nodeOrHtmlOrFn, onClose: () => {} });
 */


// Wrapper autour du composant Modal de Tabler
// Nécessite Tabler Modal (https://tabler.io/docs/modal/)

export default class TablerModal {
  /** @type {import('tabler-ui').Modal|null} */
  modal = null;
  /** @type {Function|null} */
  onClose = null;

  /**
   * Ouvre la modal Tabler avec le contenu donné
   * @param {Object} options
   * @param {string|HTMLElement|Function} options.content
   * @param {string} [options.title]
   * @param {Function} [options.onClose]
   * @param {Array<{label:string, onClick:Function, className?:string}>} [options.buttons]
   */
  open({ content, title = '', onClose = null, buttons = [] } = {}) {
    this.close();
    this.onClose = onClose;
    // Crée le DOM de la modal Tabler
    const modalEl = document.createElement('div');
    modalEl.className = 'modal';
    modalEl.tabIndex = -1;
    modalEl.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          ${title ? `<div class="modal-header"><h5 class="modal-title">${title}</h5></div>` : ''}
          <div class="modal-body"></div>
          <div class="modal-footer"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
    // Injecte le contenu
    const body = modalEl.querySelector('.modal-body');
    let node = content;
    if (typeof content === 'function') node = content();
    if (typeof node === 'string') body.innerHTML = node;
    else if (node instanceof HTMLElement) body.appendChild(node);
    // Boutons
    const footer = modalEl.querySelector('.modal-footer');
    if (Array.isArray(buttons)) {
      for (const btn of buttons) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn ' + (btn.className || 'btn-primary');
        b.textContent = btn.label;
        b.onclick = () => {
          if (typeof btn.onClick === 'function') btn.onClick();
          this.close();
        };
        footer.appendChild(b);
      }
    }
    // Instancie Tabler Modal
    this.modal = window.Tabler?.Modal ? new window.Tabler.Modal(modalEl) : null;
    if (this.modal) {
      this.modal.show();
      modalEl.addEventListener('hidden.bs.modal', () => {
        this.close();
      });
    } else {
      modalEl.style.display = 'block';
    }
  }

  close() {
    if (this.modal) {
      this.modal.hide();
      this.modal = null;
    }
    // Supprime le DOM
    const modals = document.querySelectorAll('.modal');
    for (const m of modals) m.remove();
    if (typeof this.onClose === 'function') this.onClose();
    this.onClose = null;
  }
}

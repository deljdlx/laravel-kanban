import { Modal } from '../components/Modal.js';

/**
 * Modale pour créer une colonne dans le Kanban.
 * @class CreateColumnModal
 * @extends Modal
 */
export class CreateColumnModal extends Modal {
  constructor(board, id = 'columnModal', rootElement = null) {
    super(board, id, rootElement);

    this.title = 'Créer une colonne';
    this.setContent(this.html());
    this.setFooter(`
      <button type="button" class="btn me-auto" data-bs-dismiss="modal">Annuler</button>
      <button type="submit" class="btn btn-primary" form="column-form">Créer</button>
    `);
    this.form = this.element.querySelector('#column-form');
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.fireSave();
    });
  }

  fireSave() {
    const name = this.form.querySelector('#column-name').value.trim();
    if (!name) {
      this.displayError('Le nom de colonne est requis.');
      return;
    }
    this.fireEvent('save', { name });
  }

  html() {
    return `
      <form id="column-form">
        <div class="mb-3">
          <label for="column-name" class="form-label">Nom de la colonne</label>
          <input type="text" class="form-control" id="column-name" value="">
        </div>
      </form>
    `;
  }
}

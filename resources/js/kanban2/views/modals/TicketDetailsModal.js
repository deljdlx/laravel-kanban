import { Modal } from '../components/Modal.js';


import { Taxonomy } from '../../models/Taxonomy.js';
import { TaxonomyView } from '../components/TaxonomyView.js';

export class TicketDetailsModal extends Modal {

  constructor(board, id = 'ticketModal', rootElement = null) {
    super(id, rootElement);

    console.group('%cTicketModal.js :: 8 =============================', 'color: #544728; font-size: 1rem');
    console.log("ICI");
    console.groupEnd();

    this.board = board;
    this.title = 'Ticket Details';

    this.setContent(this.html());

    this.setFooter(`
      <button type="button" class="btn me-auto" data-bs-dismiss="modal">Close</button>
      <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Save changes</button>
    `);


    const taxonomies = this.board.getTaxonomies();
    taxonomies.forEach(taxonomy => {
      const taxonomyView = new TaxonomyView(taxonomy);
      this.contentElement.appendChild(taxonomyView.render());
    });
    
    this.saveButton = this.footerElement.querySelector('.btn-primary');
    this.form = this.element.querySelector('#ticket-form');
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.fireSave();
    });


    this.saveButton.addEventListener('click', () => {
      this.fireSave();
    });
  }

  fireSave() {
    const data = {};
    data.taxonomies = data.taxonomies || {};

    data.title = this.form.querySelector('#ticket-title').value;
    data.description = this.form.querySelector('#ticket-description').value;


    document.querySelectorAll('.kanban-taxonomy').forEach(select => {
      const taxonomyId = select.dataset.id;
      data.taxonomies[taxonomyId] = select.value;
    });

    this.fireEvent('save', data);
  }


  html() {
    return `
      <form id="ticket-form">
        <div class="mb-3">
          <label for="ticket-title" class="form-label">Title</label>
          <input type="text" class="form-control" id="ticket-title" value="">
        </div>
        <div class="mb-3">
          <label for="ticket-description" class="form-label">Description</label>
          <textarea class="form-control" id="ticket-description" rows="3"></textarea>
        </div>
      </form>
    `;
  }
}

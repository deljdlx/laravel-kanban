import { Modal } from '../components/Modal.js';
import { Ticket } from '../../models/Ticket.js';


import { Taxonomy } from '../../models/Taxonomy.js';
import { TaxonomyView } from '../components/TaxonomyView.js';

export class EditTicketModal extends Modal {

  constructor(board, ticketModel = null, id = 'ticketModal', rootElement = null) {
    super(board, id, rootElement);

    this.ticketModel = ticketModel;

    this.title = 'Ticket Details';

    this.setContent(this.html());

    this.setFooter(`
      <button type="button" class="btn me-auto" data-bs-dismiss="modal">Close</button>
      <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Save changes</button>
    `);


    const taxonomies = this.boardModel.getTaxonomies();

    console.group('%cEditTicketModal.js :: 27 =============================', 'color: #456019; font-size: 1rem');
    console.log(taxonomies);
    console.groupEnd();

    console.group('%cEditTicketModal.js :: 31 =============================', 'color: #378406; font-size: 1rem');
    console.log(this.ticketModel);
    console.groupEnd();


    taxonomies.forEach(taxonomy => {
      const taxonomyView = new TaxonomyView(
        this.boardView,
        taxonomy,
        this.ticketModel ? this.ticketModel.getTaxonomyValue(taxonomy.id) : null

      );
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
        <input type="hidden" id="ticket-id" value="${this.ticketModel ? this.ticketModel.id : ''}">
        <div class="mb-3">
          <label for="ticket-title" class="form-label">Title</label>
          <input type="text" class="form-control" id="ticket-title" value="${this.ticketModel ? this.ticketModel.getTitle() : ''}">
        </div>
        <div class="mb-3">
          <label for="ticket-description" class="form-label">Description</label>
          <textarea class="form-control" id="ticket-description" rows="3">
            ${this.ticketModel ? this.ticketModel.getDescription() : ''}
          </textarea>
        </div>
      </form>
    `;
  }
}

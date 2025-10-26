import { Modal } from '../components/Modal.js';

export class TicketModal extends Modal {

  constructor(id = 'ticketModal', rootElement = null) {
    super(id, rootElement);
    this.title = 'Ticket Details';

    this.setContent(this.html());

    this.setFooter(`
      <button type="button" class="btn me-auto" data-bs-dismiss="modal">Close</button>
      <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Save changes</button>
    `);

    
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
    const title = this.form.querySelector('#ticket-title').value;
    const description = this.form.querySelector('#ticket-description').value;

    this.fireEvent('save', { title, description });
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

import { Modal } from '../components/Modal.js';


import { Taxonomy } from '../../models/Taxonomy.js';
import { TaxonomyView } from '../components/TaxonomyView.js';


/**
 * @class
 * @property {Board} board
 * @property {Ticket} ticket
 */

export class TicketDetailsModal extends Modal {

  constructor(board, ticket, id = 'ticketDetailsModal', rootElement = null) {
    super(board, id, rootElement);


    this.ticket = ticket;

    this.title = 'Ticket Details';

    this.setContent(this.html());

    this.setFooter(`
      <button type="button" class="btn me-auto" data-bs-dismiss="modal">Close</button>
      <button type="button" class="btn btn-primary btn-edit">Edit</button>
    `);

    this.editButton = this.footerElement.querySelector('.btn-edit');
    if (this.editButton) {
      this.editButton.addEventListener('click', () => {
        this.fireEvent('edit', { ticket: this.ticket });
      });
    }
  }


  html() {
    // display ticket details in a table
    return `
      <table class="table ticket-details">
        <tr>
          <th>Title</th>
          <td class="title">${this.ticket.getTitle()}</td>
        </tr>
        <tr>
          <th>Description</th>
          <td class="description">${this.ticket.getDescription()}</td>
        </tr>
        ${Object.values(this.boardModel.getTaxonomies()).map(taxonomy => `
          <tr>
            <th>${taxonomy.getName()}</th>
            <td class="taxonomy">${taxonomy.getNameByValue(this.ticket.getTaxonomies()[taxonomy.getName()])}</td>
          </tr>
        `).join('')}
      </table>
    `;
  }
}

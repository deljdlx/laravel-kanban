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


    console.group('%cTicketDetailsModal.js :: 17 =============================', 'color: #230547; font-size: 1rem');
    console.log(this.ticket.getTaxonomies());
    console.groupEnd();


    this.setContent(this.html());

    this.setFooter(`
      <button type="button" class="btn me-auto" data-bs-dismiss="modal">Close</button>
      <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Save changes</button>
    `);
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
            <td class="taxonomy">${taxonomy.getNameByValue(this.ticket.getTaxonomies()[taxonomy.id])}</td>
          </tr>
        `).join('')}
      </table>
    `;
  }
}

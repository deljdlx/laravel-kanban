import { Ticket } from '../models/Ticket.js';
import { TicketDetailsModal } from './modals/TicketDetailsModal.js';
import { View } from './View.js';

/** @class
 * 
 * 
 * 
*/
export class TicketView extends View{
  /**
   * @param {Ticket} ticket
   */
  constructor(board, ticket) {

    super(board);

    this.ticket = ticket;
    this.model = ticket;

    this.element = document.createElement('div');
    this.element.model = this.ticket;
    this.element.className = 'kanban-ticket';
    this.element.dataset.id = this.ticket.id;

    const title = document.createElement('h4');
    title.className = 'kanban-ticket-title';
    title.textContent = this.ticket.title;
    this.element.appendChild(title);

    this.renderTaxonomies();

    const description = document.createElement('div');
    description.className = 'kanban-ticket-description';
    description.textContent = this.ticket.getDescription();
    this.element.appendChild(description);

    this.element.addEventListener('click', () => {
      this.showDetails();
    });
  }

  showDetails() {
    const detailsModal = new TicketDetailsModal(
      this.boardView,
      this.ticket
    );
    detailsModal.open();
  }


  renderTaxonomies() {
    const taxonomies = this.ticket.getTaxonomies();
    for (const [taxonomyId, termId] of Object.entries(taxonomies)) {


      const taxonomy = this.boardModel.getTaxonomyById(taxonomyId);
      if (!taxonomy) {
        continue;
      }

      const term = taxonomy.getTermById(termId);
      if (!term) {
        continue;
      }

      
      const taxoDiv = document.createElement('div');

      taxoDiv.textContent = `Term ${term.getName()}`;
      
      taxoDiv.dataset.taxonomyId = taxonomyId;
      taxoDiv.dataset.termId = termId;
      
      taxoDiv.classList.add(
        'badge',
        'kanban-ticket-taxonomy',
        `taxonomy--${termId}`,
        `term--${termId}`
      );

      this.element.appendChild(taxoDiv);

      this.element.classList.add(`has-taxonomy--${taxonomyId}`, `has--term-${termId}`);

    }
  }

  /**
   * @returns {HTMLElement}
   */
  render() {
    // IMPORTANT : l’élément DRAGGABLE doit être l’enfant direct de .kanban-tickets





    return this.element;
  }
}
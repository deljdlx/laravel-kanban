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

    console.group('%cTicketView.js :: 45 =============================', 'color: #362619; font-size: 1rem');
    console.log(this.board);
    console.groupEnd();

    const detailsModal = new TicketDetailsModal(
      this.board,
      this.ticket
    );
    detailsModal.open();
  }


  renderTaxonomies() {
    const taxonomies = this.ticket.getTaxonomies();
    for (const [taxonomyId, termId] of Object.entries(taxonomies)) {
      const taxoDiv = document.createElement('div');

      taxoDiv.textContent = `Term ${termId}`;
      
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
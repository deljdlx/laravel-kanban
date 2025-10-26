import { Ticket } from '../models/Ticket.js';
import { TicketDetailsModal } from './modals/TicketDetailsModal.js';

/** @class */
export class TicketView {
  /**
   * @param {Ticket} ticket
   */
  constructor(board, ticket) {


    console.group('%cTicketView.js :: 12 =============================', 'color: #173347; font-size: 1rem');
    console.log(board);
    console.groupEnd();

    console.group('%cTicketView.js :: 16 =============================', 'color: #225976; font-size: 1rem');
    console.log(ticket);
    console.groupEnd();

    this.board = board;
    this.ticket = ticket;

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
    const detailsModal = new TicketDetailsModal(this.ticket);
    $detailsModal.show();
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
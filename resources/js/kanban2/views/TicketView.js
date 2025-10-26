/** @class */
export class TicketView {
  /**
   * @param {Ticket} ticket
   */
  constructor(ticket) {
    this.ticket = ticket;

    this.element = document.createElement('div');
    this.element.model = this.ticket;
    this.element.className = 'kanban-ticket';
    this.element.dataset.id = this.ticket.id;

    const title = document.createElement('h4');
    title.className = 'kanban-ticket-title';
    title.textContent = this.ticket.title;
    this.element.appendChild(title);


    const meta = document.createElement('div');
    meta.className = 'kanban-ticket-meta';
    meta.textContent = this.ticket.getDescription();

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
      meta.appendChild(taxoDiv);

      this.element.classList.add(`has-taxonomy--${taxonomyId}`, `has--term-${termId}`);

    }

    this.element.appendChild(meta);




  }

  /**
   * @returns {HTMLElement}
   */
  render() {
    // IMPORTANT : l’élément DRAGGABLE doit être l’enfant direct de .kanban-tickets





    return this.element;
  }
}
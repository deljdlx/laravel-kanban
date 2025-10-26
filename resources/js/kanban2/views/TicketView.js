/** @class */
export class TicketView {
  /**
   * @param {Ticket} ticket
   */
  constructor(ticket) {
    this.ticket = ticket;
  }

  /**
   * @returns {HTMLElement}
   */
  render() {
    // IMPORTANT : l’élément DRAGGABLE doit être l’enfant direct de .kanban-tickets
    const el = document.createElement('div');
    el.className = 'kanban-ticket';
    el.dataset.id = this.ticket.id;

    const title = document.createElement('h4');
    title.className = 'kanban-ticket-title';
    title.textContent = this.ticket.title;

    const meta = document.createElement('div');
    meta.className = 'kanban-ticket-meta';
    meta.textContent = this.ticket?.meta?.hint ?? '';

    el.appendChild(title);
    el.appendChild(meta);
    return el;
  }
}
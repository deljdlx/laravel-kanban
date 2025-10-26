/**
 * Vue d'un ticket du Kanban.
 * @class
 * @property {Ticket} ticket
 */
export class TicketView {
  /**
   * @param {Ticket} ticket
   */
  constructor(ticket) {
    this.ticket = ticket;
  }

  /**
   * Rend le ticket en DOM
   * @returns {HTMLElement}
   */
  render() {
    const tDiv = document.createElement('div');
    tDiv.className = 'kanban-ticket';
    tDiv.id = this.ticket.id;
    tDiv.draggable = true;
    // Drag events
    tDiv.addEventListener('dragstart', e => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', this.ticket.id);
      setTimeout(() => { tDiv.style.display = 'none'; }, 0);
    });
    tDiv.addEventListener('dragend', e => { tDiv.style.display = ''; });
    // Touch events (mobile)
    tDiv.addEventListener('touchstart', e => { tDiv.style.opacity = '0.5'; });
    tDiv.addEventListener('touchend', e => { tDiv.style.opacity = '1'; });
    tDiv.addEventListener('touchmove', e => {
      const touch = e.touches[0];
      const elem = document.elementFromPoint(touch.clientX, touch.clientY);
      if (elem && elem.classList.contains('kanban-tickets') && elem !== tDiv.parentNode) {
        elem.appendChild(tDiv);
      }
    });
    // Content
    const titleDiv = document.createElement('div');
    titleDiv.className = 'kanban-ticket-title';
    titleDiv.textContent = this.ticket.title;
    tDiv.appendChild(titleDiv);
    const descDiv = document.createElement('div');
    descDiv.className = 'kanban-ticket-desc';
    descDiv.textContent = this.ticket.description;
    tDiv.appendChild(descDiv);
    return tDiv;
  }
}

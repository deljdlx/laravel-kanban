/**
 * Vue principale du Kanban.
 * @class
 * @property {HTMLElement} root
 */
export class KanbanView {
  /**
   * @param {HTMLElement} rootElement
   */
  constructor(rootElement) {
    this.root = rootElement;
  }

  /**
   * Affiche le board avec colonnes et tickets
   * @param {Column[]} columns
   */
  renderBoard(columns) {
    this.root.innerHTML = '';
    const board = document.createElement('div');
    board.className = 'kanban-board';
    columns.forEach(col => {
      board.appendChild(this._renderColumn(col));
    });
    this.root.appendChild(board);
  }

  /**
   * Rend une colonne du Kanban
   * @param {Column} col
   * @returns {HTMLElement}
   */
  _renderColumn(col) {
    const colDiv = document.createElement('div');
    colDiv.className = 'kanban-column';
    const titleDiv = document.createElement('div');
    titleDiv.className = 'kanban-column-title';
    titleDiv.textContent = col.name;
    colDiv.appendChild(titleDiv);
    const ticketsList = document.createElement('div');
    ticketsList.className = 'kanban-tickets';
    ticketsList.dataset.columnId = col.id;
    // Drag&Drop events
    ticketsList.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    ticketsList.addEventListener('drop', e => {
      e.preventDefault();
      const ticketId = e.dataTransfer.getData('text/plain');
      const ticketElem = document.getElementById(ticketId);
      if (ticketElem && ticketsList !== ticketElem.parentNode) {
        ticketsList.appendChild(ticketElem);
      }
    });
    // Mobile drag&drop (touch)
    ticketsList.addEventListener('touchmove', e => { e.preventDefault(); });
    col.tickets.forEach(ticket => {
      ticketsList.appendChild(this._renderTicket(ticket));
    });
    colDiv.appendChild(ticketsList);
    return colDiv;
  }

  /**
   * Rend un ticket du Kanban
   * @param {Ticket} ticket
   * @returns {HTMLElement}
   */
  _renderTicket(ticket) {
    const tDiv = document.createElement('div');
    tDiv.className = 'kanban-ticket';
    tDiv.id = ticket.id;
    tDiv.draggable = true;
    // Drag events
    tDiv.addEventListener('dragstart', e => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', ticket.id);
      setTimeout(() => { tDiv.style.display = 'none'; }, 0); // cache le ticket pendant le drag
    });
    tDiv.addEventListener('dragend', e => {
      tDiv.style.display = '';
    });
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
    titleDiv.textContent = ticket.title;
    tDiv.appendChild(titleDiv);
    const descDiv = document.createElement('div');
    descDiv.className = 'kanban-ticket-desc';
    descDiv.textContent = ticket.description;
    tDiv.appendChild(descDiv);
    return tDiv;
  }
}

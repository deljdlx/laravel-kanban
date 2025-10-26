/**
 * Vue d'une colonne du Kanban.
 * @class
 * @property {Column} column
 */
import { TicketView } from './TicketView.js';

export class ColumnView {
  /**
   * @param {Column} column
   */
  constructor(column) {
    this.column = column;
  }

  /**
   * Rend la colonne en DOM
   * @returns {HTMLElement}
   */
  render() {
    const colDiv = document.createElement('div');
    colDiv.className = 'kanban-column';
    const titleDiv = document.createElement('div');
    titleDiv.className = 'kanban-column-title';
    titleDiv.textContent = this.column.name;
    colDiv.appendChild(titleDiv);
    const ticketsList = document.createElement('div');
    ticketsList.className = 'kanban-tickets';
    ticketsList.dataset.columnId = this.column.id;
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
    this.column.tickets.forEach(ticket => {
      const ticketView = new TicketView(ticket);
      ticketsList.appendChild(ticketView.render());
    });
    colDiv.appendChild(ticketsList);
    return colDiv;
  }
}

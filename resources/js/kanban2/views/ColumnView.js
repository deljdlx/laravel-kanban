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
      // Highlight drop target
      const afterElem = this._getDragAfterElement(ticketsList, e.clientY);
      if (afterElem) {
        afterElem.style.borderTop = '2px solid #2a9d8f';
      }
    });
    ticketsList.addEventListener('dragleave', e => {
      Array.from(ticketsList.children).forEach(child => child.style.borderTop = '');
    });
    ticketsList.addEventListener('drop', e => {
      e.preventDefault();
      Array.from(ticketsList.children).forEach(child => child.style.borderTop = '');
      const ticketId = e.dataTransfer.getData('text/plain');
      const ticketElem = document.getElementById(ticketId);
      if (!ticketElem) return;
      const afterElem = this._getDragAfterElement(ticketsList, e.clientY);
      if (afterElem) {
        ticketsList.insertBefore(ticketElem, afterElem);
      } else {
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

  /**
   * Trouve l'élément ticket après lequel insérer le ticket déplacé
   * @param {HTMLElement} container
   * @param {number} y
   * @returns {HTMLElement|null}
   */
  _getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.kanban-ticket:not([style*="display: none"])')];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    }, { offset: -Infinity, element: null }).element;
  }
}

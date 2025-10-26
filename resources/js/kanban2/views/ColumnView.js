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
    this._placeholder = null;
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
    this._bindDragAndDropEvents(ticketsList);
    this.column.tickets.forEach(ticket => {
      const ticketView = new TicketView(ticket);
      ticketsList.appendChild(ticketView.render());
    });
    colDiv.appendChild(ticketsList);
    return colDiv;
  }

  /**
   * Ajoute les événements drag&drop à la colonne
   * @param {HTMLElement} ticketsList
   * @private
   */
  _bindDragAndDropEvents(ticketsList) {
    ticketsList.addEventListener('dragover', e => this._onDragOver(e, ticketsList));
    ticketsList.addEventListener('dragleave', e => this._onDragLeave(e, ticketsList));
    ticketsList.addEventListener('drop', e => this._onDrop(e, ticketsList));
    ticketsList.addEventListener('touchmove', e => { e.preventDefault(); });
  }

  _onDragOver(e, container) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this._showPlaceholder(container, e.clientY, true);
  }

  _onDragLeave(e, container) {
    this._removePlaceholder(container);
  }

  _onDrop(e, container) {
    e.preventDefault();
    this._removePlaceholder(container);
    const ticketId = e.dataTransfer.getData('text/plain');
    const ticketElem = document.getElementById(ticketId);
    if (!ticketElem) return;
    const afterElem = this._getDragAfterElement(container, e.clientY);
    if (afterElem) {
      container.insertBefore(ticketElem, afterElem);
    } else {
      container.appendChild(ticketElem);
    }
  }

  _getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.kanban-ticket:not([style*="display: none"]):not(.kanban-placeholder)')];
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

  _showPlaceholder(container, y, alwaysShow = false) {
    this._removePlaceholder(container);
    const afterElem = this._getDragAfterElement(container, y);
    const placeholder = document.createElement('div');
    placeholder.className = 'kanban-ticket kanban-placeholder';
    placeholder.style.height = '48px';
    placeholder.style.background = '#e0e7ef';
    placeholder.style.border = '2px dashed #2a9d8f';
    placeholder.style.margin = '4px 0';
    if (afterElem) {
      container.insertBefore(placeholder, afterElem);
    } else if (alwaysShow || container.children.length === 0) {
      container.appendChild(placeholder);
    }
    this._placeholder = placeholder;
  }

  _removePlaceholder(container) {
    if (this._placeholder && container.contains(this._placeholder)) {
      container.removeChild(this._placeholder);
      this._placeholder = null;
    }
  }
}

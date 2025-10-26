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
    // Drag&Drop events
    ticketsList.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      // Correction : toujours afficher le placeholder même si la colonne est vide
      this._showPlaceholder(ticketsList, e.clientY, true);
    });
    ticketsList.addEventListener('dragleave', e => {
      this._removePlaceholder(ticketsList);
    });
    ticketsList.addEventListener('drop', e => {
      e.preventDefault();
      this._removePlaceholder(ticketsList);
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

  /**
   * Affiche un placeholder visuel pour indiquer où le ticket sera inséré
   * @param {HTMLElement} container
   * @param {number} y
   * @param {boolean} [alwaysShow=false] - Toujours afficher le placeholder
   */
  _showPlaceholder(container, y, alwaysShow = false) {
    this._removePlaceholder(container);
    const afterElem = this._getDragAfterElement(container, y);
    const placeholder = document.createElement('div');
    placeholder.className = 'kanban-ticket kanban-placeholder';
    placeholder.style.height = '48px';
    placeholder.style.background = '#e0e7ef';
    placeholder.style.border = '2px dashed #2a9d8f';
    placeholder.style.margin = '4px 0';
    // Correction : si colonne vide, appendChild
    if (afterElem) {
      container.insertBefore(placeholder, afterElem);
    } else if (alwaysShow || container.children.length === 0) {
      container.appendChild(placeholder);
    }
    this._placeholder = placeholder;
  }

  /**
   * Enlève le placeholder visuel
   * @param {HTMLElement} container
   */
  _removePlaceholder(container) {
    if (this._placeholder && container.contains(this._placeholder)) {
      container.removeChild(this._placeholder);
      this._placeholder = null;
    }
  }
}

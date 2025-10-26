import { TicketView } from './TicketView.js';

/** @class */
export class ColumnView {
  /**
   * @param {Column} column
   */
  constructor(column) {
    this.column = column;
  }

  /**
   * @returns {HTMLElement}
   */
  render() {
    const colDiv = document.createElement('div');
    colDiv.className = 'kanban-column';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'kanban-column-title';
    titleDiv.textContent = this.column.name;
    colDiv.appendChild(titleDiv);

    const list = document.createElement('div');
    list.className = 'kanban-tickets';
    list.dataset.columnId = this.column.id;

    this.column.tickets.forEach(t => {
      const view = new TicketView(t);
      list.appendChild(view.render());
    });

    colDiv.appendChild(list);
    return colDiv;
  }
}

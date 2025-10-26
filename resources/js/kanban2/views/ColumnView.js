/**
 * Vue d'une colonne du Kanban.
 * @class
 * @property {Column} column
 */
import { TicketView } from './TicketView.js';

export class ColumnView {
  constructor(column) {
    this.column = column;
  }

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
    this.column.tickets.forEach(ticket => {
      const ticketView = new TicketView(ticket);
      ticketsList.appendChild(ticketView.render());
    });
    colDiv.appendChild(ticketsList);


    return colDiv;
  }
}

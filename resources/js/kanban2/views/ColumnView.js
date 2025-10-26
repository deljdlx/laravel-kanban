import { TicketView } from './TicketView.js';
import { View } from './View.js';

import { EditTicketModal } from './modals/EditTicketModal.js';

/** @class
 * @property {Column} column
 * @property {Object} listeners
*/
export class ColumnView extends View {
  /**
   * @param {Column} column
   */
  constructor(board, column) {

    super(board);

    this.column = column;
    this.model = column;
  }



  addTicket(ticket) {
    const view = new TicketView(this.boardView, ticket);
    this.list.appendChild(view.render());
  }


  /**
   * @returns {HTMLElement}
   */
  render() {
    this.element = document.createElement('div');
    this.element.model = this.column;

    this.element.className = 'kanban-column';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'kanban-column-title';
    titleDiv.textContent = this.column.getName();
    this.element.appendChild(titleDiv);

    this.list = document.createElement('div');
    this.list.className = 'kanban-tickets';
    this.list.dataset.columnId = this.column.id;

    this.column.tickets.forEach(ticket => {
      const view = new TicketView(this.boardView, ticket);
      this.list.appendChild(view.render());
    });

    this.element.appendChild(this.list);

    const addTicketBtn = document.createElement('button');
    addTicketBtn.className = 'kanban-add-ticket-btn';
    addTicketBtn.textContent = '+ Add Ticket';
    addTicketBtn.classList.add('btn', 'btn-primary', 'kanban-add-ticket-btn');
    addTicketBtn.addEventListener('click', () => {
      this.fireAddTicket(null);
    });

    this.element.appendChild(addTicketBtn);

    return this.element;
  }

  fireAddTicket() {
    this.fireEvent('addTicket', { 
      column: this.column
     });
  }
}

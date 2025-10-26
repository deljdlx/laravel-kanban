import { TicketView } from './TicketView.js';

/** @class
 * @property {Column} column
 * @property {Object} listeners
*/
export class ColumnView {
  /**
   * @param {Column} column
   */
  constructor(column) {
    this.column = column;
    this.listeners = {};
  }

  addEventListener(eventName, callback) {
    if (!this.listeners[eventName]) this.listeners[eventName] = [];
    this.listeners[eventName].push(callback);
  }

  fireEvent(eventName, detail = {}) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(cb => cb({ type: eventName, detail }));
    }
  }

  addTicket(ticket) {
    const view = new TicketView(ticket);
    this.list.appendChild(view.render());
  }

  /**
   * @returns {HTMLElement}
   */
  render() {
    this.container = document.createElement('div');
    this.container.className = 'kanban-column';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'kanban-column-title';
    titleDiv.textContent = this.column.name;
    this.container.appendChild(titleDiv);

    this.list = document.createElement('div');
    this.list.className = 'kanban-tickets';
    this.list.dataset.columnId = this.column.id;

    this.column.tickets.forEach(t => {
      const view = new TicketView(t);
      this.list.appendChild(view.render());
    });

    this.container.appendChild(this.list);

    const addTicketBtn = document.createElement('button');
    addTicketBtn.className = 'kanban-add-ticket-btn';
    addTicketBtn.textContent = '+ Add Ticket';
    addTicketBtn.classList.add('btn', 'btn-primary', 'kanban-add-ticket-btn');
    addTicketBtn.addEventListener('click', () => {
      this.fireAddTicket(null);
    });

    this.container.appendChild(addTicketBtn);

    return this.container;
  }

  fireAddTicket() {

    console.group('%cColumnView.js :: 65 =============================', 'color: #485785; font-size: 1rem');
    console.log('fireAddTicket called');
    console.groupEnd();

    this.fireEvent('addTicket', { 
      column: this.column
     });
  }
}

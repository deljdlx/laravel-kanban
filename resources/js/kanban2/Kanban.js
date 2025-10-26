
import { BoardView } from './views/BoardView.js';
import { Modal } from './views/components/Modal.js';

import { BoardController } from './controllers/BoardController.js';

import { Ticket } from './models/Ticket.js';


import { TicketModal } from './views/modals/TicketModal.js';

/** @class
 * @property {Board} board
 * @property {BoardView} view
 * @property {HTMLElement} rootElement
 */

export class Kanban {

  constructor(board, rootElement = null) {
    this.board = board;


    this.rootElement = /** @type {HTMLElement} */ (document.querySelector(rootElement));
    this.view = new BoardView(this.rootElement, this.board);
    this.mainModal = new Modal('mainModal');

    this.boardController = new BoardController(this.board, this.view);
  }

  render() {
    this.mainModal.render();
    this.view.render();

    this.initColumns();
    this.handleTicketMove();
  }

  initColumns() {
    this.view.getColumns().forEach(colView => {
      colView.addEventListener('addTicket', (e) => {
        this.handleAddTicket(e);
      });
    });
  }

  handleAddTicket(e) {
    const { column } = e.detail;
    const ticketModal = new TicketModal();
    ticketModal.render();
    ticketModal.addEventListener('save', (ev => {
      const { title, description } = ev.detail;
      const newTicket = new Ticket(title, {hint: description});
      this.boardController.addTicketToColumn(column.id, newTicket);
    }));
    ticketModal.open();
  }

  handleTicketMove() {
    this.view.addEventListener('ticketMoved', (e) => {
      const { ticketId, toColumnId, toIndex } = e.detail;
      this.boardController.moveTicket(ticketId, toColumnId, toIndex);
    });

    this.view.addEventListener('ticketReordered', (e) => {
      const { ticketId, newIndex } = e.detail;
      this.boardController.reorderInsideColumn(ticketId, newIndex);
    });
  }
}

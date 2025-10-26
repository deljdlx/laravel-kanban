
import { BoardView } from './views/BoardView.js';


import { BoardController } from './controllers/BoardController.js';


/** @class
 * @property {Board} board
 * @property {BoardView} view
 * @property {HTMLElement} rootElement
 */

export class Kanban {

  constructor(board) {
    this.board = board;
  }

  render(rootElement) {
    this.rootElement = /** @type {HTMLElement} */ (document.querySelector(rootElement));
    this.view = new BoardView(this.rootElement, this.board);

    this.view.addEventListener('ticketMoved', (e) => {
      const { ticketId, toColumnId, toIndex } = e.detail;

      const controller = new BoardController(this.board, this.view);
      controller.moveTicket(ticketId, toColumnId, toIndex);

      // this.board.moveTicket(ticketId, toColumnId, toIndex);
    });

    this.view.addEventListener('ticketReordered', (e) => {
      const { ticketId, newIndex } = e.detail;
      const controller = new BoardController(this.board, this.view);
      controller.reorderTicketInsideColumn(ticketId, newIndex);


      // this.board.reorderInsideColumn(ticketId, newIndex);
    });


    this.view.render();
  }
}

export class BoardController {

  constructor(board, view) {
    this.board = board;
    this.view = view;
  }

  addTicketToColumn(columnId, ticket) {
    const column = this.board.column(columnId);
    if (!column) return false;

    column.addTicket(ticket);

    const columView = this.view.getColumnById(columnId);
    columView.addTicket(ticket);

    return true;
  }


  /**
   * Déplace un ticket (inter ou intra colonne) et l’insère à l’index demandé.
   * @param {string} ticketId
   * @param {string} toColumnId
   * @param {number} toIndex
   * @returns {boolean}
   */
  moveTicket(ticketId, toColumnId, toIndex) {
    const located = this.locateTicket(ticketId);
    if (!located) return false;

    const { ticket, column: fromCol } = located;
    const toCol = this.board.column(toColumnId);
    if (!toCol) return false;

    // Retire de la source
    fromCol.removeById(ticketId);
    // Insère dans la cible
    toCol.insertAt(ticket, toIndex);
    return true;
  }

  /**
   * Réordonne un ticket à l’intérieur de sa colonne.
   * @param {string} ticketId
   * @param {number} newIndex
   * @returns {boolean}
   */
  reorderInsideColumn(ticketId, newIndex) {
    const located = this.locateTicket(ticketId);
    if (!located) return false;

    const { ticket, column, index: oldIndex } = located;
    if (oldIndex === newIndex) return true;

    column.tickets.splice(oldIndex, 1);
    column.insertAt(ticket, newIndex);
    return true;
  }


  /**
   * Trouve le ticket et sa colonne d’origine.
   * @param {string} ticketId
   * @returns {{ticket: Ticket, column: Column, index: number}|null}
   */
  locateTicket(ticketId) {
    for (const col of this.board.columns) {
      const idx = col.tickets.findIndex(t => t.id === ticketId);
      if (idx !== -1) return { ticket: col.tickets[idx], column: col, index: idx };
    }
    return null;
  }

}
